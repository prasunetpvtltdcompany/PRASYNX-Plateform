import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4003', 10),
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '',
  jwtSecret: process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET must be set in environment'); })(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3003').split(',')
};

if (!config.supabaseUrl || !config.supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY must be set');
}
