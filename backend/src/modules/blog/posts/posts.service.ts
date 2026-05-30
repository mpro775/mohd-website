import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostStatus } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';
import { createPaginatedResponse } from '../../../common/utils/pagination.util';

const ALLOWED_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'publishDate',
  'title',
  'views',
  'readTime',
];

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async create(createPostDto: CreatePostDto, authorId: string): Promise<Post> {
    const post = new this.postModel({
      ...createPostDto,
      slug: this.generateSlug(createPostDto.title),
      readTime:
        createPostDto.readTime || this.calculateReadTime(createPostDto.content),
      author: authorId,
    });
    return post.save();
  }

  async findAllPublic(filterDto: FilterPostDto) {
    return this.findAll(filterDto, true);
  }

  async findAllAdmin(filterDto: FilterPostDto) {
    return this.findAll(filterDto, false);
  }

  async findOneAdmin(id: string): Promise<Post> {
    const post = await this.withPopulates(this.postModel.findById(id));
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async findBySlugPublic(slug: string): Promise<Post> {
    const post = await this.withPopulates(
      this.postModel.findOne({
        slug,
        status: PostStatus.PUBLISHED,
        publishDate: { $lte: new Date() },
      }),
    );

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.views += 1;
    await post.save();
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const updateData: any = { ...updatePostDto };
    if (updatePostDto.title) {
      updateData.slug = this.generateSlug(updatePostDto.title);
    }
    if (updatePostDto.content && !updatePostDto.readTime) {
      updateData.readTime = this.calculateReadTime(updatePostDto.content);
    }
    updateData.updatedDate = new Date();

    const post = await this.postModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async setStatus(id: string, status: PostStatus): Promise<Post> {
    const post = await this.postModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async remove(id: string): Promise<void> {
    const result = await this.postModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Post not found');
    }
  }

  private async findAll(filterDto: FilterPostDto, publicOnly: boolean) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'publishDate',
      sortOrder = 'desc',
      category,
      tag,
      status,
    } = filterDto;

    if (sortBy && !ALLOWED_SORT_FIELDS.includes(sortBy)) {
      throw new BadRequestException(`Sorting by ${sortBy} is not allowed`);
    }

    const query: Record<string, unknown> = {};
    if (publicOnly) {
      query.status = PostStatus.PUBLISHED;
      query.publishDate = { $lte: new Date() };
    } else if (status) {
      query.status = status;
    }
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 } as Record<
      string,
      1 | -1
    >;

    const [data, total] = await Promise.all([
      this.withPopulates(
        this.postModel.find(query).sort(sort).skip(skip).limit(limit),
      ),
      this.postModel.countDocuments(query),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  private withPopulates(query: any) {
    return query
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .populate('author', 'name email')
      .exec();
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private calculateReadTime(content: string): number {
    return Math.max(
      1,
      Math.ceil(content.split(/\s+/).filter(Boolean).length / 200),
    );
  }
}
