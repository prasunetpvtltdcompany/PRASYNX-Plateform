import bcrypt from 'bcryptjs';
import { UsersRepository } from './users.repository';
import { config } from '../../config';
import { toUserDTO } from '../../shared/utils/mappers';
import { BadRequestError, ForbiddenError } from '../../shared/errors/errors';
import type { Role, UserDTO } from '@prasynx/types';

export class UsersService {
  constructor(private repo: UsersRepository) {}

  async me(userId: string): Promise<UserDTO> {
    const user = await this.repo.findById(userId);
    if (!user) throw new BadRequestError('User not found');
    return toUserDTO(user);
  }

  /**
   * School management provisions a user inside its own organisation.
   * tenantId comes from the authenticated caller's claims - not from the body.
   */
  async provisionUser(input: { fullName: string; email: string; role: Role; tenantId: string }): Promise<UserDTO> {
    const password = this.generateTemporaryPassword();
    const hash = await bcrypt.hash(password, config.jwt.bcryptRounds);

    const userId = await this.repo.createUserWithAuth({
      email: input.email.toLowerCase().trim(),
      password: hash,
      fullName: input.fullName,
      role: input.role,
      organisationId: input.tenantId,
    });

    const created = await this.repo.findById(userId);
    if (!created) throw new BadRequestError('User created but could not be loaded');

    // The plaintext temporary password is returned once (and should be emailed).
    return { ...toUserDTO(created), temporaryPassword: password } as UserDTO & { temporaryPassword: string };
  }

  async listOrganisationUsers(tenantId: string, _viewerRole: Role): Promise<UserDTO[]> {
    if (!tenantId) throw new ForbiddenError('Not scoped to a school.');
    // Platform admins and school management may list users; tighten in later milestones.
    const rows = await this.repo.catalogueByOrganisation(tenantId);
    return rows.map(toUserDTO);
  }

  private generateTemporaryPassword(): string {
    // 12 chars, mixed case + digits. Marked "temporary": changed on first login.
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let out = '';
    for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }
}

export const usersService = new UsersService(new UsersRepository());