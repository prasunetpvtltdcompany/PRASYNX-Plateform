import express from 'express';
import { config } from './config';
import { corsMiddleware } from './lib/backend-common';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/voice', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
