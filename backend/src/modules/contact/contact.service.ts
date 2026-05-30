import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ContactMessage,
  MessageStatus,
} from './schemas/contact-message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactMessage.name)
    private contactMessageModel: Model<ContactMessage>,
    private mailService: MailService,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    ipAddress: string,
  ): Promise<ContactMessage> {
    const message = new this.contactMessageModel({
      ...createMessageDto,
      ipAddress,
    });

    const saved = await message.save();
    await this.mailService.sendContactNotification({
      name: saved.fullName,
      email: saved.email,
      subject: saved.subject,
      message: saved.message,
    });
    return saved;
  }

  async findAll(page: number = 1, limit: number = 10, status?: MessageStatus) {
    const query: any = {};

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.contactMessageModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.contactMessageModel.countDocuments(query),
    ]);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string): Promise<ContactMessage> {
    const message = await this.contactMessageModel.findById(id);

    if (!message) {
      throw new NotFoundException('الرسالة غير موجودة');
    }

    return message;
  }

  async updateStatus(
    id: string,
    status: MessageStatus,
    notes?: string,
  ): Promise<ContactMessage> {
    const message = await this.contactMessageModel.findByIdAndUpdate(
      id,
      { status, ...(notes !== undefined ? { notes } : {}) },
      { new: true },
    );

    if (!message) {
      throw new NotFoundException('الرسالة غير موجودة');
    }

    return message;
  }

  async remove(id: string): Promise<void> {
    const result = await this.contactMessageModel.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('الرسالة غير موجودة');
    }
  }
}
