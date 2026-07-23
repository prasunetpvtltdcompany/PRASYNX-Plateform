import { Request, Response } from 'express';
import { complaintService } from '../services/complaintService';
import { ticketService } from '../services/ticketService';
import { conversationService } from '../services/conversationService';
import { sendSuccess } from '../utils/response';

export class ComplaintController {
  async registerComplaint(req: Request, res: Response) {
    const complaint = await complaintService.create(req.body);
    const { callId } = req.query;
    if (callId) {
      const state = conversationService.get(callId as string);
      if (state) {
        state.collectedData.complaintId = complaint.complaint_id;
        state.stage = 'completed';
      }

      if (complaint.priority === 'high' || complaint.priority === 'urgent') {
        await ticketService.create({
          callerName: complaint.caller_name,
          callerRole: complaint.caller_role,
          subject: `Complaint: ${complaint.category} - ${complaint.complaint_id}`,
          description: complaint.description,
          category: complaint.category,
          priority: complaint.priority,
          assignedDepartment: 'Administration',
        });
      }
    }
    sendSuccess(res, complaint, `Complaint registered successfully. Your complaint ID is ${complaint.complaint_id}`, 201);
  }

  async getComplaint(req: Request, res: Response) {
    const { id } = req.params;
    const complaint = id.startsWith('CMP-')
      ? await complaintService.getByComplaintId(id)
      : await complaintService.getById(id);
    sendSuccess(res, complaint);
  }

  async listComplaints(_req: Request, res: Response) {
    const complaints = await complaintService.list();
    sendSuccess(res, complaints);
  }
}

export const complaintController = new ComplaintController();
