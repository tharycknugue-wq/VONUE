# 🚀 Como ter o link do Vonue (passo a passo, ~10 min)

Caminho mais simples: **Render** (grátis, link permanente, build em
Linux — sem o bug de Windows). Eu não consigo fazer por você (precisa
das *suas* contas GitHub e Render), mas é só seguir.

---

## Pré-requisito: o projeto num repositório GitHub

Você precisa de conta no GitHub (grátis). Na pasta do projeto:

```bash
git init
git add -A
git commit -m "Vonue"
git branch -M main
```

Crie um repositório vazio em **github.com/new** (pode ser privado).
Depois, com a URL dele:

```bash
git remote add origin https://github.com/SEU-USUARIO/vonue.git
git push -u origin main
```

> Tem o GitHub CLI logado? Atalho: `gh repo create vonue --private --source=. --push`

---

## Deploy no Render (3 cliques)

1. Crie conta grátis em **https://render.com** (entre com o GitHub).
2. Botão **New +** → **Blueprint**.
3. **Connect** o repositório `vonue` que você acabou de subir.
4. O Render lê o `render.yaml` e mostra 3 recursos: **vonue** (web),
   **vonue-db** (Postgres), **vonue-redis** (Redis). Clique **Apply**.
5. Espere o build (**~3–7 min** no 1º; veja em *Logs* — ele instala
   deps, builda o app web + a API, cria as tabelas e roda o seed).

Quando aparecer **Live**, abra a aba do serviço **vonue**: no topo tem
a URL `https://vonue-XXXX.onrender.com`.

# ✅ Essa URL é o link. Mande para quem quiser — abre no celular e no PC.

---

## O que esperar (normal, não é erro)

- **Free tier dorme** após ~15 min sem uso: a 1ª visita depois leva
  ~30–60 s pra acordar. Recarregue.
- O mapa ao vivo usa **posição simulada** se o navegador negar
  localização — continua demonstrável.
- Pagamento de ingresso roda em **sandbox** até você pôr chaves Stripe
  (opcional; em *Environment* do serviço). Marketplace/gorjetas são
  sandbox por design.
- Cada `git push` na `main` re-deploya sozinho.

## Login para testar
Use o app: **Criar conta** → onboarding (20 perguntas) → núcleo → Home.
Há um usuário origem semeado (`tharyck` / `tharyck@vonue.app`,
senha `vonue-origin`) e o evento **Vonue Genesis** com lotes.

---

Outros caminhos (túnel instantâneo sem conta; container Fly.io/Railway):
ver **[DEPLOY.md](DEPLOY.md)**. Arquitetura/decisões: **[CLAUDE.md](CLAUDE.md)**,
visão de produto: **[ONBOARDING.md](ONBOARDING.md)**.
