import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { Post, PostSchema } from '../blog/posts/schemas/post.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Post.name, schema: PostSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
  controllers: [SeoController],
  providers: [SeoService],
  exports: [SeoService],
})
export class SeoModule {}
