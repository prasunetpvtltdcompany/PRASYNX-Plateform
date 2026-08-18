import type { Role, UserDTO } from './user';

/** Claims embedded in the signed access token (JWT). */
export interface AccessTokenClaims {
  /** users.id */
  sub: string;
  email: string;
  role: Role;
  /** organisations.id (nullable for platform roles) */
  tenantId: string | null;
  /** auth session id (enables server-side revocation) */
  sessionId: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

/** Opaque refresh token - only a SHA-256 hash is persisted. */
export interface RefreshTokenRecord {
  id: string;
  user_id: string;
  token_hash: string;
  user_agent?: string | null;
  ip?: string | null;
  expires_at: string;
  created_at: string;
  consumed_at?: string | null;
  replaced_by?: string | null;
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  /** seconds until access token expiry (for client clocks / auto-refresh). */
  expiresIn: number;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserDTO;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  tenantId: string | null;
  sessionId: string;
  /** Backwards-compatible alias for tenantId used in older server code */
  organisationId?: string | null;
  /** Optional alias for userId used by some server modules */
  id?: string;
}