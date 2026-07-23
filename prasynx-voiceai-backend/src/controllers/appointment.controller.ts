import { Request, Response } from 'express';
import { appointmentService } from '../services/appointmentService';
import { sendSuccess } from '../utils/response';

export class AppointmentController {
  async scheduleAppointment(req: Request, res: Response) {
    const appointment = await appointmentService.create(req.body);
    sendSuccess(res, appointment, `Appointment scheduled for ${appointment.date} at ${appointment.time}`, 201);
  }

  async getAppointment(req: Request, res: Response) {
    const appointment = await appointmentService.getById(req.params.id);
    sendSuccess(res, appointment);
  }

  async listAppointments(_req: Request, res: Response) {
    const appointments = await appointmentService.list();
    sendSuccess(res, appointments);
  }
}

export const appointmentController = new AppointmentController();
