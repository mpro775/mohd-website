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
- Storage: Cloudflare R2 values
- Seed: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_NAME`, `SEED_ADMIN_PASSWORD`

## Routes

Official routes use these prefixes only:

- Public: `/api/public/...`
- Admin: `/api/admin/...`
- Auth: `/api/auth/...`
- SEO root files: `/sitemap.xml`, `/robots.txt`, `/rss.xml`, `/feed.xml`

Legacy routes such as `/api/projects` and `/api/blog/posts` are not supported and return `410 Gone`.

## Roles

- `admin`: full access, including dashboard, profile, contact messages, audit logs, deletion, and cleanup.
- `editor`: content management for projects, posts, categories, tags, services, technologies, links, FAQs, and media upload/metadata.

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
