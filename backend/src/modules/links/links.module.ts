import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LinksService } from './links.service';
import {
  AdminLinksController,
  PublicLinksController,
} from './links.controller';
import { Link, LinkSchema } from './schemas/link.schema';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Link.name, schema: LinkSchema }]),
    MediaModule,
  ],
  controllers: [PublicLinksController, AdminLinksController],
  providers: [LinksService],
  exports: [LinksService],
})
export class LinksModule {}
