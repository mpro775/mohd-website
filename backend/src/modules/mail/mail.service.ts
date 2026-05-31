import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter?: Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('mail.host');
    const user = this.configService.get<string>('mail.user');
    const pass = this.configService.get<string>('mail.pass');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.configService.get<number>('mail.port') ?? 587,
        secure: (this.configService.get<number>('mail.port') ?? 587) === 465,
        auth: { user, pass },
      });
    }
  }

  async sendContactNotification(message: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }): Promise<void> {
    await this.safeSend({
      to: this.configService.get<string>('mail.contactTo'),
      subject: `New contact message: ${message.subject || 'No subject'}`,
      text: [
        `Name: ${message.name}`,
        `Email: ${message.email}`,
        `Subject: ${message.subject || '-'}`,
        '',
        message.message,
      ].join('\n'),
    });
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    await this.safeSend({
      to: email,
      subject: 'Password reset request',
      text: `Use this reset token to set a new password: ${token}`,
    });
  }

  async checkMailHealth(): Promise<{
    status: 'ok' | 'error' | 'disabled';
    message?: string;
    latencyMs?: number;
  }> {
    const from = this.configService.get<string>('mail.from');
    if (!this.transporter || !from) {
      return { status: 'disabled', message: 'Mail is not configured' };
    }

    const startedAt = Date.now();
    try {
      await this.transporter.verify();
      return { status: 'ok', latencyMs: Date.now() - startedAt };
    } catch {
      return {
        status: 'error',
        message: 'Mail health check failed',
        latencyMs: Date.now() - startedAt,
      };
    }
  }

  private async safeSend(options: {
    to?: string;
    subject: string;
    text: string;
  }): Promise<void> {
    const from = this.configService.get<string>('mail.from');
    if (!this.transporter || !from || !options.to) {
      this.logger.warn('Mail is not configured; message was not sent');
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
      });
    } catch (error) {
      this.logger.error('Failed to send email notification', error);
    }
  }
}
