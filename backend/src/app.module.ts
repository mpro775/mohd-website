import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { BlogModule } from './modules/blog/blog.module';
import { TechnologiesModule } from './modules/technologies/technologies.module';
import { ServicesModule } from './modules/services/services.module';
import { ContactModule } from './modules/contact/contact.module';
import { LinksModule } from './modules/links/links.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import * as Joi from 'joi';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import cloudflareConfig from './config/cloudflare.config';
import appConfig from './config/app.config';
import mailConfig from './config/mail.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediaModule } from './modules/media/media.module';
import { MailModule } from './modules/mail/mail.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { DeprecatedController } from './common/controllers/deprecated.controller';
import { FaqsModule } from './modules/faqs/faqs.module';
import { SeoModule } from './modules/seo/seo.module';
import { OptionsModule } from './modules/options/options.module';
import { CertificationsModule } from './modules/certifications/certifications.module';
import { EducationModule } from './modules/education/education.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        jwtConfig,
        cloudflareConfig,
        appConfig,
        mailConfig,
      ],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(3000),
        SITE_URL: Joi.string().uri().default('http://localhost:3000'),
        MONGODB_URI: Joi.string().required(),
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
        CORS_ORIGINS: Joi.string().default(
          'http://localhost:3001,http://localhost:5173',
        ),
        THROTTLE_TTL: Joi.number().default(60),
        THROTTLE_LIMIT: Joi.number().default(10),
        SMTP_HOST: Joi.string().allow('').default(''),
        SMTP_PORT: Joi.number().default(587),
        SMTP_USER: Joi.string().allow('').default(''),
        SMTP_PASS: Joi.string().allow('').default(''),
        MAIL_FROM: Joi.string().allow('').default(''),
        CONTACT_MAIL_TO: Joi.string().allow('').default(''),
        CONTACT_TURNSTILE_ENABLED: Joi.boolean().default(false),
        TURNSTILE_SECRET_KEY: Joi.string().allow('').default(''),
        CONTACT_SPAM_WORDS: Joi.string()
          .allow('')
          .default('casino,crypto,viagra,loan,forex'),
        SEED_ADMIN_EMAIL: Joi.string().email().default('admin@example.com'),
        SEED_ADMIN_NAME: Joi.string().default('Admin'),
        SEED_ADMIN_PASSWORD: Joi.string().allow('').default(''),
        R2_ACCOUNT_ID: Joi.string().required(),
        R2_ACCESS_KEY_ID: Joi.string().required(),
        R2_SECRET_ACCESS_KEY: Joi.string().required(),
        R2_BUCKET: Joi.string().required(),
        R2_PUBLIC_URL: Joi.string().uri().required(),
        R2_REGION: Joi.string().default('auto'),
        ANALYTICS_HASH_SALT: Joi.string()
          .min(16)
          .default('local-development-analytics-salt'),
        FRONTEND_REVALIDATE_URL: Joi.string().uri().allow('').default(''),
        FRONTEND_REVALIDATE_SECRET: Joi.string().allow('').default(''),
      }),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL ?? 60) * 1000,
        limit: Number(process.env.THROTTLE_LIMIT ?? 10),
      },
    ]),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    ProjectsModule,
    BlogModule,
    TechnologiesModule,
    ServicesModule,
    ContactModule,
    LinksModule,
    MailModule,
    MediaModule,
    DashboardModule,
    HealthModule,
    AuditLogsModule,
    FaqsModule,
    SeoModule,
    OptionsModule,
    CertificationsModule,
    EducationModule,
  ],
  controllers: [AppController, DeprecatedController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
