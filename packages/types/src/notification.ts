/** Notification module DTOs (schema: public.notifications). Common across all portals. */

export interface NotificationDTO {
  id: string;
  organisation_id: string;
  user_id: string | null;
  title: string;
  message: string | null;
  type: string | null;
  read: boolean | null;
  reference_type: string | null;
  reference_id: string | null;
  target_role: string | null;
  sent_at: string | null;
  delivered: boolean | null;
  created_at?: string;
}

export interface CreateNotificationInput {
  user_id?: string;
  title: string;
  message?: string;
  type?: string;
  reference_type?: string;
  reference_id?: string;
  target_role?: string;
}