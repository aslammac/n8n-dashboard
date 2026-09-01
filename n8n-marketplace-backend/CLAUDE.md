# CLAUDE.md — n8n-marketplace-backend

NestJS 11 REST API. MongoDB via `@nestjs/mongoose`, Redis + BullMQ for async jobs, Passport for auth, Swagger for docs, Socket.io gateway for realtime notifications.

## Commands

```bash
npm run start:dev      # watch mode, port 3001
npm run build          # nest build -> dist/
npm run start:prod     # node dist/main
npm run lint           # eslint --fix (typescript-eslint recommendedTypeChecked + prettier)
npm run test           # jest unit
npm run test:e2e       # jest --config test/jest-e2e.json
npm run format         # prettier --write
```

Run `npm run lint` after edits — prettier errors fail the build (`prettier/prettier: error`, `endOfLine: auto`).

## Module layout

`src/<feature>/` per domain: `payments`, `auth`, `mail`, `workflows`, `subscriptions`, `users`, `downloads`, `notifications`, `analytics`.
Standard files: `<feature>.module.ts`, `.controller.ts`, `.service.ts`, `schemas/<name>.schema.ts`. Extras where needed: `workflows.processor.ts` (BullMQ worker), `workflow-ai.service.ts` (Gemini), `notifications.gateway.ts` (WS), `auth/strategies/`, `auth/guards/`, `auth/decorators/`.

`src/config/` — one file per namespace registered with `registerAs` (`app`, `database`, `jwt`, `redis`, `mail`). Access via `configService.get('app.frontendUrl')`. Do not read `process.env` in feature code.

`src/main.ts` — global `ValidationPipe` (`whitelist`, `transform`, `forbidNonWhitelisted`), global prefix `api/v1`, CORS from `app.frontendUrl` (comma-separated → array), 50mb body limit, Swagger at `/api`.

`src/load-env.ts` — side-effect import, **must stay the first import in `main.ts`**. Runs `dotenv` on `.env` / `.env.production` (by `NODE_ENV`) before any `@Module` is evaluated, so import-time flags like `REDIS_ENABLED` read in `workflows.module.ts` see file values. `ConfigModule.forRoot` still runs afterwards and is the source of truth for injected config; neither step overwrites a var already in `process.env` (real env always wins).

## Conventions

- **Mongoose schemas**: `@Schema({ timestamps: true })`, class + `SchemaFactory.createForClass`, export `type XDocument = X & Document`. Use `enum` on `@Prop` for constrained strings (roles, tiers, status). `@Prop({ select: false })` for secrets like `verificationToken`.
- **Controllers**: decorator stack order used in repo is `@UseGuards(JwtAuthGuard, RolesGuard, EmailVerifiedGuard)` then `@Roles('admin')` then the HTTP verb. `req.user.userId` is the authenticated user id (set by `JwtStrategy.validate`).
- **Guards**: `JwtAuthGuard` (required), `OptionalJwtAuthGuard` (public + optional user — used for public workflow reads and for `POST /downloads/:id`), `EmailVerifiedGuard`, `RolesGuard` (+ `@Roles()` decorator).
- **Downloads**: `POST /downloads/:id` is public via `OptionalJwtAuthGuard`. Free workflows download anonymously, rate-limited per IP (`ANON_MONTHLY_LIMIT` in `downloads.service.ts`); premium workflows throw `UnauthorizedException` without a user. Signed-in `free`-tier users keep the `FREE_TIER_MONTHLY_LIMIT` cap. `Download.userId` is nullable (anonymous rows).
- **DTOs**: many endpoints currently take inline `any` bodies — when adding new ones prefer `class-validator` DTOs so the global `ValidationPipe` enforces them.
- **Async work**: enqueue to BullMQ (`@nestjs/bullmq`) instead of blocking the request — pattern in `workflows.service.ts` → `workflows.processor.ts`. The actual work lives in a plain service method (`executeBulkUpload`) that both the processor and the inline fallback call.
- **AI**: `@google/genai` (Gemini) is isolated in `workflow-ai.service.ts` — tag synthesis, description generation, workflow-structure validation.
- `@typescript-eslint/no-explicit-any` is off; `no-floating-promises` and `no-unsafe-argument` are warnings — still avoid floating promises in new code.

