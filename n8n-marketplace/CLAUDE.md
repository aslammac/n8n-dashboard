# CLAUDE.md — n8n-marketplace (frontend)

Next.js 16 App Router, React 19, Tailwind CSS 4, TypeScript strict. Renders n8n workflow JSON on an interactive React Flow canvas; SWR for data, socket.io-client for realtime.

## Commands

```bash
npm run dev              # next dev, port 3000
npm run build            # next build (output: 'standalone')
npm run start
npm run lint             # eslint (next config)
npm run import-workflows  # node scripts/import-workflows.js — seed workflow JSON
```

## Layout (`src/`)

- `app/` — App Router routes: `page.tsx` (marketplace home), `workflow/[id]/`, `plans/`, `upload/`, `auth/{login,register,verify,callback}/`, `admin/{,users,bulk-upload}/` (with `admin/layout.tsx`). Also `robots.ts`, `sitemap.ts`.
- `components/` — shared UI, `components/admin/` for admin-only.
- `context/` — `AuthContext.tsx` (`"use client"`, provides `user`, `login`, `loginWithPassword`, `register`, `logout`, `isAuthenticated`).
- `hooks/` — e.g. `useNotifications.ts`.
- `lib/` — `api.ts` (configured axios instance), `fetcher.ts` (SWR fetcher wrapping `api.get`).
- `utils/` — `n8nToReactFlow.ts` (workflow JSON → nodes/edges), `nodeIcons.tsx`, `searchEngine.ts` (Fuse.js fuzzy search).
- `types/`, `data/`.

Path alias `@/*` → `src/*`.

## Conventions

- **API calls**: always go through `@/lib/api` (axios). Base URL `NEXT_PUBLIC_API_URL` (default `http://localhost:3001/api/v1`). Request interceptor injects `Authorization: Bearer <token cookie>`. Do not call `fetch` to the backend directly and do not hardcode the API URL.
- **Data fetching**: SWR + `@/lib/fetcher` for reads; `api.post/patch/delete` for mutations, then `mutate()`.
- **Auth**: consume `useAuth()` from `AuthContext`. Tokens live in cookies `token` / `refreshToken` (js-cookie), never localStorage. Client components only for auth-gated UI.
- **Server vs client**: default to Server Components; add `"use client"` only when using hooks/state/context/browser APIs. `AuthContext`, canvas, and search are client.
- **Styling**: Tailwind 4 (CSS config in `src/app/globals.css`, no `tailwind.config`). `clsx` + `tailwind-merge` for conditional classes. Icons from `lucide-react`.
- **Theming**: light/dark via a `.dark` class on `<html>`. Use the semantic token utilities — `bg-bg`, `bg-surface`, `bg-surface-2`, `bg-card`, `border-border`, `text-fg`, `text-fg-muted`, `text-fg-subtle`, `bg-primary`/`text-primary`/`hover:bg-primary-hover`, `bg-primary-soft`, `text-success|warning|danger` — defined as CSS vars in `globals.css` (`:root` = light, `.dark` = dark). Do **not** hardcode `bg-[#…]` or `text-gray-*`. `ThemeProvider` (`src/context/ThemeContext.tsx`) + `<ThemeToggle />` manage it; a no-flash script in `layout.tsx` sets the class before paint. Home, `/plans`, and the workflow detail page are on tokens; the auth/admin/upload pages still use legacy hardcoded dark classes.
- **Workflow canvas**: `reactflow`. Convert raw n8n JSON with `utils/n8nToReactFlow.ts` — extend that mapper rather than transforming inline in components.
- **Node icons**: `utils/nodeIcons.tsx` `getNodeIcon(nodeType, size)`. Real n8n integration logos live in `public/icons/nodes/<key>.svg` with `utils/nodeIconManifest.json` as the lookup; falls back to a lucide glyph when no logo matches. Regenerate/extend with `node scripts/fetch-node-icons.mjs` (downloads from `https://n8n.io/nodes/<slug>.svg` — n8n only hosts a subset; ~82 keys currently resolve).
- TypeScript strict is on. Keep it typed; avoid `any`.

## Premium is gated behind "coming soon" (temporary)

Payments are built end-to-end but not launched. `/plans` redirects to `/coming-soon` via `next.config.ts` `redirects()`, and every premium CTA (workflow "Unlock premium", header "Pricing") points at `/coming-soon`. To go live: remove the `/plans` redirect and repoint those links back to `/plans`. Backend payment endpoints are untouched and dormant.

## Gotcha

The `User` interface in `AuthContext.tsx` (`firstName`/`lastName`/`picture`) diverges from what the backend returns (`fullName`/`avatarUrl`). Check the live `/users/profile` response before relying on a field name.
