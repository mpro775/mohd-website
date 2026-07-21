import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from '../media/media.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import {
  AdminCertificationsController,
  PublicCertificationsController,
} from './certifications.controller';
import { CertificationsService } from './certifications.service';
import {
  Certification,
  CertificationSchema,
} from './schemas/certification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Certification.name, schema: CertificationSchema },
    ]),
    MediaModule,
    AuditLogsModule,
  ],
  controllers: [PublicCertificationsController, AdminCertificationsController],
  providers: [CertificationsService],
  exports: [CertificationsService, MongooseModule],
})
export class CertificationsModule {}
