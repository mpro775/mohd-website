import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Technology } from './schemas/technology.schema';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';

@Injectable()
export class TechnologiesService {
  constructor(
    @InjectModel(Technology.name) private technologyModel: Model<Technology>,
  ) {}

  async create(createTechnologyDto: CreateTechnologyDto): Promise<Technology> {
    return new this.technologyModel(createTechnologyDto).save();
  }

  async findAll(category?: string): Promise<Technology[]> {
    const query: any = { isPublished: true };
    if (category) query.category = category;
    return this.technologyModel.find(query).sort({ order: 1, name: 1 });
  }

  async findAllAdmin(category?: string): Promise<Technology[]> {
    const query: any = {};
    if (category) query.category = category;
    return this.technologyModel.find(query).sort({ order: 1, name: 1 });
  }

  async findOne(id: string): Promise<Technology> {
    const technology = await this.technologyModel.findOne({
      _id: id,
      isPublished: true,
    });
    if (!technology) throw new NotFoundException('Technology not found');
    return technology;
  }

  async findOneAdmin(id: string): Promise<Technology> {
    const technology = await this.technologyModel.findById(id);
    if (!technology) throw new NotFoundException('Technology not found');
    return technology;
  }

  async update(
    id: string,
    updateTechnologyDto: UpdateTechnologyDto,
  ): Promise<Technology> {
    const technology = await this.technologyModel.findByIdAndUpdate(
      id,
      updateTechnologyDto,
      { new: true },
    );
    if (!technology) throw new NotFoundException('Technology not found');
    return technology;
  }

  async publish(id: string, isPublished: boolean): Promise<Technology> {
    const technology = await this.technologyModel.findByIdAndUpdate(
      id,
      { isPublished },
      { new: true },
    );
    if (!technology) throw new NotFoundException('Technology not found');
    return technology;
  }

  async remove(id: string): Promise<void> {
    const result = await this.technologyModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Technology not found');
  }
}
