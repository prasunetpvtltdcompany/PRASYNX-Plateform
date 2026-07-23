import { Request, Response } from 'express';
import { transcriptService } from '../services/transcriptService';
import { callService } from '../services/callService';
import { sendSuccess } from '../utils/response';

export class TranscriptController {
  async saveTranscript(req: Request, res: Response) {
    const transcript = await transcriptService.save(req.body);
    await callService.saveTranscript(req.body.callId, JSON.stringify(req.body.messages), req.body.summary);
    sendSuccess(res, transcript, 'Transcript saved', 201);
  }

  async getTranscript(req: Request, res: Response) {
    const transcript = await transcriptService.getByCallId(req.params.callId);
    sendSuccess(res, transcript);
  }
}

export const transcriptController = new TranscriptController();
