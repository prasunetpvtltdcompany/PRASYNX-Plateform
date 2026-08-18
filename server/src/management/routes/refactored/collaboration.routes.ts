import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { collaborationController } from '../../controllers/collaboration.controller';

const router = Router();


// URL param org_id/organisation_id must match JWT
router.param('organisation_id', (req, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});
router.param('org_id', (req, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});

router.use(authenticate);
router.use(authorize('management', 'admin', 'staff'));

// Aliases: support calls that omit organisation id by using authenticated user's org
router.get('/dashboard', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return collaborationController.getDashboard(req, res);
}));

router.get('/classrooms', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return collaborationController.getClassrooms(req, res);
}));

router.get('/projects', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return collaborationController.getProjects(req, res);
}));

router.get('/documents', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return collaborationController.getDocuments(req, res);
}));

router.get('/forums', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return collaborationController.getForums(req, res);
}));

router.get('/whiteboards', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return collaborationController.getWhiteboards(req, res);
}));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => collaborationController.getDashboard(req, res)));

router.get('/classrooms/:organisation_id', asyncHandler((req, res) => collaborationController.getClassrooms(req, res)));
router.post('/classrooms/:organisation_id', asyncHandler((req, res) => collaborationController.createClassroom(req, res)));
router.put('/classrooms/:classroom_id', asyncHandler((req, res) => collaborationController.updateClassroom(req, res)));
router.delete('/classrooms/:classroom_id', asyncHandler((req, res) => collaborationController.deleteClassroom(req, res)));

router.get('/projects/:organisation_id', asyncHandler((req, res) => collaborationController.getProjects(req, res)));
router.post('/projects/:organisation_id', asyncHandler((req, res) => collaborationController.createProject(req, res)));
router.put('/projects/:project_id', asyncHandler((req, res) => collaborationController.updateProject(req, res)));
router.delete('/projects/:project_id', asyncHandler((req, res) => collaborationController.deleteProject(req, res)));

router.get('/projects/:project_id/tasks', asyncHandler((req, res) => collaborationController.getProjectTasks(req, res)));
router.post('/tasks/:organisation_id', asyncHandler((req, res) => collaborationController.createTask(req, res)));
router.put('/tasks/:task_id', asyncHandler((req, res) => collaborationController.updateTask(req, res)));
router.delete('/tasks/:task_id', asyncHandler((req, res) => collaborationController.deleteTask(req, res)));

router.get('/whiteboards/:organisation_id', asyncHandler((req, res) => collaborationController.getWhiteboards(req, res)));
router.post('/whiteboards/:organisation_id', asyncHandler((req, res) => collaborationController.createWhiteboard(req, res)));
router.delete('/whiteboards/:whiteboard_id', asyncHandler((req, res) => collaborationController.deleteWhiteboard(req, res)));

router.get('/documents/:organisation_id', asyncHandler((req, res) => collaborationController.getDocuments(req, res)));
router.post('/documents/:organisation_id', asyncHandler((req, res) => collaborationController.createDocument(req, res)));
router.put('/documents/:document_id', asyncHandler((req, res) => collaborationController.updateDocument(req, res)));
router.delete('/documents/:document_id', asyncHandler((req, res) => collaborationController.deleteDocument(req, res)));

router.get('/forums/:organisation_id', asyncHandler((req, res) => collaborationController.getForums(req, res)));
router.post('/forums/:organisation_id', asyncHandler((req, res) => collaborationController.createForum(req, res)));
router.delete('/forums/:forum_id', asyncHandler((req, res) => collaborationController.deleteForum(req, res)));

router.get('/forums/:forum_id/posts', asyncHandler((req, res) => collaborationController.getForumPosts(req, res)));
router.post('/posts/:organisation_id', asyncHandler((req, res) => collaborationController.createPost(req, res)));

export default router;
