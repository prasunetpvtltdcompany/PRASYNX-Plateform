import { Request, Response } from 'express';
import { jobService } from '../services/jobService';
import { sendSuccess } from '../utils/response';

export class JobController {
  async postJob(req: Request, res: Response) {
    const job = await jobService.create(req.body);
    sendSuccess(res, job, 'Job posted successfully', 201);
  }

  async listJobs(req: Request, res: Response) {
    const { type, audience } = req.query;
    const jobs = await jobService.list(20, 0, type as string, audience as string);
    sendSuccess(res, jobs);
  }

  async getJob(req: Request, res: Response) {
    const job = await jobService.getById(req.params.id);
    sendSuccess(res, job);
  }
}

export const jobController = new JobController();
