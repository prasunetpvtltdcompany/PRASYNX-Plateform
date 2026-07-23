import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again after 15 minutes' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts, please try again after 15 minutes' }
});

import { supabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import adminRoutesRefactored from './routes/refactored/admin.routes';
import analyticsRoutes from './routes/analytics.routes';
import gccRoutes from './routes/global-command-center.routes';

const app = express();

app.use('/api/', apiLimiter);
app.use('/api/v2/admin/login', authLimiter);

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cookieParser());
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0' });
});

app.use('/api/v2/admin', adminRoutesRefactored);
app.use('/api/v2/admin', analyticsRoutes);
app.use('/api/v2/admin', gccRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Admin API v2 is running', version: '2.0.0' });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, async () => {
  console.log(`Admin backend v2 running on http://localhost:${config.port}`);
  console.log(`  Legacy API:  http://localhost:${config.port}/api/admin`);
  console.log(`  Refactored:  http://localhost:${config.port}/api/v2`);
});

export default app;
