# Imagem de produção do Vonue — UMA imagem que builda o app web (Expo
# export) + a API e serve os dois na mesma porta (um único link).
# Deploy: Fly.io, Railway, Cloud Run, ECS… (build em Linux → o bug de
# web build do Windows não ocorre aqui).
#
# Stage único de propósito: garante que o engine do Prisma e o output
# do Expo gerados no build sobrevivam (tradeoff: imagem maior — ok p/
# demo). openssl é exigido pelo Prisma.

FROM node:20-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production CI=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Dependências (cacheável): precisa das devDependencies para o build,
# mesmo com NODE_ENV=production.
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/mobile/package.json apps/mobile/package.json
RUN npm install --include=dev

# Código + build (web export → apps/mobile/dist, API → apps/api/dist).
COPY . .
RUN npx prisma generate --schema apps/api/prisma/schema.prisma \
  && npm run web:build \
  && npm run build --workspace apps/api

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# No start: aplica o schema no banco (demo: db push), roda o seed
# (idempotente — selos/usuário origem/evento de exemplo) e sobe a API
# que também serve o app web. O seed é tolerante a falha pra nunca
# travar o boot num restart. Em produção real, troque por migrate deploy.
CMD ["sh", "-c", "npx prisma db push --schema apps/api/prisma/schema.prisma --skip-generate && (npm run seed --workspace apps/api || echo 'seed: ignorado') && node apps/api/dist/app.js"]
