import { supabase as _supabase } from '../../config/database';
export const supabase = _supabase;
import cors from 'cors';
import crypto from 'crypto';
import express from 'express';

export const generatePassword = (): string => crypto.randomBytes(8).toString('hex');

export const corsMiddleware = cors({
  origin: ['http://localhost:3005'],
  credentials: true
});

export const jsonBodyParser = express.json();
