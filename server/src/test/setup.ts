// Runs before every test module is imported, so the config/env layer never
// throws while tests bootstrap (they import services that read config).
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test-project.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key-12345678901234567890';
process.env.SUPABASE_ANON_KEY = 'test-anon-key-123456789012345678901234';
process.env.JWT_SECRET = 'test-secret-0123456789abcdefghijklmnopqrstuvwxyz';
process.env.JWT_ACCESS_TTL = '15m';
process.env.JWT_REFRESH_TTL = '30d';
process.env.BCRYPT_ROUNDS = '4';