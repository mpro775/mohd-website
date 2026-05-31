# API Contract v1

This is contract v1 for the current URL shape. The URL does not include `/v1`.

## Base URL

- Local API JSON: `http://localhost:3000/api`
- SEO files: `http://localhost:3000/sitemap.xml`, `robots.txt`, `rss.xml`, `feed.xml`

## Response Shape

```ts
{
  success: boolean;
  statusCode: number;
  message: string;
  data?: unknown;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  errors?: { field: string; message: string }[];
  timestamp: string;
  path: string;
}
```

Mongo duplicate keys return `409`. Invalid ObjectId/CastError and Mongoose validation errors return `400`.

## Auth

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Use `Authorization: Bearer <accessToken>` for admin/editor routes.

## Public Endpoints

- `GET /api/public/profile`
- `GET /api/public/projects?page=1&limit=10`
- `GET /api/public/projects/:slug`
- `GET /api/public/blog/posts?page=1&limit=10&categorySlug=backend&tagSlug=nestjs`
- `GET /api/public/blog/posts/:slug`
- `GET /api/public/blog/categories`
- `GET /api/public/blog/categories/:slug`
- `GET /api/public/blog/tags`
- `GET /api/public/blog/tags/:slug`
- `GET /api/public/services`
- `GET /api/public/services/:slug`
- `GET /api/public/technologies`
- `GET /api/public/technologies/:slug`
- `GET /api/public/links`
- `GET /api/public/links/:slug`
- `POST /api/public/links/:id/click`
- `GET /api/public/faqs?page=1&limit=10&category=general&featured=true`
- `GET /api/public/faqs/:id`
- `POST /api/public/contact`

Public blog filters use slugs. Unknown `categorySlug` or `tagSlug` returns `data: []` with `meta.total: 0`.

## Admin And Editor Endpoints

Editors can manage content routes. Admins can manage everything.

- `/api/admin/projects`
- `/api/admin/blog/posts`
- `/api/admin/blog/categories`
- `/api/admin/blog/tags`
- `/api/admin/services`
- `/api/admin/technologies`
- `/api/admin/links`
- `/api/admin/faqs`
- `/api/admin/media`

Admin-only:

- `/api/admin/profile`
- `/api/admin/contact/messages`
- `/api/admin/dashboard`
- `/api/admin/audit-logs`
- `DELETE /api/admin/media/:id`
- `GET /api/admin/media/cleanup/unused`

Admin post relations accept Mongo ObjectIds only for `category` and `tags`.

## Media Upload

`POST /api/admin/media/upload` accepts multipart `file` plus `folder`, optional `alt`, and optional `usage`. Images are validated and converted to WebP; PDFs are signature-checked. Lists return pagination meta.

## SEO

- `GET /sitemap.xml` returns XML.
- `GET /robots.txt` returns text.
- `GET /rss.xml` and `GET /feed.xml` return RSS XML.

## Scheduled Posts

Scheduled posts use `status: "scheduled"` with `publishDate` or `scheduledAt`. A cron runs every minute and publishes due posts. Manual admin trigger: `POST /api/admin/blog/posts/publish-due`.
