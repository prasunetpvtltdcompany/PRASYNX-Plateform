import { TransportRepository } from './transport.repository';
import type { CreateTransportRouteInput, TransportRouteDTO } from '@prasynx/types';

export class TransportService {
  constructor(private repo: TransportRepository) {}

  list(tenantId: string): Promise<TransportRouteDTO[]> {
    return this.repo.list(tenantId);
  }

  async get(tenantId: string, id: string): Promise<TransportRouteDTO> {
    return this.repo.assertExists(tenantId, id);
  }

  async create(tenantId: string, input: CreateTransportRouteInput): Promise<TransportRouteDTO> {
    const id = await this.repo.create(tenantId, input);
    const created = await this.repo.findById(tenantId, id);
    if (!created) throw new Error('Transport route was created but could not be loaded');
    return created;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.repo.assertExists(tenantId, id);
    await this.repo.remove(tenantId, id);
  }
}

export const transportService = new TransportService(new TransportRepository());