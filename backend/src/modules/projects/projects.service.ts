import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FilterProjectDto } from './dto/filter-project.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { MediaService } from '../media/media.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { generateSlug } from '../../common/utils/slug.util';

const ALLOWED_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'order',
  'completionDate',
  'title',
];

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private readonly mediaService: MediaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private async syncMedia(project: Project) {
    const coverImages = project.coverImage ? [project.coverImage] : [];
    await this.mediaService.syncUsage(
      coverImages,
      'Project',
      project._id.toString(),
      'coverImage',
    );
    await this.mediaService.syncUsage(
      project.gallery || [],
      'Project',
      project._id.toString(),
      'gallery',
    );
    const ogImages = project.seo?.ogImage ? [project.seo.ogImage] : [];
    await this.mediaService.syncUsage(
      ogImages,
      'Project',
      project._id.toString(),
      'seo.ogImage',
    );
  }

  async create(
    createProjectDto: CreateProjectDto,
    req?: any,
  ): Promise<Project> {
    const slug = this.normalizeSlug(
      createProjectDto.slug || createProjectDto.title,
    );
    await this.assertSlugIsAvailable(slug);
    const project = new this.projectModel({
      ...createProjectDto,
      slug,
    });
    const saved = await project.save();
    await this.syncMedia(saved);

    // Audit Log
    await this.auditLogsService.log({
      action: 'project.created',
      resource: 'Project',
      resourceId: saved._id.toString(),
      after: saved.toObject(),
      request: req,
    });

    return saved;
  }

  async findAllPublic(filterDto: FilterProjectDto) {
    return this.findAll({ ...filterDto, isPublished: true }, true);
  }

  async findAllAdmin(filterDto: FilterProjectDto) {
    return this.findAll(filterDto, false);
  }

  async findOnePublic(slug: string): Promise<Project> {
    const project = await this.projectModel.findOneAndUpdate(
      {
        slug,
        isPublished: true,
        isArchived: false,
      },
      { $inc: { views: 1 } },
      { new: true },
    );
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async findOneAdmin(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    req?: any,
  ): Promise<Project> {
    const oldProject = await this.projectModel.findById(id);
    if (!oldProject) {
      throw new NotFoundException('Project not found');
    }
    const before = oldProject.toObject();

    const updateData: any = {
      ...updateProjectDto,
    };
    if (updateProjectDto.slug || updateProjectDto.title) {
      const nextSlug = this.normalizeSlug(
        updateProjectDto.slug || updateProjectDto.title || oldProject.slug,
      );
      if (nextSlug !== oldProject.slug) {
        await this.assertSlugIsAvailable(nextSlug, id);
        updateData.slug = nextSlug;
      }
    }
    const project = await this.projectModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.syncMedia(project);

    // Audit Log
    await this.auditLogsService.log({
      action: 'project.updated',
      resource: 'Project',
      resourceId: project._id.toString(),
      before,
      after: project.toObject(),
      request: req,
    });

    return project;
  }

  async publish(id: string, isPublished: boolean, req?: any): Promise<Project> {
    const oldProject = await this.projectModel.findById(id);
    if (!oldProject) {
      throw new NotFoundException('Project not found');
    }
    const before = oldProject.toObject();

    const project = await this.projectModel.findByIdAndUpdate(
      id,
      { isPublished },
      { new: true },
    );
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Audit Log
    await this.auditLogsService.log({
      action: isPublished ? 'project.published' : 'project.unpublished',
      resource: 'Project',
      resourceId: project._id.toString(),
      before,
      after: project.toObject(),
      request: req,
    });

    return project;
  }

  async reorder(
    items: { id: string; order: number }[],
    req?: any,
  ): Promise<void> {
    await Promise.all(
      items.map((item) =>
        this.projectModel
          .updateOne({ _id: item.id }, { order: item.order })
          .exec(),
      ),
    );

    // Audit Log
    await this.auditLogsService.log({
      action: 'project.reordered',
      resource: 'Project',
      metadata: { items },
      request: req,
    });
  }

  async remove(id: string, req?: any): Promise<void> {
    const oldProject = await this.projectModel.findById(id);
    if (!oldProject) {
      throw new NotFoundException('Project not found');
    }
    const before = oldProject.toObject();

    const result = await this.projectModel.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true },
    );
    if (!result) {
      throw new NotFoundException('Project not found');
    }

    // Audit Log
    await this.auditLogsService.log({
      action: 'project.archived',
      resource: 'Project',
      resourceId: id,
      before,
      after: result.toObject(),
      request: req,
    });
  }

  private async findAll(filterDto: FilterProjectDto, publicOnly: boolean) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'order',
      sortOrder = 'asc',
      category,
      status,
      technology,
      isPublished,
    } = filterDto;

    if (sortBy && !ALLOWED_SORT_FIELDS.includes(sortBy)) {
      throw new BadRequestException(`Sorting by ${sortBy} is not allowed`);
    }

    const query: Record<string, unknown> = {};
    if (publicOnly) {
      query.isPublished = true;
      query.isArchived = false;
    } else {
      query.isArchived = { $ne: true };
      if (isPublished !== undefined) {
        query.isPublished = isPublished;
      }
    }
    if (category) query.category = category;
    if (status) query.status = status;
    if (technology) query.technologies = technology;
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 } as Record<
      string,
      1 | -1
    >;

    const [data, total] = await Promise.all([
      this.projectModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.projectModel.countDocuments(query),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  private normalizeSlug(value: string): string {
    const slug = generateSlug(value);
    if (!slug) {
      throw new BadRequestException('Slug cannot be empty');
    }
    return slug;
  }

  private async assertSlugIsAvailable(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.projectModel.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (existing) {
      throw new ConflictException('Project slug already exists');
    }
  }
}
