# Vonue — A cena em um lugar

Rede social para a cena de raves e festivais eletrônicos do Brasil.
Monorepo com **API** (Node + Express + Prisma) e **app mobile** (React Native / Expo).

> **Estado atual:** produto completo — 22 fatias verticais (auth/onboarding/
> núcleo, árvore, eventos/check-in, mapa ao vivo, ingressos, NFC, marketplace
> com escrow, notificações, avaliações, jobs/cron, fotos, DJs, gorjetas,
> carteira/ledger, timeline, busca, promoter, freelancer) + Stripe real
> (ingresso, por env) + build web. Typecheck API+mobile sempre limpo.
>
> 👉 **Para pôr no ar e ter um link compartilhável: veja [COMECE-AQUI.md](COMECE-AQUI.md).**

---

## Estrutura

```
vonue/
├── apps/
│   ├── api/      # Node + Express + TypeScript + Prisma
│   └── mobile/   # React Native (Expo) + TypeScript
├── docker-compose.yml
├── .env.example
└── package.json  # npm workspaces
```

## Pré-requisitos

- Node.js >= 18, npm >= 9
- Docker (para Postgres + Redis)
- Expo Go no celular (ou emulador Android/iOS) para rodar o mobile

## Setup rápido

```bash
# 1. Instalar dependências (raiz instala os dois workspaces)
npm install

# 2. Variáveis de ambiente
cp .env.example .env
cp .env apps/api/.env        # a API lê o .env do próprio workspace

# 3. Subir banco e cache
npm run db:up

# 4. Migrations + seed (selos de conector etc.)
npm run db:migrate
npm run db:seed

# 5. Iniciar a API (porta 3000)
npm run api

# 6. Em outro terminal, iniciar o app mobile
npm run mobile
```

> No emulador Android, ajuste `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000`.
> Em celular físico, use o IP da máquina na mesma rede.

## Fatia vertical implementada

| Camada | O que já funciona |
|--------|-------------------|
| Auth/Onboarding | `auth/register·login·refresh·verify-cpf`, `onboarding/questions·complete`, `users/me` |
| Árvore/Selos | `users/me/invite`, `users/me/arvore`, `arvore/confirm-superior`, `selos/mine` |
| Eventos | `events` (lista/detalhe), `events/:id/checkins`, `events/:id/checkin` (+ criação auto-provisionada) |
| Mapa ao vivo | Socket.io + Redis: `map:join/location/ghost/leave`; REST `GET /map/event/:id` |
| Ingressos | `tickets/purchase·mine·checkin`, `payments/webhook·confirm·:id`, `events/:id/ticket-types` — **Stripe real** (PaymentIntent+webhook) ou sandbox por env; `promoterCode` opcional |
| Promoter | `events/:id/promoters`, `promoters/me·:id/reviews·:id/review` — credencial + código + comissão (8% Vonue → promoter → organizador) |
| Vagas/Freelancer | `jobs/open·:id`, `events/:id/jobs`, `jobs/:id/apply·review`, `jobs/applications/:id/accept` — vaga → candidatura → contratação → review |
| NFC | `nfc/token·connect·connections`, `nfc/accept/:id`, `nfc/reject/:id` (arrependimento 1h) |
| Marketplace | `store/products`, `store/orders` (+ `/pay·/confirm·/dispute·/sales`) — escrow, comissão 10/12%, auto-release 48h |
| Notificações | inbox `Notification` + `notifications` (+`/:id/read·/read-all·/token`); push FCM (seam); disparado em Thrän/selo/NFC/pedido/review |
| Avaliações | organização + DJ + fotógrafo + promoter + freelancer — `Review` genérico, gate por presença/compra/contratação, anônima opcional |
| Jobs/cron | scheduler in-process: `escrowAutoRelease` 15min, `locationCleanup` 30min, `seloReconcile` 60min (`JOBS_ENABLED=false` desativa) |
| Álbum de fotos | `events/:id/photos`, `photos/tagged`, `photos/tags/:id/approve·reject` — marca quem deu check-in, marcado aprova (→ selo 🎞️) |
| DJs | `djs` (ranking), `djs/me·:id`, `djs/:id/follow`, `events/:id/lineup` — perfil, seguir, line-up (→ selo 🎧) |
| Gorjetas | `djs/:id/tip`, `tips/mine`, `tips/:id/pay` — 20% Vonue / 80% DJ, sandbox, soma na reputação (→ selo 🪙) |
| Carteira | `wallet`, `wallet/withdraw` — `Wallet`/`LedgerEntry`/`Withdrawal`; escrow/gorjeta/ingresso creditam o líquido; saque sandbox |
| Timeline | `GET /timeline` — read-model agregando check-ins/selos/NFC/gorjetas/pedidos/fotos |
| Busca | `GET /search?q=` — descoberta global de eventos + DJs + produtos (read-model, q≥2) |
| Mobile | Welcome → Register → Onboarding → Núcleo → Home → Buscar/Eventos/Ingressos/Conexões/Loja/Notificações/Fotos/DJs/Gorjetas/Carteira/Promoter/Vagas/História/Árvore/Selos |
| Regras | 18+, JWT, núcleo, árvore anti-ciclo, selos, modo fantasma, compra atômica, notificações, review pós-checkin, foto p/ quem deu check-in, rankScore DJ, **liberação de escrow credita carteira via ledger atômico (comissões 10/12 · 20 · 8%)** |

Consulte [apps/api/README.md](apps/api/README.md) e [apps/mobile/README.md](apps/mobile/README.md).

---

*Vonue © 2025 — A cena em um lugar.*
