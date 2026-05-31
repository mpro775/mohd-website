# Mohd Portfolio Backend

NestJS API for a personal portfolio, blog, media library, contact inbox, SEO feeds, and admin/editor content management.

## Run

```bash
npm install
cp .env.example .env
npm run start:dev
```

Swagger is available at `/api/docs`.

## Commands

```bash
npm run format
npm run lint
npm run test
npm run test:e2e
npm run build
npm run seed:admin
docker compose up --build
```

`seed:admin` reads `SEED_ADMIN_EMAIL`, `SEED_ADMIN_NAME`, and `SEED_ADMIN_PASSWORD`. In development only, an empty password is generated and printed once. In production/provision environments, `SEED_ADMIN_PASSWORD` is required.

## Environment

Use `.env.example` as the contract. Key groups:

- App: `NODE_ENV`, `PORT`, `SITE_URL`, `CORS_ORIGINS`
- Auth: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, expiration values
- Rate limits: `THROTTLE_TTL`, `THROTTLE_LIMIT`
- Mail/contact: SMTP values, `CONTACT_TURNSTILE_ENABLED`, `TURNSTILE_SECRET_KEY`, `CONTACT_SPAM_WORDS`
- Storage: Cloudflare R2 values, including `R2_REGION` (defaults to `auto`)
- Seed: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_NAME`, `SEED_ADMIN_PASSWORD`

Required R2 variables are `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`, and `R2_REGION`.

## Routes

Official routes use these prefixes only:

- Public: `/api/public/...`
- Admin: `/api/admin/...`
- Auth: `/api/auth/...`
- Health: `/api/health`
- SEO root files: `/sitemap.xml`, `/robots.txt`, `/rss.xml`, `/feed.xml`

Legacy routes such as `/api/projects` and `/api/blog/posts` are not supported and return `410 Gone`.

## Roles

- `admin`: full access, including dashboard, profile, contact messages, audit logs, deletion, and cleanup.
- `editor`: content management for projects, posts, categories, tags, services, technologies, links, FAQs, and media upload/metadata.

## Health Check

`GET /api/health` returns overall `ok`, `degraded`, or `error` plus real checks for MongoDB, Cloudflare R2, and SMTP. MongoDB failures return `error`; R2/SMTP failures return `degraded`; unconfigured optional services return `disabled`.

## Media Cleanup

Use `GET /api/admin/media/unused?olderThanDays=30` to preview unused files. It never deletes data. Real deletion is admin-only through `POST /api/admin/media/cleanup-unused` with `confirm: true` and `olderThanDays >= 7`.

Media usage is tracked from posts, projects, profile media/social icons/SEO images, and content module icons so active media does not appear as unused.

## FAQ Workflow

FAQs support draft and published states. Public routes return published FAQs only. Admin/editor routes can create, update, delete, publish, unpublish, and reorder FAQs with `PATCH /api/admin/faqs/reorder`.

## API Contract

All JSON endpoints are wrapped as:

```ts
{
  success: boolean;
  statusCode: number;
  message: string;
  data?: unknown;
  meta?: Record<string, unknown>;
  errors?: unknown[];
  timestamp: string;
  path: string;
}
```

Paginated list endpoints include `meta` with `total`, `page`, `limit`, `totalPages`, `hasNextPage`, and `hasPrevPage`.

See `API_CONTRACT.md` for the frontend-facing endpoint contract.
