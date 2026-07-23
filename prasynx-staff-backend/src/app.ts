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

import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './routes/refactored/auth.routes';
import staffRoutesRefactored from './routes/refactored/staff.routes';
import workforceRoutes from './routes/refactored/workforce.routes';

import notificationRoutes from './routes/notification.routes';

const app = express();

app.use('/api/', apiLimiter);
app.use('/api/v2/auth', authLimiter);

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

app.use('/api/v2/auth', authRoutes);
app.use('/api/v2/staff', staffRoutesRefactored);
app.use('/api/v2/notifications', notificationRoutes);
app.use('/api/workforce', workforceRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Staff API v2 is running', version: '2.0.0' });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
