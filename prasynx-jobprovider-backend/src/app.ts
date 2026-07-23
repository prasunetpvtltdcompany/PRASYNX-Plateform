import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import providerRoutes from './routes/index';

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

const app = express();

app.use('/api/', apiLimiter);
app.use('/api/job-provider/login', authLimiter);
app.use('/api/job-provider/forgot-password', authLimiter);
app.use(cookieParser());
app.use(cors({ origin: config.allowedOrigins, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

app.use('/api/job-provider', providerRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Job Provider API is running' });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
