import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import express from 'express';

dotenv.config();

export { supabase } from '../config/database';

export const generatePassword = (): string => crypto.randomBytes(8).toString('hex');

export const corsMiddleware = cors({
  origin: ['http://localhost:3003'],
  credentials: true
});

export const jsonBodyParser = express.json();
