import type { UserDTO, UserRow } from '@prasynx/types';

/** Strip password material and normalize to the safe serialization shape. */
export function toUserDTO(row: UserRow | null | undefined): UserDTO {
  if (!row) throw new Error('Cannot map null user');
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    organisation_id: row.organisation_id,
    status: row.status,
    created_at: row.created_at,
  };
}