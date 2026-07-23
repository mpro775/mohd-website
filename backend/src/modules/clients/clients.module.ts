import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsService } from './clients.service';
import {
  PublicClientsController,
  AdminClientsController,
} from './clients.controller';
import { Client, ClientSchema } from './schemas/client.schema';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),
    MediaModule,
  ],
  controllers: [PublicClientsController, AdminClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
