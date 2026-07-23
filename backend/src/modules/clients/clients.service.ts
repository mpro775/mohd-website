import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client } from './schemas/client.schema';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { MediaService } from '../media/media.service';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<Client>,
    private mediaService: MediaService,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const createdClient = new this.clientModel(createClientDto);
    return createdClient.save();
  }

  async findAll(includeUnpublished = false): Promise<any[]> {
    const query = includeUnpublished ? {} : { isPublished: true };
    const clients = await this.clientModel
      .find(query)
      .sort({ order: 1, createdAt: -1 })
      .exec();

    return Promise.all(
      clients.map(async (client) => {
        const clientObj = client.toObject();
        if (clientObj.logoMediaId) {
          const resolvedMedia = await this.mediaService.resolveMediaObject(
            clientObj.logoMediaId.toString(),
          );
          (clientObj as any).logoMedia = resolvedMedia;
        }
        return clientObj;
      }),
    );
  }

  async findOne(id: string): Promise<any> {
    const client = await this.clientModel.findById(id).exec();
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    const clientObj = client.toObject();
    if (clientObj.logoMediaId) {
      const resolvedMedia = await this.mediaService.resolveMediaObject(
        clientObj.logoMediaId.toString(),
      );
      (clientObj as any).logoMedia = resolvedMedia;
    }
    return clientObj;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const updatedClient = await this.clientModel
      .findByIdAndUpdate(id, updateClientDto, { new: true })
      .exec();
    if (!updatedClient) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return updatedClient;
  }

  async remove(id: string): Promise<void> {
    const result = await this.clientModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
  }
}
