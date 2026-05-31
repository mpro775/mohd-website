import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MediaService } from '../media/media.service';
import { MailService } from '../mail/mail.service';

export type CheckStatus = 'ok' | 'error' | 'disabled';
export type HealthStatus = 'ok' | 'degraded' | 'error';

export interface HealthCheck {
  status: CheckStatus;
  message?: string;
  latencyMs?: number;
}

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
    private readonly mediaService: MediaService,
    private readonly mailService: MailService,
  ) {}

  async getHealth(): Promise<{
    status: HealthStatus;
    timestamp: string;
    uptime: number;
    version: string;
    environment: string;
    checks: {
      database: Exclude<HealthCheck, { status: 'disabled' }>;
      storage: HealthCheck;
      mail: HealthCheck;
    };
  }> {
    const databaseStartedAt = Date.now();
    const database =
      this.connection.readyState === 1
        ? {
            status: 'ok' as const,
            latencyMs: Date.now() - databaseStartedAt,
          }
        : {
            status: 'error' as const,
            message: `MongoDB is not connected (readyState ${this.connection.readyState})`,
            latencyMs: Date.now() - databaseStartedAt,
          };

    const [storage, mail] = await Promise.all([
      this.mediaService.checkStorageHealth(),
      this.mailService.checkMailHealth(),
    ]);

    let status: HealthStatus = 'ok';
    if (database.status === 'error') {
      status = 'error';
    } else if (storage.status === 'error' || mail.status === 'error') {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.0.1',
      environment:
        this.configService.get<string>('app.nodeEnv') ||
        process.env.NODE_ENV ||
        'development',
      checks: {
        database,
        storage,
        mail,
      },
    };
  }
}
