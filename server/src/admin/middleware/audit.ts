import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';

export function auditLog(action: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      const user = (req as any).user;
      if (res.statusCode >= 400 || !user) {
        return originalJson(body);
      }
      void supabase.from('audit_logs').insert({
        organisation_id: user.organisationId || null,
        user_id: user.userId,
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
