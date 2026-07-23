import cors from 'cors';

export function createCorsMiddleware(origins: string[]) {
  return cors({
    origin: origins,
    credentials: true,
  });
}
