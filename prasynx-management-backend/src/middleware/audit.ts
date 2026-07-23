import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/backend-common';

export function auditLog(action: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      const userId = (req as any).user?.id;
      const orgId = (req as any).user?.organisation_id;
      if (res.statusCode >= 400) {
        return originalJson(body);
      }
      void supabase.from('audit_logs').insert({
        organisation_id: orgId,
        user_id: userId,
        action,
        resource: req.originalUrl,
        method: req.method,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'] || null,
        status_code: res.statusCode
      } as any);
      return originalJson(body);
    };
    next();
  };
}
