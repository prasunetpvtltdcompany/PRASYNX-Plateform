import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { timetableService } from './timetable.service';
import { upsertTimetableSchema, deleteTimetableEntriesSchema, timetableQuerySchema } from '@prasynx/validation';

export class TimetableController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const query = req.validated?.query as ReturnType<typeof timetableQuerySchema.parse>;
    if (!query) throw new BadRequestError('Invalid query');

    const tenantId = req.user!.tenantId ?? '';

    if (query.class_id) {
      const timetable = await timetableService.get(tenantId, query.class_id);
      return res.status(200).json({ timetable });
    }

    const entries = await timetableService.list(tenantId);
    res.status(200).json({ timetable: { class_id: null, class_name: null, entries } });
  });

  replace = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof upsertTimetableSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');

    const entries = await timetableService.replace({
      tenantId: req.user!.tenantId ?? '',
      classId: body.class_id,
      entries: body.entries.map((e) => ({
        subject_id: e.subject_id,
        day_of_week: e.day_of_week,
        start_time: e.start_time,
        end_time: e.end_time,
        room: e.room,
      })),
    });

    res.status(200).json({ entries });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof deleteTimetableEntriesSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');
    // teachers are intentionally excluded from hard deletes by route permission
    await timetableService.delete(req.user!.tenantId ?? '', body.entry_ids);
    res.status(200).json({ ok: true });
  });
}

export const timetableController = new TimetableController();