# ChatPet

ChatPet is a full-stack chat application (frontend + Cloudflare Workers backend) designed to provide a conversational assistant with image and file uploads, authentication, and persistent D1/Drizzle-backed storage. This repository contains two main packages:

- `backend/` — Cloudflare Workers (Hono) + Drizzle/Prisma + D1 for persistence and authentication.
- `frontend/` — React + TypeScript + Vite single-page app.

This README summarizes how to run the project locally, build and deploy, and where to find useful scripts.

## Quick start

Prerequisites

- Node.js (recommended LTS)
- npm or yarn
- Wrangler (for Cloudflare Workers + D1) — used by backend and some frontend deploy scripts

1. Install dependencies for both packages:

```bash
# from repository root
cd backend && npm install
cd ../frontend && npm install
```

2. Run backend in development (Cloudflare Workers local dev):

```bash
cd backend
npm run dev
```

Open the worker at the local URL shown by Wrangler (common default: http://127.0.0.1:8787).

3. Run the frontend dev server:

```bash
cd frontend
npm run dev
```

Then open the URL printed by Vite (usually http://localhost:5173).

## Project layout

- backend/

  - src/ — server code (Hono), routes, DB schema under `db/` and drizzle schema generators
  - drizzle.config.ts — Drizzle configuration
  - package.json — scripts for dev, build, and DB tasks
  - README.md — minimal developer notes

- frontend/
  - src/ — React app
  - package.json — vite scripts and deploy helpers

## Useful scripts

Backend (`backend/package.json`)

- npm run dev — run Wrangler dev server for local Worker development
- npm run build — run a wrangler deploy dry-run
- npm run deploy — deploy the worker with wrangler (minified)
- npm run start — run compiled Node (if used)
- npm run db:generate — generate Drizzle types
- npm run db:migrate — run drizzle-kit migrations
- npm run db:migrate:dev — apply D1 migrations locally
- npm run db:migrate:prod — apply D1 migrations to remote
- npm run auth:update — regenerate and format auth types (Better-Auth)

Frontend (`frontend/package.json`)

- npm run dev — start Vite dev server
- npm run build — build the frontend (also runs tsc -b)
- npm run preview — preview the production build locally
- npm run lint — run ESLint
- npm run deploy — build and deploy with Wrangler (project-specific)

## Environment variables

Both backend and frontend may use environment variables. Check `backend/src/env.ts` and `frontend` build config files for exact variable names; common values include:

- CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN — for Wrangler deploys
- D1 database binding names or connection strings
- OAUTH / AUTH configuration keys used by `better-auth`
- UPLOADTHING keys if using uploadthing

Place environment variables in a local `.env` file for development and in your CI or Wrangler environment for production. The backend uses `dotenv` and `dotenv-expand`.

## Database & Migrations

This project uses Drizzle with D1 (Cloudflare). Migration and generation helpers exist in `backend/package.json`:

- `npm run db:generate` — regenerate Drizzle types
- `npm run db:migrate` — run drizzle-kit migrations
- `npm run db:migrate:dev` — apply migrations to local D1
- `npm run db:migrate:prod` — apply migrations remotely

Migration files live in `backend/migrations/` and `backend/drizzle/` contains the schema snapshots.

## Authentication

The project uses Better-Auth / better-auth-cloudflare for authentication. See `backend/src/routes/auth/` for configuration and `backend/package.json` for generation scripts (`auth:generate`, `auth:update`).

## Deploying

Cloudflare Wrangler is used for deploying the backend (Workers + D1). Frontend deployment can be handled by Wrangler (or another static host) depending on your configuration.

Typical backend deploy flow:

```bash
cd backend
npm run deploy
```

Typical frontend deploy flow (example using Wrangler static site or custom):

```bash
cd frontend
npm run deploy
```

Note: Ensure your Wrangler configuration files (`wrangler.jsonc` in both packages) and Cloudflare environment variables are set before deploying.

## Development notes

- The backend uses Hono with pino logging. Middlewares and routes are in `backend/src/`.
- TypeScript and `tsx` are used for developer tooling.
- The frontend is React + Vite with Tailwind (check `frontend/src` and `frontend/vite.config.ts`).

## Contributing

Open issues or PRs for bugs and features. Include reproduction steps and the expected behavior. Run linting and types before opening a PR:

```bash
# frontend
cd frontend && npm run lint

# backend
cd backend && npm run db:generate
```

## License

Check repository root for a LICENSE file or add one as needed.

## Where to look next

- Backend entry: `backend/src/index.ts` and `backend/src/server.ts`
- Frontend entry: `frontend/src/main.tsx`
- DB schema: `backend/src/db/schema/` and `backend/drizzle/`

If you'd like, I can:

- add a LICENSE file and author information,
- expand environment variable documentation with exact variable names after scanning `src/env.ts` files,
- add quick-start scripts (Makefile) to run both services together.

---

Generated on Oct 15, 2025 — if you want the README rearranged or additional sections (architecture diagram, CI, testing), tell me which pieces to expand.
