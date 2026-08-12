import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { service: 'prasynx-server' },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: isDev
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
    : undefined,
});

export function childLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings);
}