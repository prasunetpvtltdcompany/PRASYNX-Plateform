import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler';
// Rate limiting disabled during local development to avoid proxy/header issues
// import { apiLimiter, authLimiter } from './management/middleware/rateLimiter';
import { universalAudit } from './management/middleware/universal-audit';

// Management portal routes (core monolith backend — src/management)
import authRoutes from './management/routes/refactored/auth.routes';
import managementRoutesRefactored from './management/routes/refactored/management.routes';
import managementCRUDRoutes from './management/routes/management';
import notificationRoutes from './management/routes/notification.routes';

// V2 route imports
import riskDetectionRoutes from './management/routes/refactored/risk-detection.routes';
import teacherPerformanceRoutes from './management/routes/refactored/teacher-performance.routes';
import institutionIntelligenceRoutes from './management/routes/refactored/institution-intelligence.routes';
import collaborationRoutesV2 from './management/routes/refactored/collaboration.routes';
import analyticsRoutesV2 from './management/routes/refactored/analytics.routes';
import auditLogsRoutesV2 from './management/routes/refactored/audit-logs.routes';
import classRoutesV2 from './management/routes/refactored/class.routes';
import esportsRoutesV2 from './management/routes/refactored/esports.routes';
import biometricsRoutesV2 from './management/routes/refactored/biometrics.routes';
import timetableRoutesV2 from './management/routes/refactored/timetable.routes';
import attendanceRoutesV2 from './management/routes/refactored/attendance.routes';
import { attachSupabase } from './management/middleware/attachSupabase';
import examRoutesV2 from './management/routes/refactored/exam.routes';
import libraryRoutesV2 from './management/routes/refactored/library.routes';
import assignmentRoutesV2 from './management/routes/refactored/assignment.routes';
import academicAnalyticsRoutes from './management/routes/academic-analytics.routes';
import aiTeachingRoutesV2 from './management/routes/ai-teaching.routes';
import predictiveAiRoutesV2 from './management/routes/refactored/predictive-ai.routes';
import feeManagementRoutesV2 from './management/routes/refactored/fee-management.routes';
import scholarshipRoutesV2 from './management/routes/refactored/scholarship.routes';
import payrollRoutesV2 from './management/routes/refactored/payroll.routes';
import accountsRoutesV2 from './management/routes/refactored/accounts.routes';
import rolesRoutesV2 from './management/routes/refactored/roles.routes';
import credentialsRoutesV2 from './management/routes/refactored/credentials.routes';
import storeRoutesV2 from './management/routes/refactored/store.routes';
import transportRoutesV2 from './management/routes/refactored/transport.routes';
import hostelRoutesV2 from './management/routes/refactored/hostel.routes';
import staffExpensesRoutesV2 from './management/routes/refactored/staff-expenses.routes';
import academicRoutesV4 from './management/routes/v4/academic.routes';
import homeworkRoutesV4 from './management/routes/v4/homework.routes';
import promotionRoutesV4 from './management/routes/v4/promotion.routes';
import marksRoutesV4 from './management/routes/v4/marks.routes';
import communicationRoutesV4 from './management/routes/v4/communication.routes';
import disciplineRoutesV4 from './management/routes/v4/discipline.routes';
import healthRoutesV4 from './management/routes/v4/health.routes';
import exportRoutesV4 from './management/routes/v4/export.routes';
import auditRoutesV4 from './management/routes/v4/audit.routes';
import wosRoutes from './management/routes/wos.routes';
import admissionManagementRoutes from './management/routes/admission-management';
import eventsManagementRoutes from './management/routes/events-management';
import alumniManagementRoutes from './management/routes/alumni-management';
import careerManagementRoutes from './management/routes/career-management';
import hostelManagementRoutes from './management/routes/hostel-management';
import transportManagementRoutes from './management/routes/transport-management';
import workforceRoutes from './management/routes/refactored/workforce.routes';
import gamificationRoutes from './management/routes/gamification';

