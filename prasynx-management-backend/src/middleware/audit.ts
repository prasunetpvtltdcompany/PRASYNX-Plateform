import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/backend-common';

const SENSITIVE_KEYS = ['password', 'password_hash', 'hash', 'secret', 'token', 'api_key', 'apikey', 'jwt'];

function sanitize(value: any, depth = 0): any {
  if (!value || typeof value !== 'object' || depth > 3) return value;
  if (Array.isArray(value)) return value.map(v => sanitize(v, depth + 1));
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(value)) {
    if (SENSITIVE_KEYS.includes(k.toLowerCase())) {
      out[k] = '[REDACTED]';
    } else {
      out[k] = sanitize(v, depth + 1);
    }
  }
  return out;
}

function inferEntityType(req: Request): string | null {
  const path = (req.baseUrl || '') + (req.route?.path || req.path || '');
  const segments = path.split('/').filter(Boolean);
  const meaningful = segments.filter(s => !/^[0-9a-f-]{8,}$/i.test(s) && !/^[A-Za-z]+\{/.test(s));
  if (meaningful.length === 0) return null;
  return meaningful[meaningful.length - 1]?.replace(/[{}:]/g, '') || null;
}

// Universal audit middleware — logs every state-changing request that passes
// through the management API. Columns match the canonical audit_logs schema.
export function auditLog(action: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      const user = (req as any).user;
      const statusCode = res.statusCode;
      const respond = () => originalJson(body);
      if (statusCode >= 400 || !req.method || ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return respond();
      }
      const entityType = inferEntityType(req);
      const entityId =
        (body?.data && typeof body.data === 'object' && (body.data.id ?? body.data.id === undefined)) || body?.id
          ? body?.data?.id || body?.id || (req.params as any)?.id || null
          : (req.params as any)?.id || body?.id || null;
      const record: Record<string, any> = {
        organisation_id: user?.organisationId || user?.organisation_id || req.params.organisation_id || req.body?.organisation_id || null,
        user_id: user?.userId || user?.id || null,
        action,
        entity_type: entityId ? inferEntityType(req) : null,
        entity_id: entityId,
        details: {
          method: req.method,
          url: req.originalUrl.replace(/%2F/g, '/'),
          body: sanitize(req.body),
          params: sanitize(req.params),
        },
        severity: statusCode >= 400 ? 'error' : 'info',
        ip_address: req.ip || null,
        created_at: new Date(),
      };
      void (async () => {
        try {
          await supabase.from('audit_logs').insert(record);
        } catch {
          /* audit must never break the request */
        }
      })();
      return respond();
    };
    next();
  };
}