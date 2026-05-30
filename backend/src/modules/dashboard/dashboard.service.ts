import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../projects/schemas/project.schema';
import { Post, PostStatus } from '../blog/posts/schemas/post.schema';
import { Service } from '../services/schemas/service.schema';
import { Technology } from '../technologies/schemas/technology.schema';
import { Link } from '../links/schemas/link.schema';
import {
  ContactMessage,
  MessageStatus,
} from '../contact/schemas/contact-message.schema';
import { Media } from '../media/schemas/media.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Service.name) private serviceModel: Model<Service>,
    @InjectModel(Technology.name) private technologyModel: Model<Technology>,
    @InjectModel(Link.name) private linkModel: Model<Link>,
    @InjectModel(ContactMessage.name)
    private contactModel: Model<ContactMessage>,
    @InjectModel(Media.name) private mediaModel: Model<Media>,
  ) {}

  async getStats() {
    const [
      projects,
      publishedProjects,
      posts,
      publishedPosts,
      services,
      technologies,
      links,
      unreadMessages,
      media,
    ] = await Promise.all([
      this.projectModel.countDocuments({ isArchived: { $ne: true } }),
      this.projectModel.countDocuments({
        isPublished: true,
        isArchived: { $ne: true },
      }),
      this.postModel.countDocuments(),
      this.postModel.countDocuments({ status: PostStatus.PUBLISHED }),
      this.serviceModel.countDocuments(),
      this.technologyModel.countDocuments(),
      this.linkModel.countDocuments(),
      this.contactModel.countDocuments({ status: MessageStatus.NEW }),
      this.mediaModel.countDocuments(),
    ]);

    return {
      projects,
      publishedProjects,
      posts,
      publishedPosts,
      services,
      technologies,
      links,
      unreadMessages,
      media,
    };
  }
}
