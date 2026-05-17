# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Vonue — rede social para a cena de raves/festivais. **npm-workspaces monorepo**: `apps/api` (Node + Express + TypeScript + Prisma/PostgreSQL + Redis + Socket.io) and `apps/mobile` (React Native / Expo SDK 50 + React Navigation + Zustand). Built as a sequence of **vertical slices** — each feature lands backend + mobile + typecheck together. See `README.md` (overview), `apps/api/README.md` (endpoint table + design notes), `apps/mobile/README.md`.

## Commands

Run from the repo root unless noted. The root `package.json` proxies the workspaces.

```bash
npm install                 # installs both workspaces
npm run db:up               # docker compose: postgres + redis
npm run db:migrate          # prisma migrate dev (apps/api)
npm run db:seed             # seed selos/origin/sample event+lots
npm run api                 # API dev server (ts-node-dev, :3000)
npm run mobile              # Expo dev server

# Per-workspace (use these while iterating)
npm run typecheck --workspace apps/api      # tsc --noEmit — run after EVERY change
npm run typecheck --workspace apps/mobile   # same for mobile
npm run build --workspace apps/api          # tsc -> dist/
npm run seed  --workspace apps/api

# Prisma without a running DB (validate/regenerate only):
$env:DATABASE_URL='postgresql://vonue:vonue123@localhost:5432/vonue'; `
  npx prisma validate  --schema=apps/api/prisma/schema.prisma; `
  npx prisma generate  --schema=apps/api/prisma/schema.prisma
```

There is **no test suite** and no linter configured. The quality gate is `tsc --noEmit` on **both** workspaces (strict mode, `noUnusedLocals`/`noUnusedParameters`). Always run both after changes; underscore-prefix intentionally-unused params.

Mobile to a device/emulator: set `EXPO_PUBLIC_API_URL` (emulador Android `http://10.0.2.2:3000`, device físico = IP da máquina).

## Architecture — the big picture

**API request path:** `routes/*` → `controllers/*` (parse with a `schemas/*` Zod schema, call service) → `services/*` (all business logic + Prisma) → Prisma. `middlewares/error.ts` maps `AppError`, `ZodError`, and Prisma `P2002` to HTTP; wrap every async route in `asyncHandler`. `app.ts` builds an `http.Server`, attaches Socket.io (`socket/`), starts the in-process job scheduler, and registers `routes/index.ts` (the single place all route modules are mounted).

**Services are the unit of composition.** Cross-feature behaviour is wired by services calling services, never controllers calling controllers. Key hubs to know before editing payment/reputation flows:

- `wallet.service.credit()` — the **only** way money reaches a user. Atomic tx: upsert `Wallet` + `LedgerEntry` + increment. Called by `store.settleOrder`, `tip.payTip`, `ticket.confirmPayment`. Commissions live at the call sites (marketplace 10/12%, tip 20%, ticket 8%).
- `store.service.settleOrder()` — idempotent `PAID→DELIVERED` + credit; shared by manual confirm **and** the escrow auto-release job. Escrow state converges via the job, not opportunistically.
- `selo.service` (`checkConnectorSelos`, `awardAchievementByName`) — idempotent selo grants; the "just awarded" heuristic is `earnedAt` within 5s.
- `notification.service.notifySafe()` — fire-and-forget inbox write + push seam; **never throws**, so it can be called from any flow without risking the main transaction. Use it (not `notify`) inside services.
- `dj.service.recomputeScore()` — `rankScore = followers + 2×lineup + 3×paidTips`; call after anything that changes those.
- `arvore.service.autoConfirmFromPending()` — the Drün/Rhän/Thrän superior link fires here, on first check-in (via `event.service.checkin`), using `User.pendingInviteCode` saved at register.

**Mobile:** single native-stack in `navigation/RootNavigator.tsx`, gated by `store/authStore.ts` status (`loading|unauth|authed`). All server access goes through the `api` object in `services/api.ts` (typed `fetch` wrapper; `auth: true` adds the bearer token; `ApiError` carries status + Zod `details`). Live map uses `services/socket.ts`. Screens that must refresh on return use `useFocusEffect`. Route param types live in `navigation/types.ts` — keep them in sync when adding screens.

## Conventions that span files

- **Prisma model accessors are quirky:** `prisma.dJ`, `prisma.dJFollow`, `prisma.nFCConnection` (acronym models lower-case only the first letter). Composite IDs use `where: { userId_djId: { ... } }` / `userId_eventId`.
- **Scalar user FKs:** `Product.sellerId`, `Order.buyerId`, `PhotoTag.userId`, `Tip.fromId`, `Wallet.userId`, `Review.targetId/reviewerId` are plain strings with **no relation** — join `User` manually (`prisma.user.findMany({ where: { id: { in } } })`). This is intentional; don't add relations to "fix" it.
- **Schema changes:** edit `apps/api/prisma/schema.prisma`, then `prisma validate` + `prisma generate` (commands above). The original spec's schema was invalid — missing inverse relations on `User` were added; preserve them. Migrations are applied by the user via `npm run db:migrate`.
- **Express route ordering:** static segments before params (`/orders/sales` before `/orders/:id`, `/djs/me` before `/djs/:id`). `optionalAuth` (not `auth`) on public routes that personalize output (e.g. `isFollowing`).
- **Deliberate sandbox/seams (do not "upgrade" without being asked):** **tickets** use real Stripe when `STRIPE_SECRET_KEY` is set (PaymentIntent + signed `/payments/webhook`; raw body mounted before `express.json` in `app.ts`), else sandbox `/payments/confirm`; core `ticket.finalizePayment` is shared/idempotent and `confirmSandbox` refuses Stripe payments. **Marketplace and tips are still sandbox** (`Order/Tip` status in DB) — same seam shape, not yet wired to a PSP. `notification.service.sendPush` only hits FCM if `FCM_SERVER_KEY` is set; jobs are an in-process `setInterval` scheduler (`jobs/scheduler.ts`), disable with `JOBS_ENABLED=false`.
- **Mobile is dependency-light by design (must run in Expo Go):** no Mapbox (custom radar in `LiveMapScreen`), no NFC hardware (ephemeral token), no QR lib (QR shown as text), no `expo-notifications` (inbox polling), no binary upload (`imageUrl` is a URL). Don't add native-only deps without discussing.
- Auto-provisioning pattern: becoming an Organizer/Professional/DJ is an upsert on first use (foundation stage), not a separate onboarding.
- **Web/deploy:** the API serves the Expo web export from `apps/mobile/dist` on the same origin (one shareable link, no CORS) — see `DEPLOY.md`/`render.yaml`. ⚠️ `expo export`/`expo start --web` **fails on Windows** (Expo SDK 50 CLI `node:sea` colon path — invalid on NTFS); build web on Linux/macOS/WSL (Render builds on Linux, so it works there). Not an app bug — typecheck stays green.

## Persistent project memory

Longer-form decision history and the slice-by-slice log live in the Claude memory dir (`MEMORY.md` → `vonue-project.md`, `vonue-arvore-regras.md`), loaded automatically each session. Consult it for *why* a decision was made before changing payment, árvore, or the no-native-dep choices.