## Payments (Stripe — account-level premium access)

Premium is **not** per-workflow. One entitlement (Pro subscription or one-time Lifetime) unlocks the whole premium library. Two Stripe Prices configured via `STRIPE_PRO_PRICE_ID` (recurring) and `STRIPE_LIFETIME_PRICE_ID` (one-time).

Endpoints (`PaymentsController`, all JWT except webhook):
- `POST /payments/subscribe` → `mode: 'subscription'` Checkout → `{ url }`
- `POST /payments/lifetime` → `mode: 'payment'` Checkout + pending `Purchase` (`kind: 'lifetime'`) → `{ url }`
- `POST /payments/portal` → Stripe billing portal URL
- `GET /payments/billing` → `{ tier, status, expiresAt, hasPremium }`
- `GET /payments/my/purchases`
- `POST /payments/webhook` (no guard, Stripe signature; raw body via `express.raw()` in `main.ts` before the JSON parser)

Both Checkout flows redirect back to `${frontendUrl}/plans?status=success|cancelled`.

Webhook handling (`handleWebhook`, idempotent):
- `checkout.session.completed` — `mode: 'payment'` + paid → `fulfillLifetime` → `usersService.grantLifetime` (tier `lifetime`); `mode: 'subscription'` → retrieve sub → `applySubscription`
- `customer.subscription.created|updated` → `applySubscription` (tier `pro`, `subscriptionStatus`, `subscriptionExpiresAt = current_period_end`)
- `customer.subscription.deleted` → `usersService.downgradeToFree` (skips `lifetime` users)

`PaymentsService.hasPremiumAccess(userId)` — tier in `starter|pro|business|lifetime` and (lifetime OR status active OR not expired). `getBillingStatus` wraps it.

Entitlement enforcement:
- `WorkflowsController.findOne` — premium listings return to everyone with `workflowJson: null` + `locked: true` unless the JWT's `subscriptionTier !== 'free'` (or creator/admin). Token is stale until re-login after an upgrade; downloads still work immediately because:
- `DownloadsService` — premium download calls `paymentsService.hasPremiumAccess(userId)` (DB check), else `ForbiddenException`. Anonymous premium → `UnauthorizedException`.

`User.subscriptionTier` enum includes `lifetime`. `Purchase` schema is now the lifetime-payment record (`kind`, nullable `workflowId`).

Stripe client: `STRIPE_CLIENT` provider in `stripe.provider.ts` (boots with a placeholder key if unset, warns).

Local testing: `stripe listen --forward-to localhost:3001/api/v1/payments/webhook`, put the printed `whsec_…` in `STRIPE_WEBHOOK_SECRET`. Create the two Prices in the Stripe Dashboard and set their IDs.

## Redis is optional

Redis backs **only** the BullMQ queue. Cache (`@nestjs/cache-manager`), Socket.io, and the throttler are all in-memory.

`REDIS_ENABLED=false` (env) makes `isRedisEnabled()` in `src/config/redis.config.ts` return false, which:
- drops `BullModule.forRootAsync` from `app.module.ts`
- drops `BullModule.registerQueue` + `WorkflowsProcessor` from `workflows.module.ts`
- leaves `@Optional() @InjectQueue('workflows')` undefined in `workflows.service.ts`, so `processBulkUpload` runs `executeBulkUpload` synchronously in-process

Any new queue must follow the same conditional-spread + `@Optional()` + inline-fallback pattern, or the app won't boot without Redis.

## Auth flow

`/auth/login` & `/auth/register` return `{ access_token, refresh_token }`. OAuth: `/auth/google`, `/auth/github` → strategy → callback redirects to frontend `FRONTEND_URL` with tokens. JWT payload → `req.user` = `{ userId, email, roles }`.
