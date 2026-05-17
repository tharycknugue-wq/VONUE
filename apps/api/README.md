# Vonue API

Node + Express + TypeScript + Prisma (PostgreSQL) + Redis.

## Comandos

```bash
npm run dev            # desenvolvimento (ts-node-dev)
npm run build          # compila para dist/
npm start              # produção (node dist/app.js)
npm run typecheck      # checagem de tipos sem emitir
npm run generate       # prisma generate
npm run migrate        # prisma migrate dev
npm run migrate:deploy # prisma migrate deploy (produção)
npm run seed           # popula selos de conector + usuário origem
npm run studio         # Prisma Studio
```

## Variáveis de ambiente

A API lê `apps/api/.env`. Copie a partir da raiz:

```bash
cp ../../.env.example .env
```

Obrigatórias: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`.

## Endpoints implementados (fatia vertical)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET  | `/health`             | —   | Healthcheck |
| POST | `/auth/register`      | —   | Cadastro (valida 18+, e-mail/usuário/CPF únicos) |
| POST | `/auth/login`         | —   | Login por e-mail **ou** usuário |
| POST | `/auth/refresh`       | —   | Novo par de tokens via `refreshToken` |
| POST | `/auth/verify-cpf`    | —   | Valida dígitos do CPF e disponibilidade |
| GET  | `/onboarding/questions` | — | As 20 perguntas (sem as pontuações) |
| POST | `/onboarding/complete`  | JWT | Envia respostas, calcula e salva o núcleo |
| GET  | `/users/me`           | JWT | Perfil do usuário autenticado + onboarding |
| POST | `/users/me/invite`    | JWT | Gera/reutiliza link de convite da árvore |
| GET  | `/users/me/arvore`    | JWT | Minha árvore (superior + Thräns + termo Drün/Rhän) |
| POST | `/arvore/confirm-superior` | JWT | Confirma quem te inseriu (via inviteCode) |
| GET  | `/selos/mine`         | JWT | Meus selos (inclui selos de conector) |
| GET  | `/events`             | —   | Lista eventos (`?scope=upcoming\|past\|all&city=&style=`) |
| POST | `/events`             | JWT | Cria evento (auto-provisiona Organizer + Venue + selo) |
| GET  | `/events/:id`         | —   | Detalhe (venue, organizer, line-up, ingressos) |
| GET  | `/events/:id/checkins`| —   | Quem fez check-in (base do mapa) |
| POST | `/events/:id/checkin` | JWT | Check-in → selo do evento + gatilho da árvore |
| GET  | `/map/event/:id`      | JWT | Snapshot ao vivo dos ravers no evento (Redis) |
| POST | `/events/:id/ticket-types` | JWT | Cria lotes (apenas o organizador do evento) |
| POST | `/tickets/purchase`   | JWT | Inicia compra → PENDING (Stripe PaymentIntent ou sandbox; `promoterCode` opcional) |
| POST | `/payments/webhook`   | —   | Webhook Stripe (assinado) → emite ingressos |
| POST | `/payments/confirm`   | JWT | Sandbox: confirma (recusado se for Stripe) |
| GET  | `/payments/:id`       | JWT | Status do pagamento (+ provider) |
| GET  | `/tickets/mine`       | JWT | Meus ingressos (com QR e status) |
| POST | `/tickets/checkin`    | JWT | Valida QR → USED + check-in do evento (selo/árvore/mapa) |
| POST | `/nfc/token`          | JWT | Gera etiqueta NFC efêmera (Redis, 120s) |
| POST | `/nfc/connect`        | JWT | Conecta via token → conexão PENDING (1h p/ arrependimento) |
| GET  | `/nfc/connections`    | JWT | Minhas conexões (estado derivado) |
| POST | `/nfc/accept/:id`     | JWT | Confirma a conexão (encerra o arrependimento) |
| DELETE | `/nfc/reject/:id`   | JWT | Arrependimento — desfaz dentro de 1h |
| GET  | `/store/products`     | —   | Lista produtos (`?category=&q=&eventId=`) |
| POST | `/store/products`     | JWT | Anuncia um produto (vendedor = você) |
| GET  | `/store/products/:id` | —   | Detalhe do produto + vendedor |
| POST | `/store/orders`       | JWT | Cria pedido (1 vendedor) → PENDING + comissão/payout |
| POST | `/store/orders/:id/pay` | JWT | Sandbox: paga → PAID (escrow, baixa estoque) |
| POST | `/store/orders/:id/confirm` | JWT | Comprador confirma → DELIVERED (libera) |
| POST | `/store/orders/:id/dispute` | JWT | Abre disputa → DISPUTED (revisão manual) |
| GET  | `/store/orders`       | JWT | Minhas compras (auto-release 48h) |
| GET  | `/store/orders/sales` | JWT | Minhas vendas (visão do vendedor) |
| GET  | `/store/orders/:id`   | JWT | Detalhe (comprador ou vendedor) |
| GET  | `/notifications`      | JWT | Inbox (`?unread=true`) + `unreadCount` |
| POST | `/notifications/token`| JWT | Registra fcmToken do dispositivo |
| POST | `/notifications/:id/read` | JWT | Marca uma como lida |
| POST | `/notifications/read-all` | JWT | Marca todas como lidas |
| GET  | `/events/:id/reviews` | —   | Reputação da organização + avaliações do evento |
| POST | `/events/:id/review`  | JWT | Avalia a organização (1–5, pós check-in, única) |
| GET  | `/djs/:id/reviews`    | —   | Reputação do DJ + avaliações |
| POST | `/djs/:id/review`     | JWT | Avalia o DJ (esteve em evento do line-up dele, única) |
| GET  | `/photos/:id/reviews` | —   | Reputação do fotógrafo da foto + avaliações |
| POST | `/photos/:id/review`  | JWT | Avalia o fotógrafo (aprovou foto dele, única) |
| POST | `/events/:id/promoters` | JWT | Organizador credencia um promoter (comissão) |
| GET  | `/promoters/me`       | JWT | Meu perfil de promoter (código + eventos + vendas) |
| GET  | `/promoters/:id/reviews` | — | Reputação do promoter |
| POST | `/promoters/:id/review`  | JWT | Avalia o promoter (comprou via ele, única) |
| GET  | `/jobs/open`          | —   | Vagas abertas (descoberta de freela) |
| GET  | `/events/:id/jobs`    | —   | Vagas do evento |
| POST | `/events/:id/jobs`    | JWT | Organizador publica vaga |
| GET  | `/jobs/:id`           | opt | Detalhe (visão organizador vs candidato) |
| POST | `/jobs/:id/apply`     | JWT | Candidatar-se |
| POST | `/jobs/applications/:id/accept` | JWT | Organizador contrata (FILLED) |
| GET  | `/jobs/:id/reviews`   | —   | Reputação do freelancer contratado |
| POST | `/jobs/:id/review`    | JWT | Organizador avalia o freelancer contratado |
| GET  | `/events/:id/photos`  | —   | Álbum público do evento (fotógrafo + marcados) |
| POST | `/events/:id/photos`  | JWT | Publica foto (auto-provisiona fotógrafo; marca quem deu check-in) |
| GET  | `/photos/tagged`      | JWT | Fotos em que te marcaram + status |
| POST | `/photos/tags/:id/approve` | JWT | Aprova a marcação (1ª → selo 🎞️) |
| POST | `/photos/tags/:id/reject`  | JWT | Recusa a marcação |
| POST | `/djs`                | JWT | Cria/edita meu perfil de DJ |
| GET  | `/djs/me`             | JWT | Meu perfil de DJ (ou null) |
| GET  | `/djs`                | opt | Ranking (rankScore) + isFollowing |
| GET  | `/djs/:id`            | opt | Perfil do DJ + próximos sets |
| POST | `/djs/:id/follow`     | JWT | Seguir (notifica o DJ) |
| DELETE | `/djs/:id/follow`   | JWT | Deixar de seguir |
| POST | `/events/:id/lineup`  | JWT | Organizador adiciona DJ ao line-up (→ selo 🎧) |
| POST | `/djs/:id/tip`        | JWT | Cria gorjeta (20% Vonue / 80% DJ) → PENDING |
| POST | `/tips/:id/pay`       | JWT | Sandbox: paga → PAID (notifica DJ, +score, selo 🪙) |
| GET  | `/tips/mine`          | JWT | Minhas gorjetas (enviadas + recebidas) |
| GET  | `/wallet`             | JWT | Saldo + totais + extrato (ledger, 50) |
| POST | `/wallet/withdraw`    | JWT | Saque (sandbox) → debita saldo + ledger |
| GET  | `/timeline`           | JWT | Linha do tempo do usuário (read-model agregado) |
| GET  | `/search?q=`          | —   | Busca global: eventos + DJs + produtos |

### Tempo real (Socket.io)

Conexão WebSocket no mesmo host/porta. Handshake autenticado:
`io(API_URL, { auth: { token: <accessToken> } })`.

| Evento (cliente → servidor) | Payload | Efeito |
|---|---|---|
| `map:join` | `{ eventId }` | Exige check-in; entra na sala e recebe `map:snapshot` |
| `map:location` | `{ eventId, lat, lng }` | Salva no Redis (TTL lógico 60s) e faz broadcast `map:peer` |
| `map:ghost` | `{ eventId, enabled }` | Modo fantasma: some do mapa (`map:peer-left`) |
| `map:leave` | `{ eventId }` | Sai da sala e do Redis |

Servidor → cliente: `map:snapshot`, `map:peer`, `map:peer-left`, `map:error`.
Limpeza automática no `disconnect`. Só quem fez check-in entra/aparece.

### Exemplo

```bash
# Cadastro
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"raver01","name":"Ana","email":"ana@x.com","password":"segredo123","gender":"FEMININE","birthDate":"2000-05-01"}'

