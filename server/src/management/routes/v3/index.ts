import { Router } from 'express';
import { supabase } from '../../lib/backend-common';
import { verifyManagementAuth, enforceOrgAccess } from '../../middleware/verifyAuth';
import { auditLog } from '../../middleware/audit';
import { credentialLimiter } from '../../middleware/rateLimiter';
import { createCrudRouter } from './crud.routes';
import studentRoutes from './student.routes';
import staffRoutes from './staff.routes';
import timetableRoutes from './timetable.routes';
import attendanceRoutes from './attendance.routes';

const router = Router();

// Auth + audit for all v3 routes
router.use(verifyManagementAuth);
router.use(enforceOrgAccess());
router.use(auditLog('management_action'));

// Complex route groups
router.use(studentRoutes);
router.use(staffRoutes);
router.use(timetableRoutes);
router.use(attendanceRoutes);

// Generic CRUD for simple entity tables
router.use(createCrudRouter({
  'fee-structures': { table: 'fee_structures' },
  'fee-items': { table: 'fee_items' },
  'student-fees': { table: 'student_fees' },
  'announcements': { table: 'announcements' },
  'events': { table: 'events' },
  'subjects': { table: 'subjects' },
  'classes': { table: 'classes' },
  'ledger': { table: 'ledger' },
  'payroll': { table: 'payroll' },
  'documents': { table: 'documents' },
  'audit-logs': { table: 'audit_logs' },
  'helpdesk-tickets': { table: 'helpdesk_tickets' },
  'transport-routes': { table: 'transport_routes' },
  'transport-vehicles': { table: 'transport_vehicles' },
  'transport-assignments': { table: 'transport_assignments' },
  'hostel-rooms': { table: 'hostel_rooms' },
  'hostel-allocations': { table: 'hostel_allocations' },
  'library-books': { table: 'library_books' },
  'library-issues': { table: 'library_issues' },
  'notifications': { table: 'notifications' },
  'scholarships': { table: 'scholarships' },
  'part-time-jobs': { table: 'part_time_jobs' },
  'module-config': { table: 'module_config' },
  'health/records': { table: 'health_records' },
  'health/checkups': { table: 'health_checkups' },
  'health/medications': { table: 'health_medications' },
  'inventory/assets': { table: 'inventory_assets' },
  'inventory/stock': { table: 'inventory_stock' },
  'inventory/purchase-orders': { table: 'inventory_purchase_orders' },
  'inventory/maintenance': { table: 'inventory_maintenance' },
  'alumni/alumni': { table: 'alumni' },
  'alumni/events': { table: 'alumni_events' },
  'alumni/donations': { table: 'alumni_donations' },
  'alumni/mentors': { table: 'alumni_mentors' },
  'extracurricular/clubs': { table: 'extracurricular_clubs' },
  'extracurricular/sports-teams': { table: 'extracurricular_sports_teams' },
  'extracurricular/events': { table: 'extracurricular_events' },
  'career/internships': { table: 'career_internships' },
  'career/psychometric-tests': { table: 'career_psychometric_tests' },
  'career/college-applications': { table: 'career_college_applications' },
  'career/skill-assessments': { table: 'career_skill_assessments' },
  'store/products': { table: 'store_products' },
  'store/orders': { table: 'store_orders' },
  'store/menu': { table: 'store_menu' },
  'store/fundraising': { table: 'store_fundraising' },
  'collaboration/classrooms': { table: 'collaboration_classrooms' },
  'collaboration/projects': { table: 'collaboration_projects' },
  'admission/applications': { table: 'admission_applications' },
  'admission/enquiries': { table: 'admission_enquiries' },
  'staff-management/payroll': { table: 'staff_payroll' },
  'staff-management/job-postings': { table: 'job_postings' },
  'staff-management/performance-reviews': { table: 'performance_reviews' },
  'staff-management/training': { table: 'staff_training' },
  'digital-credentials/certificates': { table: 'digital_certificates' },
  'digital-credentials/credentials': { table: 'digital_credentials' },
  'digital-credentials/badges': { table: 'digital_badges' }
}));

// Single fee-structure with items (complex create)
router.post('/fee-structures', async (req, res) => {
  const { organisation_id, name, description, items } = req.body;
  try {
    const { data: structure, error } = await supabase
      .from('fee_structures').insert({ organisation_id, name, description }).select().single();
    if (error) throw error;
    if (items?.length) {
      await supabase.from('fee_items').insert(items.map((item: any) => ({
        fee_structure_id: structure.id, item_name: item.name, amount: item.amount
      })));
    }
    res.status(201).json(structure);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default router;
