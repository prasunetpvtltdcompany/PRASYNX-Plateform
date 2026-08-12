import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import './shared/types/express';
import { config } from './config';
import { requestId } from './shared/middleware/requestId';
import { apiLimiter } from './shared/middleware/rateLimit';
import { notFoundHandler, errorHandler } from './shared/middleware/errorHandler';
import healthRouter from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import organisationsRoutes from './modules/organisations/organisations.routes';
import classesRoutes from './modules/classes/classes.routes';
import studentsRoutes from './modules/students/students.routes';
import admissionsRoutes from './modules/admissions/admissions.routes';
import subjectsRoutes from './modules/subjects/subjects.routes';
import announcementsRoutes from './modules/announcements/announcements.routes';
import healthRoutes from './modules/health/health.routes';
import transportRoutes from './modules/transport/transport.routes';
import libraryRoutes from './modules/library/library.routes';
import hostelRoutes from './modules/hostel/hostel.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import examsRoutes from './modules/exams/exams.routes';
import timetableRoutes from './modules/timetable/timetable.routes';
import assignmentsRoutes from './modules/assignments/assignments.routes';
import financeRoutes from './modules/finance/finance.routes';
import staffRoutes from './modules/staff/staff.routes';
import promotionsRoutes from './modules/promotions/promotions.routes';
import disciplineRoutes from './modules/discipline/discipline.routes';
import aiRoutes from './modules/ai/ai.routes';
import activitiesRoutes from './modules/activities/activities.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import managementRoutes from './modules/management/management.routes';
import { authV2, managementV2 } from './modules/compat';

/** Compose the full Express app. Exported (not auto-listening) so tests & server.ts own lifecycle. */
export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  // Behind a load balancer / reverse proxy this makes req.ip reliable for rate limits + audit.
  // Use a numeric hop count — express-rate-limit v7 rejects the permissive boolean form.
  app.set('trust proxy', 1);

  // Order matters: requestId must be first so every log/error carries it.
  app.use(requestId);
  app.use(helmet());
  app.use(cookieParser());
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || config.allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('Origin not allowed by CORS'));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '256kb' }));
  // Global IP limiter - a coarse blast shield before any business logic.
  app.use('/api', apiLimiter);

  // Public
  app.use('/api/health', healthRouter);

  // Modules
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', usersRoutes);
  app.use('/api/v1/organisations', organisationsRoutes);
  app.use('/api/v1/classes', classesRoutes);
  app.use('/api/v1/students', studentsRoutes);
  app.use('/api/v1/admissions', admissionsRoutes);
  app.use('/api/v1/subjects', subjectsRoutes);
  app.use('/api/v1/announcements', announcementsRoutes);
  app.use('/api/v1/health', healthRoutes);
  app.use('/api/v1/transport', transportRoutes);
  app.use('/api/v1/library', libraryRoutes);
  app.use('/api/v1/hostel', hostelRoutes);
  app.use('/api/v1/attendance', attendanceRoutes);
  app.use('/api/v1/exams', examsRoutes);
  app.use('/api/v1/timetable', timetableRoutes);
  app.use('/api/v1/assignments', assignmentsRoutes);
  app.use('/api/v1/finance', financeRoutes);
  app.use('/api/v1/staff', staffRoutes);
  app.use('/api/v1/promotions', promotionsRoutes);
  app.use('/api/v1/discipline', disciplineRoutes);
  app.use('/api/v1/ai', aiRoutes);
  app.use('/api/v1/activities', activitiesRoutes);
  app.use('/api/v1/notifications', notificationsRoutes);
  app.use('/api/v1/management', managementRoutes);

  // Legacy v2 / workforce apps (prasynx-management-backend, prasynx-staff-backend)
  // NOTE: workforce must be mounted BEFORE the management v2 app, because that
  // legacy app ends with its own notFound/error terminal handlers.

  // Compatibility mounts for existing frontends still calling /api/v2
  app.use('/api/v2/auth', authV2);
  app.use('/api/v2/management', managementV2);

  // Terminal middleware
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}