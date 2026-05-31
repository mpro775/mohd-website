import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {}

  getHealth() {
    const storageConfigured = Boolean(
      this.configService.get<string>('cloudflare.r2.bucket') &&
      this.configService.get<string>('cloudflare.r2.accessKeyId') &&
      this.configService.get<string>('cloudflare.r2.secretAccessKey') &&
      this.configService.get<string>('cloudflare.r2.endpoint'),
    );

    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        status: this.connection.readyState === 1 ? 'ok' : 'down',
        readyState: this.connection.readyState,
        name: this.connection.name,
      },
      storage: {
        status: storageConfigured ? 'configured' : 'missing_config',
        provider: 'r2',
      },
      version: process.env.npm_package_version || '0.0.1',
    };
  }
}
