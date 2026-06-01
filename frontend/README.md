# Mohd Frontend

Next.js App Router frontend for a personal technical portfolio, blog, and admin CMS. The public site presents a software engineer identity through projects, posts, services, technologies, FAQs, links, and contact flows. The admin area manages CMS resources through the finalized backend API.

## Requirements

- Node.js 20+
- npm
- Running backend API at `http://localhost:3000/api`

This frontend expects the finalized backend API contract without `/v1` prefix.

## Environment

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Default values:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

Do not use `VITE_*` variables. This project is Next.js App Router only.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
npm run start
```

Default URLs:

- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000/api`

## Public Routes

- `/`
- `/about`
- `/projects`
- `/projects/[slug]`
- `/services`
- `/services/[slug]`
- `/technologies`
- `/technologies/[slug]`
- `/blog`
- `/blog/[slug]`
- `/blog/category/[slug]`
- `/blog/tag/[slug]`
- `/faqs`
- `/links`
- `/contact`

Public detail pages use slugs.

## Admin Routes

- `/admin/login`
- `/admin/dashboard`
- `/admin/profile`
- `/admin/projects`
- `/admin/blog/posts`
- `/admin/blog/categories`
- `/admin/blog/tags`
- `/admin/services`
- `/admin/technologies`
- `/admin/links`
- `/admin/faqs`
- `/admin/media`
- `/admin/contact`
- `/admin/audit-logs`

Admin edit operations use backend IDs through `/api/admin-proxy/*`.

## Auth And API

Admin login, refresh, logout, and session reads are handled by Next.js route handlers. Access and refresh tokens are stored in HttpOnly cookies and are never stored in `localStorage` or `sessionStorage`.

Admin requests go through `/api/admin-proxy/*`, which attaches `Authorization: Bearer <accessToken>` server-side, retries once after refresh on `401`, and clears cookies when the session is invalid.

## Backend Dependency

There are no mock APIs or Express mock servers in this frontend. Public data, CMS data, media, contact messages, and link tracking all depend on the backend API contract at `NEXT_PUBLIC_API_URL`.
