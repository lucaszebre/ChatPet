# ChatPet

A pet-adoption chat assistant: talk to a Gemini-powered "pet finder" that helps you pick an animal that fits your lifestyle.

Live demo: https://chatpet.yakirisk.workers.dev

## What it does

- Sign in with GitHub or Google (Better Auth)
- Chat with a Gemini model (`gemini-2.5-flash`) using a pet-adoption system prompt, with streamed replies
- Attach images to messages (stored with UploadThing, passed to Gemini)
- Keeps chat history per user in Cloudflare D1; edit the system prompt per chat (Tiptap editor) and delete chats
- English and French UI (i18next), light/dark theme
- OpenAPI spec at `/doc` and an API reference UI at `/reference` on the backend

## Stack

- `backend/`: Cloudflare Workers, Hono + `@hono/zod-openapi`, Drizzle ORM on D1, Better Auth + `better-auth-cloudflare`, `@google/genai`, UploadThing
- `frontend/`: React 19, Vite 7, TypeScript, Tailwind CSS 4, Radix UI, Tiptap, react-markdown, react-router, deployed as a Worker with static assets via `@cloudflare/vite-plugin`

The two packages are installed and run separately. Each has its own `package-lock.json`, so use npm.

## Run locally

Prerequisites: Node.js 20+ and npm. Wrangler is a dev dependency in both packages, so no global install is needed.

### Backend (http://localhost:5000)

```bash
cd backend
npm install
cp .env.example .dev.vars          # then fill in the values (see below)
npm run db:migrate:dev             # applies drizzle/ migrations to the local D1 database
npm run dev                        # wrangler dev
```

`wrangler dev` reads local secrets from `backend/.dev.vars`, which is gitignored. The Worker reads these variables:

- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `AUTH_URL`, `TRUSTED_ORIGIN` (the frontend origin, e.g. `http://localhost:5173`)
- `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` (OAuth apps)
- `GOOGLE_AI_API_KEY` (Gemini), `UPLOADTHING_TOKEN` (image uploads)

`HOST`, `SERVER_PORT` and `LOG_LEVEL` are set in `wrangler.jsonc`. The `DATABASE_*`, `DIRECT_URL` and `SHADOW_DATABASE_URL` entries in `.env.example` are left over from an earlier Postgres/Prisma setup, and the Worker does not use them.

Without credentials the Worker still starts and `GET /` returns `Welcome to ChatPet API!`. Sign-in, chat and uploads need the keys above.

### Frontend (http://localhost:5173)

```bash
cd frontend
npm install
cp .env.example .env.local         # VITE_BASE_URL, VITE_BACKEND_BASE_URL
npm run dev
```

Note: the Better Auth client in `frontend/src/lib` has the deployed backend URL hard-coded as its `baseURL`, so sign-in goes to production even when `VITE_BACKEND_BASE_URL` points to a local backend. Change that `baseURL` if you want auth to run fully locally.

## Scripts

Backend:

| Script | What it does |
| --- | --- |
| `npm run dev` | `wrangler dev` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | `wrangler deploy --dry-run` (bundles without deploying) |
| `npm run db:generate` | generate a Drizzle migration from `src/db/drizzleSchema` |
| `npm run db:migrate:dev` | apply migrations to the local D1 database |
| `npm run auth:update` | regenerate the Better Auth Drizzle schema |
| `npm run deploy` / `db:migrate:prod` | deploy the Worker / migrate the remote D1 database (needs Cloudflare credentials) |

Frontend: `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm run lint`, `npm run preview` and `npm run deploy` (build, then `wrangler deploy`).

## Project layout

- `backend/src/app.ts`: Worker entry point (CORS, auth middleware, routes)
- `backend/src/routes/`: `auth`, `chat` and `user` routes
- `backend/src/db/drizzleSchema/`: Drizzle schema; migrations are in `backend/drizzle/`
- `frontend/src/pages/`: home, chat, auth, privacy policy and terms pages
- `frontend/src/i18n/`: translations

## Status

Built in 2025 as a learning/portfolio project. It is not actively maintained.
