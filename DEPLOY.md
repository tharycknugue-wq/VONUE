# Deploy / link compartilhável

O app web (Expo export) e a API são servidos **na mesma origem**: um
único link entrega tudo (sem CORS, sem configurar `EXPO_PUBLIC_API_URL`).

> Eu (assistente) **não consigo emitir o link por você** — exige rodar
> num host/máquina com suas contas. Abaixo, os caminhos prontos.

> ⚠️ **Build web no Windows está quebrado por bug do Expo SDK 50**
> (ele tenta criar a pasta `node:sea` — `:` é inválido no NTFS; o Node
> 20 introduziu esse builtin). **Não é o nosso código** (typecheck
> API+mobile passa limpo). Na **Linux** (Render) o build funciona — por
> isso a Opção A abaixo é a recomendada.

---

## Opção A — Link permanente no Render (recomendado, build em Linux)

1. Suba o projeto num repositório GitHub seu:
   ```bash
   git init && git add -A && git commit -m "Vonue"
   git branch -M main
   git remote add origin <seu-repo>.git && git push -u origin main
   ```
2. **render.com** (conta grátis) → *New +* → *Blueprint* → conecte o
   GitHub e selecione o repo. O Render lê o [`render.yaml`](render.yaml)
   e mostra 3 recursos: **vonue** (web), **vonue-db** (Postgres),
   **vonue-redis**. Clique *Apply*.
3. Aguarde o 1º build (~3–7 min: instala deps, builda o web e a API,
   `prisma db push`, seed). Acompanhe em *Logs*.
4. Pronto: a aba do serviço **vonue** mostra a URL fixa
   (`https://vonue-XXXX.onrender.com`). **Esse é o link** — abre o app
   no navegador (desktop/celular). Compartilhe com quem quiser.

**Checklist / o que esperar**
- `JWT_SECRET`/`JWT_REFRESH_SECRET`: gerados automaticamente (não mexa).
- `DATABASE_URL`/`REDIS_URL`: ligados automaticamente aos recursos.
- **Free tier dorme** após ~15 min sem acesso: a 1ª request depois
  demora ~30–60 s pra "acordar" (normal; não é erro).
- Redis grátis no Render é pequeno (ok p/ demo). Sem Redis grátis na
  sua região, crie um Upstash grátis e cole a URL em `REDIS_URL`
  (sobrescreve o `fromService`).
- **Pagamento real de ingresso** (opcional): no painel do serviço
  *Environment*, preencha `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET`
  (sem isso = sandbox). No Stripe, aponte o webhook para
  `https://SEU-LINK/payments/webhook`.
- Re-deploy a cada `git push` na `main` (automático).

---

## Opção B — Link público instantâneo, sem conta (Linux/macOS/WSL)

Link `https://*.trycloudflare.com` temporário (vive enquanto sua
máquina roda isso). **No Windows, rode via WSL** (Ubuntu) por causa do
bug acima.

```bash
npm install
cp .env.example .env ; cp .env apps/api/.env   # ajuste os JWT_*
npm run db:up && npm run db:migrate && npm run db:seed
npm run share          # web:build + API servindo o web (porta 3000)

# noutro terminal — cloudflared (https://github.com/cloudflare/cloudflared)
cloudflared tunnel --url http://localhost:3000
```

O `cloudflared` imprime `https://<algo>.trycloudflare.com` — esse é o
link. Equivalentes: `npx localtunnel --port 3000`, `ngrok http 3000`.

---

## Opção C — Container (Fly.io / Railway / Cloud Run)

Usa o [`Dockerfile`](Dockerfile) da raiz: **uma imagem** builda o web
(Expo export) + a API e serve tudo numa porta. Build roda em Linux →
sem o bug do Windows.

**Fly.io** (precisa de `flyctl` + conta):

```bash
fly launch --no-deploy           # escolhe um nome único; ajusta fly.toml
fly postgres create              # anote a DATABASE_URL gerada
# Redis: crie um Upstash grátis (https://upstash.com) e copie a URL
fly secrets set \
  DATABASE_URL="postgres://..." \
  REDIS_URL="rediss://..." \
  JWT_SECRET="$(openssl rand -hex 32)" \
  JWT_REFRESH_SECRET="$(openssl rand -hex 32)"
fly deploy                       # build da imagem + deploy
```

`fly deploy` termina com a URL `https://<seu-app>.fly.dev` — **o link**.

**Railway**: *New Project → Deploy from GitHub*; ele detecta o
`Dockerfile`. Adicione plugins **Postgres** e **Redis** e as variáveis
`DATABASE_URL`/`REDIS_URL`/`JWT_SECRET`/`JWT_REFRESH_SECRET`. A URL
pública gerada é o link.

**Local (testar a imagem):** `npm run db:up` e então
`docker compose --profile full up --build` → app completo em
`http://localhost:3000`.

> Pagamento de ingresso real: setar `STRIPE_SECRET_KEY` /
> `STRIPE_WEBHOOK_SECRET` como secrets; webhook → `https://LINK/payments/webhook`.

---

## Notas

- Web cai para **posição simulada** se o navegador negar geolocalização.
- Sessão no web usa `localStorage` (nativo usa keychain seguro).
- Marketplace e gorjetas seguem **sandbox**; ingresso usa Stripe se as
  chaves estiverem setadas (ver [apps/api/README.md](apps/api/README.md)).
- Link público é acessível a qualquer um com a URL — não use dados
  sensíveis num ambiente de demonstração.
