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
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactMessage.name)
    private contactMessageModel: Model<ContactMessage>,
    private mailService: MailService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    ipAddress: string,
    req?: any,
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

    // Audit Log (Public request, no authenticated user expected)
    await this.auditLogsService.log({
      action: 'contact.message.created',
      resource: 'ContactMessage',
      resourceId: saved._id.toString(),
      after: saved.toObject(),
      request: req,
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
    req?: any,
  ): Promise<ContactMessage> {
    const oldMessage = await this.contactMessageModel.findById(id);
    if (!oldMessage) {
      throw new NotFoundException('الرسالة غير موجودة');
    }
    const before = oldMessage.toObject();

    const message = await this.contactMessageModel.findByIdAndUpdate(
      id,
      { status, ...(notes !== undefined ? { notes } : {}) },
      { new: true },
    );

    if (!message) {
      throw new NotFoundException('الرسالة غير موجودة');
    }

    const after = message.toObject();

    // Log status changes
    if (before.status !== status) {
      await this.auditLogsService.log({
        action: 'contact.message.status_changed',
        resource: 'ContactMessage',
        resourceId: id,
        before,
        after,
        request: req,
      });
    }

    // Log notes changes
    if (notes !== undefined && before.notes !== notes) {
      await this.auditLogsService.log({
        action: 'contact.message.notes_updated',
        resource: 'ContactMessage',
        resourceId: id,
        before,
        after,
        request: req,
      });
    }

    return message;
  }

  async remove(id: string, req?: any): Promise<void> {
    const oldMessage = await this.contactMessageModel.findById(id);
    if (!oldMessage) {
      throw new NotFoundException('الرسالة غير موجودة');
    }
    const before = oldMessage.toObject();

    const result = await this.contactMessageModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('الرسالة غير موجودة');
    }

    // Audit Log
    await this.auditLogsService.log({
      action: 'contact.message.deleted',
      resource: 'ContactMessage',
      resourceId: id,
      before,
      request: req,
    });
  }
}
