# Onboarding — Vonue

Bem-vindo. Em ~15 min você roda o produto inteiro localmente e entende como ele cresce.

## 1. O que é

Rede social da cena de raves/festivais. Monorepo npm-workspaces:

- **`apps/api`** — Node + Express + TypeScript + Prisma (PostgreSQL) + Redis + Socket.io
- **`apps/mobile`** — React Native / Expo SDK 50 + React Navigation + Zustand

Foi construído em **fatias verticais**: cada feature entrega backend + mobile juntos, sempre com `tsc --noEmit` limpo nos dois. 17 fatias entregues (auth/onboarding/núcleo, árvore Drün/Rhän/Thrän, eventos/check-in, mapa ao vivo, ingressos, NFC, marketplace/escrow, notificações, avaliações, jobs, álbum de fotos, DJs/ranking, gorjetas, carteira/ledger, timeline, busca).

## 2. Rodando localmente

Pré-requisitos: Node ≥18, npm ≥9, Docker, Expo Go (ou emulador).

```bash
npm install
cp .env.example .env && cp .env apps/api/.env   # ajuste JWT_SECRET / JWT_REFRESH_SECRET
npm run db:up            # postgres + redis (Docker)
npm run db:migrate       # cria as tabelas
npm run db:seed          # selos, usuário origem (tharyck), evento "Vonue Genesis" + lotes
npm run api              # API em :3000   (deixe rodando)
npm run mobile           # Expo (outro terminal)
```

No emulador Android use `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000`; em celular físico, o IP da máquina.

## 3. Roteiro de demonstração (mostra o produto costurado)

Crie 2 contas (A e B) no app.

1. **A**: cadastro → onboarding (20 perguntas) → revelação do núcleo → Home.
2. **A**: *Minha árvore → Convidar para a cena* (copia o código).
3. **B**: cadastro **com o código de convite**.
4. **B**: *Eventos → Vonue Genesis → Comprar* um lote → Pagar (sandbox) → *Meus ingressos → Validar na portaria*. Isso dispara: selo 🎶 do evento, **vínculo de árvore** (A vira Rhän/Drün de B → A recebe selo 🌱 e notificação) e presença no **mapa ao vivo**.
5. **B**: *Eventos → Vonue Genesis → Avaliar organização*; vira DJ em *DJs → Sou DJ*; **A** segue/manda gorjeta para B.
6. Veja tudo convergir: **Notificações** (badge na Home), **Carteira** (repasse creditado no ledger), **Minha história** (timeline), **Buscar** (eventos/DJs/produtos).

## 4. Onde mexer

Fluxo de request da API: `routes/ → controllers/ (Zod) → services/ (regra + Prisma)`. **Toda a lógica vive nos services**; features se conectam por service-chamando-service. Antes de mexer em dinheiro/reputação, leia em `apps/api/README.md` a tabela de endpoints e as notas de design (escrow, carteira, notificações, jobs).

Pontos centrais: `wallet.service.credit()` (único caminho de dinheiro), `notification.service.notifySafe()` (nunca quebra o fluxo), `store.service.settleOrder()` (escrow idempotente), `arvore.service.autoConfirmFromPending()` (gatilho da árvore no 1º check-in).

Mobile: `services/api.ts` (todo acesso ao servidor, tipado), `store/authStore.ts` (gate de navegação), `navigation/RootNavigator.tsx` + `navigation/types.ts`.

## 5. Como adicionar uma nova fatia (o padrão)

1. (Se precisar de modelo novo) editar `prisma/schema.prisma` → `prisma validate` + `prisma generate`.
2. `services/<feat>.service.ts` (regra + Prisma; reusar `notifySafe`, `credit`, `awardAchievementByName` quando fizer sentido).
3. `schemas/<feat>.schema.ts` (Zod) → `controllers/` → `routes/` → registrar em `routes/index.ts` (cuidado com ordem de rota: estático antes de `:param`).
4. Mobile: tipos + método em `services/api.ts` → tela(s) → `navigation/types.ts` + `RootNavigator.tsx` → atalho na Home.
5. `npm run typecheck` nos **dois** workspaces. Atualizar os READMEs.

## 6. Decisões conscientes (não "consertar" sem combinar)

Pagamentos são **sandbox** (status no DB; PSP real é um seam documentado). Push só vai ao FCM se `FCM_SERVER_KEY` existir. Jobs são um scheduler `setInterval` in-process (`JOBS_ENABLED=false` desliga). O **mobile não usa dependências nativas** (precisa rodar no Expo Go): sem Mapbox (radar próprio), sem hardware NFC (token), sem lib de QR, sem `expo-notifications` (inbox por polling), sem upload binário (`imageUrl` é URL). FKs de usuário escalares (`sellerId`, `buyerId`, `fromId`…) são intencionais — junte `User` manualmente.

O *porquê* de cada decisão está na memória persistente do projeto (`MEMORY.md` / `vonue-project.md`) e nos blocos de nota dos READMEs.
