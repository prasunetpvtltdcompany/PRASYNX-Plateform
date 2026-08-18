import { Router, Request, Response } from 'express';
import { supabase } from '../../lib/backend-common';

interface CrudConfig {
  table: string;
  orgField?: string;
  listSelect?: string;
  idField?: string;
  idType?: 'uuid' | 'number';
}

function handleError(res: Response, error: any) {
  res.status(500).json({ error: error.message });
}

export function createCrudRouter(configs: Record<string, CrudConfig>): Router {
  const router = Router();

  router.param('org_id', (req, res, next, value) => {
    if (value && value !== (req as any).user?.organisationId) {
      return res.status(403).json({ error: 'Tenant access denied' });
    }
    next();
  });

  for (const [basePath, cfg] of Object.entries(configs)) {
    const idField = cfg.idField || 'id';
    const orgField = cfg.orgField || 'organisation_id';

    // GET /{basePath}/:org_id — list by org
    router.get(`/${basePath}/:org_id`, async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from(cfg.table)
          .select(cfg.listSelect || '*')
          .eq(orgField, req.params.org_id);
        if (error) throw error;
        res.json(data || []);
      } catch (e: any) { handleError(res, e); }
    });

    // GET /{basePath}/:org_id/:id — get single
    router.get(`/${basePath}/:org_id/:id`, async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from(cfg.table)
          .select(cfg.listSelect || '*')
          .eq(orgField, req.params.org_id)
          .eq(idField, req.params.id)
          .maybeSingle();
        if (error) throw error;
        res.json(data);
      } catch (e: any) { handleError(res, e); }
    });

    // POST /{basePath} — create
    router.post(`/${basePath}`, async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from(cfg.table)
          .insert([req.body])
          .select();
        if (error) throw error;
        res.status(201).json(data);
      } catch (e: any) { handleError(res, e); }
    });

    // PUT /{basePath}/:id — update
    router.put(`/${basePath}/:id`, async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from(cfg.table)
          .update(req.body)
          .eq(idField, req.params.id)
          .select();
        if (error) throw error;
        res.json(data);
      } catch (e: any) { handleError(res, e); }
    });

    // DELETE /{basePath}/:id — delete
    router.delete(`/${basePath}/:id`, async (req: Request, res: Response) => {
      try {
        const { error } = await supabase
          .from(cfg.table)
          .delete()
          .eq(idField, req.params.id);
        if (error) throw error;
        res.json({ success: true });
      } catch (e: any) { handleError(res, e); }
    });
  }

  return router;
}
