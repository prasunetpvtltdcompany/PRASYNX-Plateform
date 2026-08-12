import { z } from 'zod';

export const createHealthRecordSchema = z.object({
  student_id: z.string().uuid(),
  record_type: z.string().min(1).max(50),
  title: z.string().min(2).max(300),
  description: z.string().max(2000).optional(),
  value: z.string().max(500).optional(),
});

export const createTransportRouteSchema = z.object({
  route_name: z.string().min(2).max(200),
  start_point: z.string().max(200).optional(),
  end_point: z.string().max(200).optional(),
  stops: z.string().max(2000).optional(),
  distance: z.string().max(60).optional(),
  status: z.string().max(30).optional(),
  route_code: z.string().max(30).optional(),
  fee: z.string().max(60).optional(),
});

export const createLibraryBookSchema = z.object({
  title: z.string().min(1).max(300),
  author: z.string().max(200).optional(),
  isbn: z.string().max(50).optional(),
  category: z.string().max(100).optional(),
  publisher: z.string().max(200).optional(),
  publish_year: z.number().int().min(1000).max(2100).optional(),
  copies_total: z.number().int().min(0).optional(),
  shelf_location: z.string().max(100).optional(),
  status: z.string().max(30).optional(),
});

export const createHostelRoomSchema = z.object({
  room_number: z.string().min(1).max(50),
  capacity: z.number().int().min(1).max(500).optional(),
  floor: z.string().max(50).optional(),
  building: z.string().max(200).optional(),
  room_type: z.string().max(50).optional(),
  monthly_rent: z.string().max(60).optional(),
  status: z.string().max(30).optional(),
});

export const moduleConfigKeySchema = z.string().min(1).max(80).regex(/^[a-z0-9_-]+$/);

export const moduleConfigUpdateSchema = z
  .object({
    enabled: z.boolean().optional(),
    settings: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((v) => v.enabled !== undefined || v.settings !== undefined, {
    message: 'Provide at least one of enabled or settings',
  });