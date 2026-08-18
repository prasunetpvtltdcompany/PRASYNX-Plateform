import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { academicController } from '../../controllers/academic.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('management', 'admin', 'principal'));

// Academic Years
router.get('/academic-years/:org_id', asyncHandler((req, res) => academicController.getAcademicYears(req, res)));
router.get('/academic-years/:org_id/:id', asyncHandler((req, res) => academicController.getAcademicYearById(req, res)));
router.post('/academic-years/:org_id', asyncHandler((req, res) => academicController.createAcademicYear(req, res)));
router.put('/academic-years/:org_id/:id', asyncHandler((req, res) => academicController.updateAcademicYear(req, res)));
router.delete('/academic-years/:org_id/:id', asyncHandler((req, res) => academicController.deleteAcademicYear(req, res)));
router.patch('/academic-years/:org_id/:id/set-active', asyncHandler((req, res) => academicController.setActiveAcademicYear(req, res)));

// Sections
router.get('/sections/:org_id', asyncHandler((req, res) => academicController.getSections(req, res)));
router.get('/sections/:org_id/:id', asyncHandler((req, res) => academicController.getSectionById(req, res)));
router.post('/sections/:org_id', asyncHandler((req, res) => academicController.createSection(req, res)));
router.put('/sections/:org_id/:id', asyncHandler((req, res) => academicController.updateSection(req, res)));
router.delete('/sections/:org_id/:id', asyncHandler((req, res) => academicController.deleteSection(req, res)));

// Class-Subject Assignments
router.get('/class-subjects/:org_id', asyncHandler((req, res) => academicController.getClassSubjects(req, res)));
router.get('/class-subjects/:org_id/:id', asyncHandler((req, res) => academicController.getClassSubjectById(req, res)));
router.post('/class-subjects/:org_id', asyncHandler((req, res) => academicController.createClassSubject(req, res)));
router.put('/class-subjects/:org_id/:id', asyncHandler((req, res) => academicController.updateClassSubject(req, res)));
router.delete('/class-subjects/:org_id/:id', asyncHandler((req, res) => academicController.deleteClassSubject(req, res)));

// Teacher Assignments
router.get('/teacher-assignments/:org_id', asyncHandler((req, res) => academicController.getTeacherAssignments(req, res)));
router.get('/teacher-assignments/:org_id/:id', asyncHandler((req, res) => academicController.getTeacherAssignmentById(req, res)));
router.post('/teacher-assignments/:org_id', asyncHandler((req, res) => academicController.createTeacherAssignment(req, res)));
router.put('/teacher-assignments/:org_id/:id', asyncHandler((req, res) => academicController.updateTeacherAssignment(req, res)));
router.delete('/teacher-assignments/:org_id/:id', asyncHandler((req, res) => academicController.deleteTeacherAssignment(req, res)));

// Class Teacher
router.get('/class-teachers/:org_id', asyncHandler((req, res) => academicController.getClassTeachers(req, res)));
router.post('/class-teachers/:org_id', asyncHandler((req, res) => academicController.assignClassTeacher(req, res)));
router.delete('/class-teachers/:org_id/:class_id', asyncHandler((req, res) => academicController.removeClassTeacher(req, res)));

// Enrollments
router.get('/enrollments/:org_id', asyncHandler((req, res) => academicController.getEnrollments(req, res)));
router.get('/enrollments/:org_id/class/:class_id', asyncHandler((req, res) => academicController.getClassEnrollments(req, res)));
router.post('/enrollments/:org_id', asyncHandler((req, res) => academicController.enrollStudent(req, res)));
router.post('/enrollments/:org_id/bulk', asyncHandler((req, res) => academicController.enrollStudentsBulk(req, res)));
router.delete('/enrollments/:org_id/:class_id/:student_id', asyncHandler((req, res) => academicController.removeEnrollment(req, res)));

export default router;
