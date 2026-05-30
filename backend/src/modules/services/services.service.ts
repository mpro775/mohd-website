import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    return new this.serviceModel(createServiceDto).save();
  }

  async findAll(): Promise<Service[]> {
    return this.serviceModel
      .find({ isPublished: true })
      .sort({ order: 1, name: 1 });
  }

  async findAllAdmin(): Promise<Service[]> {
    return this.serviceModel.find().sort({ order: 1, name: 1 });
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceModel.findOne({
      _id: id,
      isPublished: true,
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async findOneAdmin(id: string): Promise<Service> {
    const service = await this.serviceModel.findById(id);
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    const service = await this.serviceModel.findByIdAndUpdate(
      id,
      updateServiceDto,
      { new: true },
    );
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async publish(id: string, isPublished: boolean): Promise<Service> {
    const service = await this.serviceModel.findByIdAndUpdate(
      id,
      { isPublished },
      { new: true },
    );
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async remove(id: string): Promise<void> {
    const result = await this.serviceModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Service not found');
  }
}