// Admin portal routes (ported from prasynx-admin-backend — self-contained under src/admin)
import adminRoutesRefactored from './admin/routes/refactored/admin.routes';
import adminAnalyticsRoutes from './admin/routes/analytics.routes';
import adminGccRoutes from './admin/routes/global-command-center.routes';
import billingRoutes from './admin/routes/billing.routes';
import userManagementRoutes from './admin/routes/user-management.routes';

// Job Provider portal routes (ported from prasynx-jobprovider-backend — self-contained under src/jobprovider)
import jobProviderRoutes from './jobprovider/routes';

// VoiceAI portal routes (ported from prasynx-voiceai-backend — self-contained under src/voiceai)
import voiceAiRoutes from './voiceai/routes';

// Parent portal routes (ported from prasynx-parents-backend — self-contained under src/parent)
import parentAuthRoutes from './parent/routes/refactored/auth.routes';
import parentRoutesRefactored from './parent/routes/refactored/parent.routes';
import parentRoutesLegacy from './parent/routes';

// Staff portal routes (ported from prasynx-staff-backend — self-contained under src/staff)
import staffAuthRoutes from './staff/routes/refactored/auth.routes';
import staffRoutesRefactored from './staff/routes/refactored/staff.routes';

// Student portal routes (ported from prasynx-student-backend — self-contained under src/student)
import studentAuthRoutes from './student/routes/refactored/auth.routes';
import studentRoutesRefactored from './student/routes/refactored/student.routes';
import studentRoutesLegacy from './student/routes';
/** Compose the full Express app. Exported (not auto-listening) so tests & server.ts own lifecycle. */
const app = express();

// Global middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cookieParser());
// app.use('/api/v2/auth/login', authLimiter);
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
// app.use('/api/', apiLimiter);

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
app.use('/api/v2/collaboration', collaborationRoutesV2);
app.use('/api/v2/analytics', analyticsRoutesV2);
app.use('/api/v2/esports', esportsRoutesV2);
app.use('/api/v2/biometrics', biometricsRoutesV2);
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

// Enterprise modules (mounted so management portal tabs stop 404ing)
app.use('/api/alumni-management', alumniManagementRoutes);
app.use('/api/career-management', careerManagementRoutes);
app.use('/api/hostel-management', hostelManagementRoutes);
app.use('/api/transport-management', transportManagementRoutes);
app.use('/api/workforce', workforceRoutes);
app.use('/api/gamification', gamificationRoutes);

// Admin portal — mounted so the admin frontend's /v2/admin/* calls stop 404ing
app.use('/api/v2/admin', adminRoutesRefactored);
app.use('/api/v2/admin', adminAnalyticsRoutes);
app.use('/api/v2/admin', adminGccRoutes);
app.use('/api/v2/admin', billingRoutes);
app.use('/api/v2/admin', userManagementRoutes);

// Job Provider portal — mounted so the job provider frontend's /job-provider/* calls stop 404ing
app.use('/api/job-provider', jobProviderRoutes);

// VoiceAI portal — mounted so the voice assistant /voice/* calls stop 404ing
app.use('/api/voice', voiceAiRoutes);

// Parent portal — parents auth is mounted at a distinct path to avoid clashing
// with management /api/v2/auth; legacy /parents/* and refactored /v2/parents/* both served.
app.use('/api/v2/parents/auth', parentAuthRoutes);
app.use('/api/v2/parents', parentRoutesRefactored);
app.use('/api/parents', parentRoutesLegacy);

// Staff portal — auth mounted at a distinct path to avoid clashing with
// management /api/v2/auth; refactored /staff/* routes served under /api/staff
// (the staff frontend calls /staff/... with API base /api).
app.use('/api/v2/staff/auth', staffAuthRoutes);
app.use('/api/staff', staffRoutesRefactored);

// Student portal — auth mounted at a distinct path to avoid clashing with
// management /api/v2/auth; legacy /student/* and refactored /v2/student/* both served.
app.use('/api/v2/student/auth', studentAuthRoutes);
app.use('/api/v2/student', studentRoutesRefactored);
app.use('/api/student', studentRoutesLegacy);

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Platform API v2 is running', version: '2.0.0' });
});

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;