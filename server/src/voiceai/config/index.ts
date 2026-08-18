import { config as serverConfig } from '../../config';

/**
 * VoiceAI config — merged into the monolith. Reuses the server's shared
 * config (JWT secret, supabase credentials, allowed origins) and only keeps
 * VoiceAI-specific env vars locally.
 */
export const config = {
  port: serverConfig.port,
  supabaseUrl: serverConfig.supabase.url,
  supabaseKey: serverConfig.supabase.serviceRoleKey,
  jwtSecret: serverConfig.jwtSecret,
  nvidiaApiKey: process.env.NVIDIA_API_KEY || '',
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  corsOrigins: serverConfig.allowedOrigins,
};