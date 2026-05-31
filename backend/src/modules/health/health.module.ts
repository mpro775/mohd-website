import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { MediaModule } from '../media/media.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MongooseModule, MediaModule, MailModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
