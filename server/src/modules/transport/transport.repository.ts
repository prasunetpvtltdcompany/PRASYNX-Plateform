import type { CreateTransportRouteInput, TransportRouteDTO } from '@prasynx/types';
import { db } from '../../infrastructure/database/supabase';
import { NotFoundError } from '../../shared/errors/errors';

const COLUMNS = 'id,organisation_id,route_name,start_point,end_point,stops,distance,status,route_code,fee,created_at';

export class TransportRepository {
  async list(tenantId: string): Promise<TransportRouteDTO[]> {
    const { data, error } = await db
      .from('transport_routes')
      .select(COLUMNS)
      .eq('organisation_id', tenantId)
      .order('route_name');
    if (error) throw error;
    return (data as unknown as TransportRouteDTO[]) ?? [];
  }

  async findById(tenantId: string, id: string): Promise<TransportRouteDTO | null> {
    const { data, error } = await db
      .from('transport_routes')
      .select(COLUMNS)
      .eq('id', id)
      .eq('organisation_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as TransportRouteDTO | null) ?? null;
  }

  async create(tenantId: string, input: CreateTransportRouteInput): Promise<string> {
    const row = {
      organisation_id: tenantId,
      route_name: input.route_name,
      start_point: input.start_point ?? null,
      end_point: input.end_point ?? null,
      stops: input.stops ?? null,
      distance: input.distance ?? null,
      status: input.status ?? 'active',
      route_code: input.route_code ?? null,
      fee: input.fee ?? null,
    };
    const { data, error } = await db.from('transport_routes').insert(row).select('id').single();
    if (error || !data) throw error ?? new Error('Transport route could not be created');
    return data.id as string;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const { error } = await db.from('transport_routes').delete().eq('id', id).eq('organisation_id', tenantId);
    if (error) throw error;
  }

  async assertExists(tenantId: string, id: string): Promise<TransportRouteDTO> {
    const found = await this.findById(tenantId, id);
    if (!found) throw new NotFoundError('Transport route not found in this school');
    return found;
  }
}