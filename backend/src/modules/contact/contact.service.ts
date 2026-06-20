import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ContactMessage,
  MessageStatus,
} from './schemas/contact-message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { FilterContactMessageDto } from './dto/filter-contact-message.dto';
import { createPaginatedResponse } from '../../common/utils/pagination.util';
import { MailService } from '../mail/mail.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { buildSafeRegex } from '../../common/utils/regex.util';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactMessage.name)
    private contactMessageModel: Model<ContactMessage>,
    private mailService: MailService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private async verifyTurnstile(token: string | undefined, ipAddress: string) {
    if (process.env.CONTACT_TURNSTILE_ENABLED !== 'true') {
      return;
    }
    if (!token) {
      throw new BadRequestException('Turnstile token is required');
    }
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      throw new BadRequestException('Turnstile is not configured');
    }

    const body = new URLSearchParams({
      secret,
      response: token,
      remoteip: ipAddress,
    });
    const result = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body },
    );
    const data = (await result.json()) as { success?: boolean };
    if (!data.success) {
      throw new BadRequestException('Turnstile verification failed');
    }
  }

  private async scoreSpam(dto: CreateMessageDto, ipAddress: string) {
    const reasons: string[] = [];
    let score = 0;
    const text = `${dto.subject} ${dto.message}`.toLowerCase();
    const links = text.match(/https?:\/\//g)?.length ?? 0;
    if (links >= 2) {
      score += 3;
      reasons.push('too_many_links');
    }

    const spamWords = (
      process.env.CONTACT_SPAM_WORDS || 'casino,crypto,viagra,loan,forex'
    )
      .split(',')
      .map((word) => word.trim().toLowerCase())
      .filter(Boolean);
    const matchedSpamWord = spamWords.find((word) => text.includes(word));
    if (matchedSpamWord) {
      score += 3;
      reasons.push(`spam_word:${matchedSpamWord}`);
    }

    const since = new Date(Date.now() - 10 * 60 * 1000);
    const repeated = await this.contactMessageModel.countDocuments({
      $or: [{ email: dto.email }, { ipAddress }],
      createdAt: { $gte: since },
    });
    if (repeated >= 3) {
      score += 2;
      reasons.push('repeated_sender');
    }

    return { score, reasons };
  }

  async create(
    createMessageDto: CreateMessageDto,
    ipAddress: string,
    req?: any,
  ): Promise<ContactMessage | null> {
    if (createMessageDto.website) {
      return null;
    }

    await this.verifyTurnstile(createMessageDto.turnstileToken, ipAddress);
    const spam = await this.scoreSpam(createMessageDto, ipAddress);
    const message = new this.contactMessageModel({
      ...createMessageDto,
      website: undefined,
      turnstileToken: undefined,
      ipAddress,
      userAgent: req?.headers?.['user-agent'],
      spamScore: spam.score,
      spamReason: spam.reasons.join(', '),
      isSpam: spam.score >= 5,
      status: spam.score >= 5 ? MessageStatus.SPAM : MessageStatus.NEW,
    });

    const saved = await message.save();
    if (!saved.isSpam) {
      await this.mailService.sendContactNotification({
        name: saved.fullName,
        email: saved.email,
        subject: saved.subject,
        message: saved.message,
      });
    }

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

  async findAll(queryDto: FilterContactMessageDto) {
    const page = Number(queryDto.page ?? 1);
    const limit = Number(queryDto.limit ?? 10);
    const skip = (page - 1) * limit;

    const query: any = {};

    if (queryDto.status) {
      query.status = queryDto.status;
    } else {
      query.isSpam = { $ne: true };
    }

    const searchRegex = buildSafeRegex(queryDto.search);
    if (searchRegex) {
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
        { phone: searchRegex },
        { company: searchRegex },
      ];
    }

    const allowedSortFields = new Set([
      'createdAt',
      'updatedAt',
      'fullName',
      'email',
      'status',
    ]);
    const sortBy = allowedSortFields.has(queryDto.sortBy ?? '')
      ? queryDto.sortBy
      : 'createdAt';
    const sortOrder = queryDto.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.contactMessageModel
        .find(query)
        .sort({ [sortBy as string]: sortOrder })
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
