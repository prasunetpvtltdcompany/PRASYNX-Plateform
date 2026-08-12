/** Announcements module DTOs (schema: public.announcements). */

export type AnnouncementTargetRole = 'all' | 'students' | 'staff' | 'parents';
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface AnnouncementDTO {
  id: string;
  organisation_id: string;
  created_by: string | null;
  title: string;
  content: string | null;
  target_role: string | null;
  target_class_id: string | null;
  priority: AnnouncementPriority | null;
  published_at: string | null;
  created_at?: string;
}

export interface CreateAnnouncementInput {
  title: string;
  content?: string;
  target_role?: string;
  target_class_id?: string;
  priority?: AnnouncementPriority;
  publish?: boolean;
}

export interface UpdateAnnouncementInput {
  title?: string;
  content?: string;
  target_role?: string;
  target_class_id?: string;
  priority?: AnnouncementPriority;
  publish?: boolean;
}