# Mohd Portfolio Backend

NestJS backend for a single-owner personal portfolio. It provides public portfolio APIs, protected admin APIs, JWT authentication with hashed refresh sessions, contact messages, password reset, R2 media uploads, dashboard stats, health checks, Swagger docs, and Docker support.

## Stack

- NestJS and TypeScript
- MongoDB with Mongoose
- JWT and Passport
- Cloudflare R2 through the S3-compatible AWS SDK
- Nodemailer for email notifications
- Swagger at `/api/docs`

## Setup

```bash
npm install
cp .env.example .env
npm run start:dev
```

Required production secrets live only in `.env`. Do not commit `.env`.

## Environment

Use `.env.example` as the source of truth. Important variables:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `CORS_ORIGINS`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `CONTACT_MAIL_TO`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`

Media uploads use Cloudflare R2 only. No local file storage is used.

## API Shape

Public endpoints:

- `GET /api/public/profile`
- `GET /api/public/projects`
- `GET /api/public/projects/:slug`
- `GET /api/public/blog/posts`
- `GET /api/public/blog/posts/:slug`
- `GET /api/public/services`
- `GET /api/public/technologies`
- `GET /api/public/links`
- `POST /api/public/contact`

Admin endpoints require Bearer JWT:

- `GET|PUT /api/admin/profile`
- `GET|POST /api/admin/projects`
- `GET|PUT|DELETE /api/admin/projects/:id`
- `PATCH /api/admin/projects/:id/publish`
- `PATCH /api/admin/projects/:id/unpublish`
- `PATCH /api/admin/projects/reorder`
- `GET|POST /api/admin/blog/posts`
- `GET|PUT|DELETE /api/admin/blog/posts/:id`
- `GET|POST|PUT|DELETE /api/admin/services`
- `GET|POST|PUT|DELETE /api/admin/technologies`
- `GET|POST|PUT|DELETE /api/admin/links`
- `GET /api/admin/contact/messages`
- `POST /api/admin/media/upload`
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/audit-logs`

Legacy public routes such as `/api/projects` and `/api/blog/posts` still exist for frontend compatibility, but admin writes should use `/api/admin/*`.

## Auth

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/change-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`

Refresh tokens are never stored in plain text. Each login/refresh creates a hashed session. Logout and password changes revoke sessions.

## Commands

```bash
npm run build
npm run lint
npm run test
npm run test:e2e
npm run seed
```

## Docker

```bash
docker compose up --build
```

The compose file runs the API and MongoDB. R2 and JWT values still need to be present in `.env`.

## Security Notes

- Public APIs filter unpublished projects, services, technologies, and links.
- Public blog APIs return only `published` posts whose `publishDate` is not in the future.
- Admin routes are protected by JWT.
- ObjectId parameters return `400` when invalid.
- Sort fields are whitelisted for projects and posts.
- Login, refresh, contact, forgot password, and reset password have route-specific rate limits.
