import { db } from '../../infrastructure/database/supabase';
import type { OrganisationDTO, OrganisationStatus, PortalSlug } from '@prasynx/types';
import { ConflictError, NotFoundError } from '../../shared/errors/errors';

export interface CreateOrganisationInput {
  name: string;
  email: string;
  address?: string;
  phone?: string;
  status?: OrganisationStatus;
}

const ORG_COLUMNS = 'id,name,status,address,phone,email,created_at';

export class OrganisationsRepository {
  async insert(input: CreateOrganisationInput): Promise<OrganisationDTO> {
    const { data, error } = await db
      .from('organisations')
      .insert({ name: input.name, email: input.email, address: input.address ?? null, phone: input.phone ?? null, status: input.status ?? 'verified' })
      .select(ORG_COLUMNS)
      .single();

    if (error || !data) {
      throw new ConflictError(`Organisation could not be created: ${error?.message ?? 'unknown error'}`);
    }
    return { ...(data as OrganisationDTO), portal_access: [] };
  }

  async findById(id: string): Promise<OrganisationDTO | null> {
    const { data } = await db
      .from('organisations')
      .select(ORG_COLUMNS)
      .eq('id', id)
      .maybeSingle();
    if (!data) return null;
    return { ...(data as OrganisationDTO), portal_access: [] };
  }

  async updateStatus(id: string, status: OrganisationStatus): Promise<OrganisationDTO> {
    const { data, error } = await db
      .from('organisations')
      .update({ status })
      .eq('id', id)
      .select(ORG_COLUMNS)
      .single();
    if (error || !data) throw new NotFoundError(`Organisation not found or could not be updated: ${error?.message ?? ''}`);
    return { ...(data as OrganisationDTO), portal_access: [] };
  }

  async list(): Promise<OrganisationDTO[]> {
    const { data } = await db.from('organisations').select(ORG_COLUMNS).order('created_at', { ascending: false });
    return ((data as OrganisationDTO[]) ?? []).map((o) => ({ ...o, portal_access: [] }));
  }

  async delete(id: string): Promise<void> {
    await db.from('organisations').delete().eq('id', id);
  }

  /** Organisations in one query, each annotated with its granted portals. */
  async listWithPortals(): Promise<OrganisationDTO[]> {
    const base = await this.list();
    return this.attachPortals(base);
  }

  async findWithPortals(id: string): Promise<OrganisationDTO | null> {
    const org = await this.findById(id);
    if (!org) return null;
    const [withPortals] = await this.attachPortals([org]);
    return withPortals;
  }

  async updateStatusWithPortals(id: string, status: OrganisationStatus): Promise<OrganisationDTO> {
    await this.updateStatus(id, status);
    const updated = await this.findWithPortals(id);
    if (!updated) throw new NotFoundError('Organisation not found');
    return updated;
  }

  /** Replace the granted portal set for an organisation. */
  async setPortalAccess(organisationId: string, portals: PortalSlug[], grantedBy: string | undefined): Promise<void> {
    await db.from('organisation_portals').delete().eq('organisation_id', organisationId);
    if (portals.length === 0) return;
    const rows = portals.map((portal) => ({ organisation_id: organisationId, portal, granted_by: grantedBy ?? null }));
    const { error } = await db.from('organisation_portals').insert(rows);
    if (error) throw new ConflictError(`Could not update portal access: ${error.message}`);
  }

  private async attachPortals(orgs: OrganisationDTO[]): Promise<OrganisationDTO[]> {
    if (orgs.length === 0) return orgs;
    const map = await this.portalAccessMap();
    return orgs.map((o) => ({ ...o, portal_access: map.get(o.id) ?? [] }));
  }

  private async portalAccessMap(): Promise<Map<string, PortalSlug[]>> {
    const { data } = await db.from('organisation_portals').select('organisation_id,portal');
    const map = new Map<string, PortalSlug[]>();
    for (const row of (data as { organisation_id: string; portal: PortalSlug }[]) ?? []) {
      const list = map.get(row.organisation_id) ?? [];
      list.push(row.portal);
      map.set(row.organisation_id, list);
    }
    return map;
  }
}