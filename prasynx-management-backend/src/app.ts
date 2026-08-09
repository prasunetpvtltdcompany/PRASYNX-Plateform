import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import { universalAudit } from './middleware/universal-audit';

// Route imports
import authRoutes from './routes/refactored/auth.routes';
import managementRoutesRefactored from './routes/refactored/management.routes';
import managementCRUDRoutes from './routes/management';
import notificationRoutes from './routes/notification.routes';

// V2 route imports
import riskDetectionRoutes from './routes/refactored/risk-detection.routes';
import teacherPerformanceRoutes from './routes/refactored/teacher-performance.routes';
import institutionIntelligenceRoutes from './routes/refactored/institution-intelligence.routes';
import esportsRoutesV2 from './routes/refactored/esports.routes';
import collaborationRoutesV2 from './routes/refactored/collaboration.routes';
import biometricsRoutesV2 from './routes/refactored/biometrics.routes';
import analyticsRoutesV2 from './routes/refactored/analytics.routes';
import auditLogsRoutesV2 from './routes/refactored/audit-logs.routes';
import classRoutesV2 from './routes/refactored/class.routes';
import timetableRoutesV2 from './routes/refactored/timetable.routes';
import attendanceRoutesV2 from './routes/refactored/attendance.routes';
import { attachSupabase } from './middleware/attachSupabase';
import examRoutesV2 from './routes/refactored/exam.routes';
import libraryRoutesV2 from './routes/refactored/library.routes';
import assignmentRoutesV2 from './routes/refactored/assignment.routes';
import academicAnalyticsRoutes from './routes/academic-analytics.routes';
import aiTeachingRoutesV2 from './routes/ai-teaching.routes';
import predictiveAiRoutesV2 from './routes/refactored/predictive-ai.routes';
import feeManagementRoutesV2 from './routes/refactored/fee-management.routes';
import scholarshipRoutesV2 from './routes/refactored/scholarship.routes';
import payrollRoutesV2 from './routes/refactored/payroll.routes';
import accountsRoutesV2 from './routes/refactored/accounts.routes';
import rolesRoutesV2 from './routes/refactored/roles.routes';
import credentialsRoutesV2 from './routes/refactored/credentials.routes';
import storeRoutesV2 from './routes/refactored/store.routes';
import transportRoutesV2 from './routes/refactored/transport.routes';
import hostelRoutesV2 from './routes/refactored/hostel.routes';
import staffExpensesRoutesV2 from './routes/refactored/staff-expenses.routes';
import academicRoutesV4 from './routes/v4/academic.routes';
import homeworkRoutesV4 from './routes/v4/homework.routes';
import promotionRoutesV4 from './routes/v4/promotion.routes';
import marksRoutesV4 from './routes/v4/marks.routes';
import communicationRoutesV4 from './routes/v4/communication.routes';
import disciplineRoutesV4 from './routes/v4/discipline.routes';
import healthRoutesV4 from './routes/v4/health.routes';
import exportRoutesV4 from './routes/v4/export.routes';
import auditRoutesV4 from './routes/v4/audit.routes';
import wosRoutes from './routes/wos.routes';
import admissionManagementRoutes from './routes/admission-management';
import eventsManagementRoutes from './routes/events-management';

const app = express();

// Global middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cookieParser());
app.use('/api/v2/auth/login', authLimiter);
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use('/api/', apiLimiter);

// Global audit capture — logs every successful state-changing request
// across all routers (management, v2/v4, events, admissions, wos, …)
app.use(universalAudit());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0' });
});

// Auth routes
app.use('/api/v2/auth', authRoutes);

// Management CRUD routes (with auth middleware inside)
app.use('/api/v2/management', managementRoutesRefactored);
app.use('/api/management', managementCRUDRoutes);

// Notifications
app.use('/api/v2/notifications', notificationRoutes);

// V2 feature routes
app.use('/api/v2/risk-detection', riskDetectionRoutes);
app.use('/api/v2/teacher-performance', teacherPerformanceRoutes);
app.use('/api/v2/institution-intelligence', institutionIntelligenceRoutes);
app.use('/api/v2/esports', esportsRoutesV2);
app.use('/api/v2/collaboration', collaborationRoutesV2);
app.use('/api/v2/biometrics', biometricsRoutesV2);
app.use('/api/v2/analytics', analyticsRoutesV2);
app.use('/api/v2/audit-logs', auditLogsRoutesV2);
app.use('/api/v2/classes', classRoutesV2);
app.use('/api/v2/timetable', timetableRoutesV2);
app.use('/api/v2/attendance', attendanceRoutesV2);
app.use('/api/v2/exams', examRoutesV2);
app.use('/api/v2/library', libraryRoutesV2);
app.use('/api/v2/assignments', assignmentRoutesV2);
app.use('/api/v2/academic-analytics', academicAnalyticsRoutes);
app.use('/api/v2/ai-teaching', aiTeachingRoutesV2);
app.use('/api/v2/predictive-ai', predictiveAiRoutesV2);
app.use('/api/v2/fee-management', feeManagementRoutesV2);
app.use('/api/v2/scholarship', scholarshipRoutesV2);
app.use('/api/v2/payroll', payrollRoutesV2);
app.use('/api/v2/accounts', accountsRoutesV2);
app.use('/api/v2/roles', rolesRoutesV2);
app.use('/api/v2/credentials', credentialsRoutesV2);
app.use('/api/v2/store', storeRoutesV2);
app.use('/api/v2/transport', transportRoutesV2);
app.use('/api/v2/hostel', hostelRoutesV2);
app.use('/api/v2/staff-expenses', staffExpensesRoutesV2);

// V4 Academic routes
app.use('/api/v4/academic', academicRoutesV4);
app.use('/api/v4/homework', homeworkRoutesV4);
app.use('/api/v4/promotion', promotionRoutesV4);
app.use('/api/v4/marks', marksRoutesV4);
app.use('/api/v4/communication', communicationRoutesV4);
app.use('/api/v4/discipline', disciplineRoutesV4);
app.use('/api/v4/health', healthRoutesV4);
app.use('/api/v4/export', exportRoutesV4);
app.use('/api/v4/audit', auditRoutesV4);

// Admission Management
app.use('/api/admission-management', admissionManagementRoutes);

// Events Management (events, clubs, sports teams)
app.use('/api/events-management', eventsManagementRoutes);

// WOS (Workforce Operating System) — accessible by staff AND management users
app.use('/api/wos', wosRoutes);

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Management API v2 is running', version: '2.0.0' });
});

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
