import {
  BadRequestException,
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
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project = new this.projectModel({
      ...createProjectDto,
      slug: createProjectDto.slug || this.generateSlug(createProjectDto.title),
    });
    return project.save();
  }

  async findAllPublic(filterDto: FilterProjectDto) {
    return this.findAll({ ...filterDto, isPublished: true }, true);
  }

  async findAllAdmin(filterDto: FilterProjectDto) {
    return this.findAll(filterDto, false);
  }

  async findOnePublic(slug: string): Promise<Project> {
    const project = await this.projectModel.findOne({
      slug,
      isPublished: true,
    });
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
  ): Promise<Project> {
    const updateData = {
      ...updateProjectDto,
      ...(updateProjectDto.title && !updateProjectDto.slug
        ? { slug: this.generateSlug(updateProjectDto.title) }
        : {}),
    };
    const project = await this.projectModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async publish(id: string, isPublished: boolean): Promise<Project> {
    const project = await this.projectModel.findByIdAndUpdate(
      id,
      { isPublished },
      { new: true },
    );
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async reorder(items: { id: string; order: number }[]): Promise<void> {
    await Promise.all(
      items.map((item) =>
        this.projectModel
          .updateOne({ _id: item.id }, { order: item.order })
          .exec(),
      ),
    );
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectModel.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true },
    );
    if (!result) {
      throw new NotFoundException('Project not found');
    }
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

    const query: Record<string, unknown> = { isArchived: { $ne: true } };
    if (publicOnly) {
      query.isPublished = true;
    } else if (isPublished !== undefined) {
      query.isPublished = isPublished;
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

  private generateSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