# Onboarding (com o accessToken retornado)
curl -X POST http://localhost:3000/onboarding/complete \
  -H 'Authorization: Bearer <accessToken>' -H 'Content-Type: application/json' \
  -d '{"answers":[{"questionId":"q1","optionId":"a"}, ... ]}'
```

> **Pagamento de ingresso — Stripe real ou sandbox (por env):**
> `payment.service` escolhe o provedor: com `STRIPE_SECRET_KEY` cria um
> **PaymentIntent** real (retorna `clientSecret`; índice `payintent:{pi}`
> → paymentId no Redis) confirmado por `POST /payments/webhook`
> (assinatura verificada com `STRIPE_WEBHOOK_SECRET`; body cru montado
> antes do `express.json` em `app.ts`). Sem a chave → sandbox, confirmado
> por `POST /payments/confirm`. Núcleo `ticket.finalizePayment` é
> idempotente e compartilhado pelos dois; `confirmSandbox` recusa se o
> pagamento for Stripe. **Marketplace e gorjetas seguem sandbox** (só o
> seam de ingresso foi para produção). Mobile (Expo Go) continua no
> sandbox; o `clientSecret` é para um cliente real (web/native build).

> **NFC sem hardware:** o "toque" é um token efêmero (Redis 120s) que o
> outro aparelho lê. Em produção o token viaja na tag NDEF; o restante
> (conexão + arrependimento de 1h) já está no formato final.

> **Escrow:** `PENDING → PAID (retido) → DELIVERED (liberado)`; disputa
> vira `DISPUTED`. Liberação automática após 48h sem disputa (varredura
> oportunista nas listagens — produção usaria um job/cron). Comissão
> 10% (produto de evento) / 12% (terceiro). Pagamento ainda é sandbox.

> **Notificações:** inbox persistido (`Notification`) é a fonte de verdade;
> `sendPush` dispara FCM real só se `FCM_SERVER_KEY` estiver definido
> (sandbox apenas registra). `notifySafe` nunca quebra o fluxo chamador.
> Disparado em: novo Thrän, selo ganho, conexão NFC, pedido pago/
> liberado/disputado, nova avaliação.

> **Avaliações:** `Review` genérico por `targetType`. **ORGANIZER**:
> escopado ao evento, gate = check-in, atualiza `Organizer.rating`.
> **DJ**: gate = ter check-in num evento onde o DJ tocou (line-up),
> uma por DJ, agregado exposto em `GET /djs/:id`. **PHOTOGRAPHER**:
> gate = ter aprovado uma foto desse fotógrafo (`PhotoTag` APPROVED),
> uma por fotógrafo. **PROMOTER**: gate = ter comprado ingresso via
> esse promoter (`Ticket.promoterId`), atualiza `Promoter.rating`.
> **FREELANCER**: gate = ser o organizador que contratou (job `FILLED`
> com `hiredUserId`); review por vaga. Anti-self + anti-duplicidade e
> anonimato em todos os alvos.

> **Promoter:** organizador credencia (`POST /events/:id/promoters` →
> upsert `Promoter` + `EventPromoter` com comissão, default 10%). O
> promoter divulga `code = promoter.id`; comprador passa `promoterCode`
> no purchase → no confirm o `Ticket.promoterId` é setado, `totalSales`
> incrementa e o split do pagamento vira: **8% Vonue → comissão do
> promoter → resto ao organizador**, todos creditados via `wallet.credit`.

> **Vagas/freelancer:** `JobPosting`/`JobApplication`. Organizador
> publica vaga no evento → freelancers se candidatam → organizador
> contrata (1 `ACCEPTED`, demais `REJECTED`, job `FILLED` +
> `hiredUserId`). A contratação é o gate do review FREELANCER. Sem
> economia (cachê é informativo; sem split/wallet — não há etapa de
> pagamento de freela no doc).

> **Jobs/cron:** scheduler in-process (`jobs/scheduler.ts`) iniciado no
> boot, desativável com `JOBS_ENABLED=false` (e off em test). Jobs:
> `escrowAutoRelease` (15min — antes era varredura oportunista nas
> listagens), `locationCleanup` (30min — apaga hash Redis de eventos
> encerrados ≤7d), `seloReconcile` (60min — reconcilia selos de
> conector). Cada execução é isolada (falha não derruba as demais);
> `unref()` para não travar o shutdown. Produção escalaria para Bull/cron.

> **Álbum de fotos:** `Photo`/`PhotoTag`. Upload auto-provisiona um
> `Professional` (foundation stage) e só marca quem fez check-in no
> evento; o marcado aprova/recusa (1ª aprovação → selo `Eternizado`).
> Sandbox: sem upload binário — `imageUrl` é uma URL pública (produção
> wireia S3/CloudFront + multipart).

> **DJs:** perfil único por usuário (`DJ.userId @unique`, auto-upsert).
> `rankScore = seguidores + 2×line-ups`, recalculado em follow/unfollow/
> line-up; ordem do ranking derivada na listagem (coluna `rank` não é
> mantida). `optionalAuth` resolve `isFollowing` em rotas públicas.
> Entrar num line-up concede o selo `No Palco` e notifica o DJ.

> **Gorjetas:** `Tip` (model novo). Comissão fixa de 20% (Vonue) / 80%
> líquido ao DJ. `PENDING → PAID` (sandbox, como o marketplace). Pagar
> notifica o DJ, soma na reputação (`+3` por gorjeta paga no rankScore)
> e concede o selo `Mão Aberta` ao primeiro tip do usuário.

> **Carteira/repasse:** `Wallet`/`LedgerEntry`/`Withdrawal`. O dinheiro
> deixa de ser só status: liberar escrow (`settleOrder`, usado por
> confirm **e** pelo job de auto-release), pagar gorjeta e confirmar
> ingressos creditam o **líquido** na carteira do recebedor via `credit()`
> (transação atômica wallet+ledger). Saque é sandbox (debita + registra).
> Comissões: marketplace 10/12%, gorjeta 20%, ingresso 8%.

> **Timeline:** read-model puro (`timeline.service`) — sem schema novo.
> Agrega check-ins, selos, conexões NFC, gorjetas (enviadas/recebidas),
> pedidos e fotos aprovadas; cada fonte limitada a 40, merge + sort desc,
> top 60. Tudo derivado dos modelos existentes.

> **Busca:** `search.service` — `q` mínimo 2 chars; 3 consultas em
> paralelo (eventos publicados por nome/cidade, DJs por nome,
> produtos ativos por nome), 12 por tipo. Pública, read-model.

## Próximas features (modelo de dados já no Prisma)

Integração real de PSP (Stripe/Pix) no lugar do sandbox, upload
binário S3, push FCM nativo, busca full-text/relevância. Todos os
alvos de review (organização/DJ/fotógrafo/promoter/freelancer) e os
fluxos do documento estão implementados.
