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
import { Faq } from '../faqs/schemas/faq.schema';
import { Certification } from '../certifications/schemas/certification.schema';
import { Education } from '../education/schemas/education.schema';

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
    @InjectModel(Faq.name) private faqModel: Model<Faq>,
    @InjectModel(Certification.name)
    private certificationModel: Model<Certification>,
    @InjectModel(Education.name) private educationModel: Model<Education>,
  ) {}

  async getStats() {
    const [
      projectStats,
      postStats,
      serviceStats,
      technologyStats,
      linkStats,
      faqStats,
      contactStats,
      mediaStats,
      engagement,
      recentMessages,
      recentPosts,
      recentProjects,
      certificationStats,
      educationStats,
    ] = await Promise.all([
      this.getProjectStats(),
      this.getPostStats(),
      this.getServiceStats(),
      this.getTechnologyStats(),
      this.getLinkStats(),
      this.getFaqStats(),
      this.getContactStats(),
      this.getMediaStats(),
      this.getEngagementStats(),
      this.contactModel.find().sort({ createdAt: -1 }).limit(5).exec(),
      this.postModel.find().sort({ createdAt: -1 }).limit(5).exec(),
      this.projectModel.find().sort({ createdAt: -1 }).limit(5).exec(),
      this.getCertificationStats(),
      this.getEducationStats(),
    ]);

    return {
      content: {
        projects: projectStats,
        posts: postStats,
        services: serviceStats,
        technologies: technologyStats,
        links: linkStats,
        faqs: faqStats,
        certifications: certificationStats,
        education: educationStats,
      },
      engagement,
      contact: contactStats,
      media: mediaStats,
      recent: {
        messages: recentMessages,
        posts: recentPosts,
        projects: recentProjects,
      },
    };
  }

  private async getProjectStats() {
    const [total, published, archived, featured] = await Promise.all([
      this.projectModel.countDocuments(),
      this.projectModel.countDocuments({
        isPublished: true,
        isArchived: { $ne: true },
      }),
      this.projectModel.countDocuments({ isArchived: true }),
      this.projectModel.countDocuments({
        featured: true,
        isArchived: { $ne: true },
      }),
    ]);
    return {
      total,
      published,
      draftOrUnpublished: Math.max(total - published - archived, 0),
      archived,
      featured,
    };
  }

  private async getPostStats() {
    const [total, published, draft, scheduled, archived, featured] =
      await Promise.all([
        this.postModel.countDocuments(),
        this.postModel.countDocuments({ status: PostStatus.PUBLISHED }),
        this.postModel.countDocuments({ status: PostStatus.DRAFT }),
        this.postModel.countDocuments({ status: PostStatus.SCHEDULED }),
        this.postModel.countDocuments({ status: PostStatus.ARCHIVED }),
        this.postModel.countDocuments({ isFeatured: true }),
      ]);
    return { total, published, draft, scheduled, archived, featured };
  }

  private async getServiceStats() {
    const [total, published, featured] = await Promise.all([
      this.serviceModel.countDocuments(),
      this.serviceModel.countDocuments({ isPublished: true }),
      this.serviceModel.countDocuments({ isFeatured: true }),
    ]);
    return { total, published, featured };
  }

  private async getTechnologyStats() {
    const [total, published, highlighted] = await Promise.all([
      this.technologyModel.countDocuments(),
      this.technologyModel.countDocuments({ isPublished: true }),
      this.technologyModel.countDocuments({ highlighted: true }),
    ]);
    return { total, published, highlighted };
  }

  private async getLinkStats() {
    const [total, published, featured] = await Promise.all([
      this.linkModel.countDocuments(),
      this.linkModel.countDocuments({ isPublished: true }),
      this.linkModel.countDocuments({ isFeatured: true }),
    ]);
    return { total, published, featured };
  }

  private async getFaqStats() {
    const [total, published, featured] = await Promise.all([
      this.faqModel.countDocuments(),
      this.faqModel.countDocuments({ isPublished: true }),
      this.faqModel.countDocuments({ isFeatured: true }),
    ]);
    return { total, published, featured };
  }

  private async getCertificationStats() {
    const [total, published, featured, expired] = await Promise.all([
      this.certificationModel.countDocuments(),
      this.certificationModel.countDocuments({ isPublished: true }),
      this.certificationModel.countDocuments({ isFeatured: true }),
      this.certificationModel.countDocuments({
        doesNotExpire: false,
        expiresAt: { $lt: new Date() },
      }),
    ]);
    return {
      total,
      published,
      unpublished: Math.max(total - published, 0),
      featured,
      expired,
    };
  }

  private async getEducationStats() {
    const [total, published, featured, current] = await Promise.all([
      this.educationModel.countDocuments(),
      this.educationModel.countDocuments({ isPublished: true }),
      this.educationModel.countDocuments({ isFeatured: true }),
      this.educationModel.countDocuments({ isCurrent: true }),
    ]);
    return {
      total,
      published,
      unpublished: Math.max(total - published, 0),
      featured,
      current,
    };
  }

  private async getContactStats() {
    const [total, unread, replied, archived, spam] = await Promise.all([
      this.contactModel.countDocuments({ isSpam: { $ne: true } }),
      this.contactModel.countDocuments({
        status: MessageStatus.NEW,
        isSpam: { $ne: true },
      }),
      this.contactModel.countDocuments({ status: MessageStatus.REPLIED }),
      this.contactModel.countDocuments({ status: MessageStatus.ARCHIVED }),
      this.contactModel.countDocuments({ isSpam: true }),
    ]);
    return { total, unread, replied, archived, spam };
  }

  private async getMediaStats() {
    const [total, used, totalSizeResult] = await Promise.all([
      this.mediaModel.countDocuments(),
      this.mediaModel.countDocuments({ isUsed: true }),
      this.mediaModel.aggregate([
        { $group: { _id: null, totalSize: { $sum: '$size' } } },
      ]),
    ]);
    return {
      total,
      used,
      unused: Math.max(total - used, 0),
      totalSize: totalSizeResult[0]?.totalSize ?? 0,
    };
  }

  private async getEngagementStats() {
    const [projectViews, postViews, linkClicks] = await Promise.all([
      this.projectModel.aggregate([
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]),
      this.postModel.aggregate([
        { $group: { _id: null, total: { $sum: '$viewCount' } } },
      ]),
      this.linkModel.aggregate([
        { $group: { _id: null, total: { $sum: '$clicks' } } },
      ]),
    ]);
    return {
      projectViews: projectViews[0]?.total ?? 0,
      postViews: postViews[0]?.total ?? 0,
      linkClicks: linkClicks[0]?.total ?? 0,
    };
  }
}
