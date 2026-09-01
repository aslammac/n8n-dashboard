# CLAUDE.md — n8n Automation Marketplace

Monorepo: marketplace for discovering, sharing, visualising and monetising n8n workflows.
Two apps, no workspace tooling — each has its own `package.json` and `node_modules`.

| Path | Stack | Dev port |
| --- | --- | --- |
| `n8n-marketplace/` | Next.js 16 (App Router), React 19, Tailwind 4 | 3000 |
| `n8n-marketplace-backend/` | NestJS 11, MongoDB/Mongoose, Redis/BullMQ | 3001 (`/api/v1` prefix) |

Each app has its own `CLAUDE.md` with detailed conventions — read it before editing that app.

## Running locally

```bash
docker compose up -d redis          # Redis for the BullMQ queue (optional — see below)
cd n8n-marketplace-backend && npm install && npm run start:dev
cd n8n-marketplace && npm install && npm run dev
```

Redis is optional. Set `REDIS_ENABLED=false` in the backend `.env` to skip it — the only consumer is the BullMQ bulk-upload queue, which then runs inline. Cache, websockets, and rate limiting are all in-memory regardless.

MongoDB expected at `mongodb://localhost:27017` (or set `MONGODB_URI` to Atlas).
Backend Swagger UI: `http://localhost:3001/api`.

## Environment

- Backend: `.env` in `n8n-marketplace-backend/` — see the env table in `readme.md`. Config is read only through `@nestjs/config` `ConfigService` namespaces (`app.*`, `jwt.*`, `database.*`, `redis.*`, `mail.*`), never `process.env` directly in feature code.
- Frontend: `.env.local` in `n8n-marketplace/` — only `NEXT_PUBLIC_*` vars (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_ENABLE_EMAIL_LOGIN`).
- All `.env*` files are gitignored. Never commit secrets. `atlas-credentials.env` at repo root is untracked local scratch — do not add it.

## Auth model (shared contract)

- Backend issues `access_token` (15m) + `refresh_token` (7d) as JSON on `/auth/login`, `/auth/register`, OAuth callback.
- Frontend stores them in cookies `token` / `refreshToken` (js-cookie) and injects `Authorization: Bearer` via the axios interceptor in `n8n-marketplace/src/lib/api.ts`.
- Roles: `user`, `admin`. Tiers: `free`, `starter`, `pro`, `business`.
- Public workflow reads use `OptionalJwtAuthGuard`; premium content and writes require `JwtAuthGuard` (+ `EmailVerifiedGuard`, `RolesGuard` where relevant).
- Downloads: free workflows download without login (per-IP monthly cap); premium requires account-level access (Pro subscription or Lifetime).
- Payments: Stripe Checkout, **account-level** — a Pro subscription or a one-time Lifetime unlocks all premium workflows (not per-workflow). `POST /payments/subscribe` / `POST /payments/lifetime` → hosted page → `/payments/webhook` sets `user.subscriptionTier`. Premium workflow pages render publicly with `workflowJson` withheld (`locked: true`) until the viewer has access. Needs `STRIPE_PRO_PRICE_ID` + `STRIPE_LIFETIME_PRICE_ID`. See backend CLAUDE.md.

Known drift to watch: frontend `User` interface (`firstName`/`lastName`/`picture`) does not match backend `User` schema (`fullName`/`avatarUrl`). Confirm field names against the actual API response, not the type.

## Deploy

Push to `main` triggers `.github/workflows/deploy-to-linode.yml` — SSH to Linode host, `git pull`, `docker compose down && up --build -d`. `docker-compose.yml` at root orchestrates Redis + backend. Frontend also deployable to Vercel (`n8n-marketplace/.vercel`, `output: 'standalone'`).

## Conventions

- Conventional Commits (`feat:`, `fix:`, `docs:`), imperative, lowercase scope.
- Branch off `main`; do not commit or push unless asked.
- `backup/` holds raw workflow JSON samples — reference data, not app code.
