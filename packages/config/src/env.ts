import 'dotenv/config';
import { z } from 'zod';

/**
 * Strict, fail-fast environment contract.
 * The server refuses to boot when a required variable is missing instead of
 * failing per-request at runtime with confusing errors.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),

  JWT_SECRET: z.string().min(32).default('change-me-to-a-64-char-random-string'),
  JWT_ISSUER: z.string().min(1).default('prasynx-api'),
  JWT_AUDIENCE: z.string().min(1).default('prasynx-portals'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(16).default(12),

  REDIS_URL: z.string().optional().default(''),

  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004,http://localhost:3005')
    .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)),

  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().optional().default('PRASYNX <no-reply@yourdomain.com>'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

/** Throws with a clear message listing every missing/malformed variable. */
export function loadEnv(overrides: Record<string, unknown> = {}): Env {
  const source = { ...process.env, ...overrides };
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}