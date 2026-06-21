import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsService } from './projects.service';
import {
  AdminProjectsController,
  PublicProjectsController,
} from './projects.controller';
import { Project, ProjectSchema } from './schemas/project.schema';
import { MediaModule } from '../media/media.module';
import { TechnologiesModule } from '../technologies/technologies.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    MediaModule,
    TechnologiesModule,
  ],
  controllers: [PublicProjectsController, AdminProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
