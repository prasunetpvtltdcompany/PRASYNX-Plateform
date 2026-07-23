import { Response } from 'express';
import { collaborationService } from '../services/collaboration.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class CollaborationController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await collaborationService.getDashboard(organisation_id);
    sendSuccess(res, result);
  }

  async getClassrooms(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await collaborationService.getClassrooms(organisation_id);
    sendSuccess(res, result);
  }

  async createClassroom(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await collaborationService.createClassroom(organisation_id, req.body);
    sendCreated(res, result, 'Classroom created');
  }

  async updateClassroom(req: AuthRequest, res: Response) {
    const { classroom_id } = req.params;
    const result = await collaborationService.updateClassroom(classroom_id, req.body);
    sendSuccess(res, result, 'Classroom updated');
  }

  async deleteClassroom(req: AuthRequest, res: Response) {
    const { classroom_id } = req.params;
    const result = await collaborationService.deleteClassroom(classroom_id);
    sendSuccess(res, result, 'Classroom deleted');
  }

  async getProjects(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await collaborationService.getProjects(organisation_id);
    sendSuccess(res, result);
  }

  async createProject(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await collaborationService.createProject(organisation_id, req.body);
    sendCreated(res, result, 'Project created');
  }

  async updateProject(req: AuthRequest, res: Response) {
    const { project_id } = req.params;
    const result = await collaborationService.updateProject(project_id, req.body);
    sendSuccess(res, result, 'Project updated');
  }

  async deleteProject(req: AuthRequest, res: Response) {
    const { project_id } = req.params;
    const result = await collaborationService.deleteProject(project_id);
    sendSuccess(res, result, 'Project deleted');
  }

  async getProjectTasks(req: AuthRequest, res: Response) {
    const { project_id } = req.params;
    const result = await collaborationService.getProjectTasks(project_id);
    sendSuccess(res, result);
  }

  async createTask(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await collaborationService.createTask(organisation_id, req.body);
    sendCreated(res, result, 'Task created');
  }

  async updateTask(req: AuthRequest, res: Response) {
    const { task_id } = req.params;
    const result = await collaborationService.updateTask(task_id, req.body);
    sendSuccess(res, result, 'Task updated');
  }

  async deleteTask(req: AuthRequest, res: Response) {
    const { task_id } = req.params;
    const result = await collaborationService.deleteTask(task_id);
    sendSuccess(res, result, 'Task deleted');
  }

  async getWhiteboards(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await collaborationService.getWhiteboards(organisation_id);
    sendSuccess(res, result);
  }

  async createWhiteboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await collaborationService.createWhiteboard(organisation_id, req.body);
    sendCreated(res, result, 'Whiteboard created');
  }

  async deleteWhiteboard(req: AuthRequest, res: Response) {
    const { whiteboard_id } = req.params;
    const result = await collaborationService.deleteWhiteboard(whiteboard_id);
    sendSuccess(res, result, 'Whiteboard deleted');
  }

  async getDocuments(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await collaborationService.getDocuments(organisation_id);
    sendSuccess(res, result);
  }

  async createDocument(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await collaborationService.createDocument(organisation_id, req.body);
    sendCreated(res, result, 'Document created');
  }

  async updateDocument(req: AuthRequest, res: Response) {
    const { document_id } = req.params;
    const result = await collaborationService.updateDocument(document_id, req.body);
    sendSuccess(res, result, 'Document updated');
  }

  async deleteDocument(req: AuthRequest, res: Response) {
    const { document_id } = req.params;
    const result = await collaborationService.deleteDocument(document_id);
    sendSuccess(res, result, 'Document deleted');
  }

  async getForums(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await collaborationService.getForums(organisation_id);
    sendSuccess(res, result);
  }

  async createForum(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await collaborationService.createForum(organisation_id, req.body);
    sendCreated(res, result, 'Forum created');
  }

  async deleteForum(req: AuthRequest, res: Response) {
    const { forum_id } = req.params;
    const result = await collaborationService.deleteForum(forum_id);
    sendSuccess(res, result, 'Forum deleted');
  }

  async getForumPosts(req: AuthRequest, res: Response) {
    const { forum_id } = req.params;
    const result = await collaborationService.getForumPosts(forum_id);
    sendSuccess(res, result);
  }

  async createPost(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await collaborationService.createPost(organisation_id, req.body);
    sendCreated(res, result, 'Post created');
  }
}

export const collaborationController = new CollaborationController();
