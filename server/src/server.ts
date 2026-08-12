import 'dotenv/config';
import { createApp } from './app';
import { config } from './config';
import { connectCache } from './infrastructure/cache/cache';
import { startWorker } from './infrastructure/jobs/queue';
import { communicationService } from './modules/communication/communication.service';
import { logger } from './shared/logger/logger';

async function bootstrap() {
  await connectCache();
  communicationService.registerHandlers();
  startWorker();

  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info({ port: config.port, env: config.nodeEnv }, 'PRASYNX API listening');
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Received shutdown signal, draining');
    server.close(() => process.exit(0));
    // Safety net: force-exit if connections refuse to drain.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Fatal boot error');
  process.exit(1);
});