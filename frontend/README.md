# Mohd Frontend

Next.js App Router frontend for the personal developer website and CMS.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Default URLs:

- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000/api`

## Scripts

```bash
npm run lint
npm run typecheck
npm run build
```

## Auth

Admin login uses Next.js route handlers. Access and refresh tokens are stored in HttpOnly cookies and admin calls go through `/api/admin-proxy/*`.
