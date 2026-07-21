import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from '../media/media.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import {
  AdminEducationController,
  PublicEducationController,
} from './education.controller';
import { EducationService } from './education.service';
import { Education, EducationSchema } from './schemas/education.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Education.name, schema: EducationSchema },
    ]),
    MediaModule,
    AuditLogsModule,
  ],
  controllers: [PublicEducationController, AdminEducationController],
  providers: [EducationService],
  exports: [EducationService, MongooseModule],
})
export class EducationModule {}
