import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class TransportService {
  async getTransportRoutes(orgId: string) {
    const { data, error } = await supabase
      .from('transport_routes').select('*').eq('organisation_id', orgId)
      .order('route_name');
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async createTransportRoute(data: { organisation_id: string; route_name: string; stops?: string[] }) {
    const { data: result, error } = await supabase
      .from('transport_routes').insert({ organisation_id: data.organisation_id, route_name: data.route_name, stops: data.stops || [] }).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }
}
export const transportService = new TransportService();
