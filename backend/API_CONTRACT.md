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

- `GET /api/health`
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
- `POST /api/admin/media/cleanup-unused`

Admin post relations accept Mongo ObjectIds only for `category` and `tags`.

## Health

`GET /api/health` is public and returns real dependency checks:

```ts
{
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: { status: 'ok' | 'error'; message?: string; latencyMs?: number };
    storage: { status: 'ok' | 'error' | 'disabled'; message?: string; latencyMs?: number };
    mail: { status: 'ok' | 'error' | 'disabled'; message?: string; latencyMs?: number };
  };
}
```

Database errors make the overall status `error`. Storage or mail errors make it `degraded`. Disabled optional services do not fail the health check.

## Media Upload

`POST /api/admin/media/upload` accepts multipart `file` plus `folder`, optional `alt`, and optional `usage`. Images are validated and converted to WebP; PDFs are signature-checked. Lists return pagination meta.

## Media Usage And Cleanup

Media usage is synchronized for post cover/content/SEO images, project cover/images/gallery/SEO images, profile image/CV/social icons/SEO images, and service/technology/link icons where present. External URLs outside the configured R2 public URL are ignored by usage tracking.

Preview unused media:

- `GET /api/admin/media/unused?olderThanDays=30`

Response data:

```ts
{
  total: number;
  items: MediaItem[];
  olderThanDays: number;
  estimatedFreedBytes: number;
}
```

Real cleanup is admin-only and only happens through:

- `POST /api/admin/media/cleanup-unused`

Body:

```ts
{
  olderThanDays: number; // minimum 7
  confirm: true;
}
```

`GET /api/admin/media/cleanup/unused` is retained as a preview-only compatibility route and never deletes files, regardless of query parameters.

## FAQ

## Admin Custom Actions

### Status & Publication Actions (PATCH)

All status modifications and publication transitions are executed via `PATCH`:

- `PATCH /api/admin/projects/:id/publish` - Set project status to published.
- `PATCH /api/admin/projects/:id/unpublish` - Set project status to unpublished/draft.
- `PATCH /api/admin/projects/:id/archive` - Set project status to archived.
- `PATCH /api/admin/blog/posts/:id/publish` - Publish a blog post.
- `PATCH /api/admin/blog/posts/:id/unpublish` - Revert blog post to draft.
- `PATCH /api/admin/blog/posts/:id/archive` - Archive a blog post.
- `PATCH /api/admin/blog/categories/:id/activate` - Activate category.
- `PATCH /api/admin/blog/categories/:id/deactivate` - Deactivate category.
- `PATCH /api/admin/blog/tags/:id/activate` - Activate tag.
- `PATCH /api/admin/blog/tags/:id/deactivate` - Deactivate tag.
- `PATCH /api/admin/services/:id/publish` - Publish a service.
- `PATCH /api/admin/services/:id/unpublish` - Unpublish a service.
- `PATCH /api/admin/technologies/:id/publish` - Publish a technology.
- `PATCH /api/admin/technologies/:id/unpublish` - Unpublish a technology.
- `PATCH /api/admin/links/:id/publish` - Publish a link.
- `PATCH /api/admin/links/:id/unpublish` - Unpublish a link.
- `PATCH /api/admin/faqs/:id/publish` - Publish a FAQ.
- `PATCH /api/admin/faqs/:id/unpublish` - Unpublish a FAQ.
- `PATCH /api/admin/media/:id` - Update alt text, folder, or usage on a media item.
- `PATCH /api/admin/contact/messages/:id/status` - Update contact message status (accepts `new`, `read`, `replied`, `archived`, `spam`).

### Bulk Actions (POST)

Bulk actions allow applying status updates or deletion to multiple items at once.

- `POST /api/admin/projects/bulk`
- `POST /api/admin/blog/posts/bulk`

Body format:
```json
{
  "action": "publish" | "unpublish" | "archive" | "delete",
  "ids": ["mongo_id_1", "mongo_id_2", ...]
}
```

### Reorder Actions (PATCH)

Ordering of resources (for pages supporting drag-and-drop/reordering) is updated by sending the full ordered items mapping:

- `PATCH /api/admin/projects/reorder`
- `PATCH /api/admin/services/reorder`
- `PATCH /api/admin/technologies/reorder`
- `PATCH /api/admin/links/reorder`
- `PATCH /api/admin/faqs/reorder`

Body format:
```json
{
  "items": [
    { "id": "mongo_id_1", "order": 0 },
    { "id": "mongo_id_2", "order": 1 }
  ]
}
```

## Scheduled Posts

Scheduled posts use `status: "scheduled"` with `publishDate` or `scheduledAt`. A cron runs every minute and publishes due posts. Manual admin trigger: `POST /api/admin/blog/posts/publish-due`.
