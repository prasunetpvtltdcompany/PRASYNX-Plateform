import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(3000).optional(),
  event_type: z.string().max(100).optional(),
  start_date: z.string().max(40).optional().or(z.literal('')),
  end_date: z.string().max(40).optional().or(z.literal('')),
  start_time: z.string().max(40).optional().or(z.literal('')),
  end_time: z.string().max(40).optional().or(z.literal('')),
  location: z.string().max(200).optional(),
  status: z.string().max(30).optional(),
});

export const createClubSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  coordinator: z.string().max(200).optional(),
});

export const createSportsTeamSchema = z.object({
  name: z.string().min(1).max(200),
  sport_type: z.string().max(100).optional(),
  coach: z.string().max(200).optional(),
  max_players: z.number().int().min(1).max(100).optional(),
  status: z.string().max(30).optional(),
});