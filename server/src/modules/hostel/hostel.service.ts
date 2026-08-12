import { HostelRepository } from './hostel.repository';
import type { CreateHostelRoomInput, HostelAllocationDTO, HostelRoomDTO } from '@prasynx/types';

export class HostelService {
  constructor(private repo: HostelRepository) {}

  listRooms(tenantId: string): Promise<HostelRoomDTO[]> {
    return this.repo.listRooms(tenantId);
  }

  listAllocations(tenantId: string): Promise<HostelAllocationDTO[]> {
    return this.repo.listAllocations(tenantId);
  }

  async getRoom(tenantId: string, id: string): Promise<HostelRoomDTO> {
    return this.repo.assertRoom(tenantId, id);
  }

  async createRoom(tenantId: string, input: CreateHostelRoomInput): Promise<HostelRoomDTO> {
    const id = await this.repo.createRoom(tenantId, input);
    const created = await this.repo.findRoom(tenantId, id);
    if (!created) throw new Error('Hostel room was created but could not be loaded');
    return created;
  }

  async removeRoom(tenantId: string, id: string): Promise<void> {
    await this.repo.assertRoom(tenantId, id);
    await this.repo.removeRoom(tenantId, id);
  }
}

export const hostelService = new HostelService(new HostelRepository());