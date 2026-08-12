/** Transport module DTOs (schema: public.transport_routes). */

export interface TransportRouteDTO {
  id: string;
  organisation_id: string;
  route_name: string;
  start_point: string | null;
  end_point: string | null;
  stops: string | null;
  distance: string | null;
  status: string | null;
  route_code: string | null;
  fee: string | null;
  created_at?: string;
}

export interface CreateTransportRouteInput {
  route_name: string;
  start_point?: string;
  end_point?: string;
  stops?: string;
  distance?: string;
  status?: string;
  route_code?: string;
  fee?: string;
}