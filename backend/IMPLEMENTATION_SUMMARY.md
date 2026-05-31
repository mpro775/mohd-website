# Implementation Summary

The backend exposes a stable NestJS API for the portfolio, blog, FAQs, media, contact messages, dashboard, SEO files, auth, and admin/editor content operations.

## Completed Capabilities

- Unified JSON response wrapper preserves `meta` and `links`.
- Mongo duplicate key, CastError, Mongoose validation, and class-validator errors are normalized.
- Public lists with pagination return `meta`.
- Blog public filters use `categorySlug` and `tagSlug`; admin post relations use Mongo ObjectIds.
- Slugs are normalized and checked before writes for projects, posts, categories, tags, services, technologies, and links.
- Scheduled posts are published by a cron every minute, with a manual admin trigger at `POST /api/admin/blog/posts/publish-due`.
- FAQs module is implemented under `/api/public/faqs` and `/api/admin/faqs`.
- SEO endpoints are implemented at `/sitemap.xml`, `/robots.txt`, `/rss.xml`, and `/feed.xml`.
- Contact form includes honeypot handling, optional Turnstile verification, basic spam scoring, and fake success for honeypot submissions.
- Media includes usage tracking and admin-only unused-media cleanup inspection.
- Dashboard returns a frontend-ready aggregate structure at `/api/admin/dashboard`.
- Editor role is enabled for content management; audit logs, contact inbox, profile, dashboard, destructive media deletion, and cleanup stay admin-only.
- Seed admin is environment-driven and does not boot the full app.
- Legacy `/api/projects`, `/api/blog/posts`, and similar routes are unsupported and return `410 Gone`.

## Documentation

- `README.md` describes setup, env, roles, official routes, and commands.
- `API_CONTRACT.md` documents the frontend contract for public, admin, auth, media, SEO, pagination, errors, and roles.
- Swagger remains available at `/api/docs`.
