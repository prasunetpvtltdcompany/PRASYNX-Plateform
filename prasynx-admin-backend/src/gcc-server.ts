import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

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

import adminRoutesRefactored from './routes/refactored/admin.routes';
import analyticsRoutes from './routes/analytics.routes';
import legacyAdminRoutes from './routes/auth';
import globalCommandCenterRoutes from './routes/global-command-center.routes';

const app = express();

app.use('/api/', apiLimiter);
app.use('/api/v2/admin/login', authLimiter);

app.use(cors({
  origin: ['http://localhost:3005', 'http://localhost:3000', ...config.allowedOrigins],
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0' });
});

app.use('/api/v2/admin', adminRoutesRefactored);
app.use('/api/v2/admin', analyticsRoutes);
app.use('/api/v2/admin', globalCommandCenterRoutes);
app.use('/api/admin', legacyAdminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Admin API v2 is running', version: '2.0.0' });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, async () => {
  console.log(`Global Command Center backend running on http://localhost:${config.port}`);
  console.log(`  Legacy API:   http://localhost:${config.port}/api/admin`);
  console.log(`  Refactored:   http://localhost:${config.port}/api/v2`);
  console.log(`  GCC API:      http://localhost:${config.port}/api/v2/admin/gcc`);
});

export default app;
