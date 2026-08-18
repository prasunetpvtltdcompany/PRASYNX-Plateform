import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import express from 'express';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const generatePassword = (): string => crypto.randomBytes(8).toString('hex');

export const corsMiddleware = cors({
  origin: ['http://localhost:3001'],
  credentials: true
});

export const jsonBodyParser = express.json();
