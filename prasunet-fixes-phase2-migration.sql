-- ============================================================================
-- PRASYNX ERP - PHASE 2 CRITICAL FIXES MIGRATION
-- ============================================================================
-- Issues addressed:
-- 1. Job Provider password reset tokens table
-- 2. No schema changes needed for CSV export (code-only)
-- 3. No schema changes needed for teacher assignment (code-only)
-- 4. No schema changes needed for parent mapping (code-only)
-- 5. No schema changes needed for credential rollback (code-only)
-- 6. No schema changes needed for cross-tenant (code-only)
-- ============================================================================

-- ============================================================================
-- FIX 1: Job Provider Password Reset Tokens
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON public.password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON public.password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);
