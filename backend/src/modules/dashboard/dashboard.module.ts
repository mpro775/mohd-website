import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { Post, PostSchema } from '../blog/posts/schemas/post.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import {
  Technology,
  TechnologySchema,
} from '../technologies/schemas/technology.schema';
import { Link, LinkSchema } from '../links/schemas/link.schema';
import {
  ContactMessage,
  ContactMessageSchema,
} from '../contact/schemas/contact-message.schema';
import { Media, MediaSchema } from '../media/schemas/media.schema';
import { Faq, FaqSchema } from '../faqs/schemas/faq.schema';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Post.name, schema: PostSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Technology.name, schema: TechnologySchema },
      { name: Link.name, schema: LinkSchema },
      { name: ContactMessage.name, schema: ContactMessageSchema },
      { name: Media.name, schema: MediaSchema },
      { name: Faq.name, schema: FaqSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
