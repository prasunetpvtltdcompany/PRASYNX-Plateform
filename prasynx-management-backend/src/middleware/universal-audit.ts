import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/backend-common';

const SENSITIVE_KEYS = ['password', 'password_hash', 'hash', 'secret', 'token', 'api_key', 'apikey', 'jwt'];

function sanitize(value: any, depth = 0): any {
  if (!value || typeof value !== 'object' || depth > 3) return value;
  if (Array.isArray(value)) return value.map(v => sanitize(v, depth + 1));
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(value)) {
    if (SENSITIVE_KEYS.includes(k.toLowerCase())) out[k] = '[REDACTED]';
    else out[k] = sanitize(v, depth + 1);
  }
  return out;
}

function extractEntityId(req: Request, body: any): string | null {
  const candidates = [
    (req.params as any)?.id,
    body?.id,
    body?.data?.id,
    (req.body as any)?.id,
    (req.params as any)?.student_id,
    (req.params as any)?.staff_id,
    (req.params as any)?.class_id,
  ];
  return candidates.find(c => typeof c === 'string' && c.length > 0 && !c.includes('{')) || null;
}

function severityFor(method: string, body: any): string {
  if (body?.success === false) return 'error';
  if (method === 'DELETE') return 'warning';
  return 'info';
}

// Global audit middleware — attached once at the app level. Logs ANY
// state-changing request (POST/PUT/PATCH/DELETE) that returns success,
// regardless of which router served it. entity_type is derived from the
// resource segment in the URL, so changes to students, parents, staff,
// classes etc. are all captured into one feed.
export function universalAudit() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const method = (req.method || '').toUpperCase();
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      next();
      return;
    }

    const path = (req.originalUrl || req.url || '').split('?')[0];
    const segments = path.split('/').filter(Boolean);

    const wrapper = (req.baseUrl || '').split('/').filter(Boolean);
    const isUuidish = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(s);
    const meaningful = (s: string) =>
      s &&
      !['api', 'v2', 'v3', 'v4', 'management', 'auth', 'organisations'].includes(s) &&
      !isUuidish(s) &&
      s !== ':id';
    const entityType =
      [...wrapper, ...segments]
        .filter(meaningful)
        .pop()
        ?.replace(/[{}:]/g, '')
        .replace(/-management$/, '') ||
      'unknown';

    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      if (res.statusCode >= 400) {
        return originalJson(body);
      }
      const user = (req as any).user;
      const orgId =
        user?.organisationId ||
        user?.organisation_id ||
        (req.params as any)?.organisation_id ||
        (req.params as any)?.org_id ||
        (req.body as any)?.organisation_id ||
        null;

      const record = {
        organisation_id: orgId,
        user_id: user?.userId || user?.id || null,
        action: `${method} ${entityType}`,
        entity_type: entityType,
        entity_id: extractEntityId(req, body),
        details: {
          method,
          url: path,
          body: sanitize(req.body),
          params: sanitize(req.params),
        },
        ip_address: req.ip || null,
        severity: severityFor(method, body),
        created_at: new Date(),
      };

      void (async () => {
        try {
          await supabase.from('audit_logs').insert(record);
        } catch {
          /* audit must never break the request */
        }
      })();
      return originalJson(body);
    };
    next();
  };
}