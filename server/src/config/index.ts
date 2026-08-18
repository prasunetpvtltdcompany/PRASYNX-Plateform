import { loadEnv } from '@prasynx/config';

// Throws fast if env is malformed (never boot half-configured).
const env = loadEnv();

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,

  supabase: {
    url: env.SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: env.SUPABASE_ANON_KEY,
  },

  jwt: {
    secret: env.JWT_SECRET,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    accessTtl: env.JWT_ACCESS_TTL,
    refreshTtl: env.JWT_REFRESH_TTL,
    bcryptRounds: env.BCRYPT_ROUNDS,
  },
  // Backwards-compatible top-level JWT fields used by older modules
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_ACCESS_TTL,

  redisUrl: env.REDIS_URL,
  allowedOrigins: env.ALLOWED_ORIGINS,

  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.SMTP_FROM,
  },

  frontendUrl: env.FRONTEND_URL,
} as const;

export type Config = typeof config;