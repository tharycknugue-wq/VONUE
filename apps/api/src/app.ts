import http from 'http';
import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { logger } from './lib/logger';
import { initSocket } from './socket';
import { startJobs, stopJobs } from './jobs/scheduler';
import routes from './routes';
import { globalLimiter } from './middlewares/rateLimit';
import { errorHandler, notFound } from './middlewares/error';

const app = express();

// Build web do app (Expo export). Se presente, a MESMA origem serve o
// app + a API → um único link compartilhável, sem CORS.
const webDist = path.join(__dirname, '..', '..', 'mobile', 'dist');
const hasWeb = fs.existsSync(path.join(webDist, 'index.html'));

// CSP/CORP do helmet bloqueariam o SPA — relaxado quando servimos o web.
app.use(
  helmet(
    hasWeb
      ? { contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }
      : undefined
  )
);
app.use(cors());
// Webhook do Stripe precisa do corpo cru para verificar a assinatura —
// registrado antes do express.json (que então o ignora via req._body).
app.use('/payments/webhook', express.raw({ type: '*/*' }));
app.use(express.json({ limit: '1mb' }));
app.use(globalLimiter);

if (hasWeb) app.use(express.static(webDist));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'vonue-api', time: new Date().toISOString() });
});

app.use(routes);

if (hasWeb) {
  // SPA fallback: qualquer GET não-API devolve o app.
  app.get('*', (req, res, next) => {
    if (req.method !== 'GET') return next();
    res.sendFile(path.join(webDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
initSocket(server);

server.listen(env.PORT, () => {
  logger.info(`🎶 Vonue API rodando em http://localhost:${env.PORT} (${env.NODE_ENV})`);
  logger.info('📍 Socket.io do mapa ao vivo ativo');
  if (hasWeb) logger.info('🌐 App web servido na mesma origem (/)');
  startJobs();
});

const shutdown = (signal: string) => {
  logger.info(`${signal} recebido — encerrando...`);
  stopJobs();
  server.close(() => process.exit(0));
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export { app };
