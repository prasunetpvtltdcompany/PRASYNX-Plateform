import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { OrganisationsRepository } from './organisations.repository';
import { UsersRepository } from '../users/users.repository';
import { config } from '../../config';
import { ConflictError, NotFoundError } from '../../shared/errors/errors';
import { logger } from '../../shared/logger/logger';
import { sendSchoolCredentialsEmail } from '../../infrastructure/mail/mailer';
import type { OrganisationDTO, OrganisationStatus, PortalSlug, RegisterSchoolResult } from '@prasynx/types';

export interface RegisterSchoolInput {
  name: string;
  email: string;
  address?: string;
  phone?: string;
  adminFullName?: string;
}

/**
 * The COMPANY (platform admin) registers a new school:
 *   1. create the organisation (tenant)
 *   2. create the school's initial `management` account inside it
 *   3. return one-time credentials + email them
 * The temporary password is plaintext exactly once - it is never stored/logged.
 */
export class OrganisationsService {
  constructor(
    private orgRepo: OrganisationsRepository,
    private usersRepo: UsersRepository,
  ) {}

  async registerSchool(input: RegisterSchoolInput): Promise<RegisterSchoolResult> {
    const email = input.email.toLowerCase().trim();
    const existingUser = await this.usersRepo.findByEmail(email);
    if (existingUser) throw new ConflictError(`A user with email ${email} already exists`);

    // 1) tenant row
    const org = await this.orgRepo.insert({
      name: input.name,
      email,
      address: input.address,
      phone: input.phone,
      status: 'verified',
    });

    // 2) initial management account
    const password = this.generateTemporaryPassword();
    const hash = await bcrypt.hash(password, config.jwt.bcryptRounds);
    let userId: string;
    try {
      userId = await this.usersRepo.createUserWithAuth({
        email,
        password: hash,
        fullName: input.adminFullName?.trim() || 'School Administrator',
        role: 'management',
        organisationId: org.id,
        status: 'active',
      });
    } catch (err) {
      // roll back the tenant row if account provisioning failed
      await this.orgRepo.delete(org.id);
      throw err;
    }

    logger.info({ organisationId: org.id, email }, 'organisation.registered');

    // 3) the school can use its management portal out of the box; other portals
    //    (staff/student/parent) are granted later by the company admin.
    await this.orgRepo.setPortalAccess(org.id, ['management'], userId);
    const provisioned = await this.orgRepo.findWithPortals(org.id);

    // 4) deliver credentials (never fail the request on email failure)
    await sendSchoolCredentialsEmail(email, org.name, input.adminFullName || 'School Administrator', password);

    return {
      organisation: provisioned ?? org,
      management: { email, full_name: input.adminFullName || 'School Administrator', role: 'management', temporary_password: password },
      user_id: userId,
    };
  }

  async updateStatus(organisationId: string, status: OrganisationStatus): Promise<OrganisationDTO> {
    const org = await this.orgRepo.updateStatusWithPortals(organisationId, status);
    logger.info({ organisationId, status }, 'organisation.status.changed');
    return org;
  }

  /** Grant/revoke the portals a school may use (called by the company admin). */
  async updatePortals(organisationId: string, portals: PortalSlug[], grantedBy: string | undefined): Promise<OrganisationDTO> {
    const existing = await this.orgRepo.findById(organisationId);
    if (!existing) throw new NotFoundError('Organisation not found');
    await this.orgRepo.setPortalAccess(organisationId, portals, grantedBy);
    const org = await this.orgRepo.findWithPortals(organisationId);
    logger.info({ organisationId, portals, grantedBy }, 'organisation.portals.updated');
    return org ?? existing;
  }

  async list(): Promise<OrganisationDTO[]> {
    return this.orgRepo.listWithPortals();
  }

  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let out = '';
    const bytes = crypto.randomBytes(12);
    for (let i = 0; i < 12; i++) out += chars[bytes[i] % chars.length];
    return out;
  }
}

export const organisationsService = new OrganisationsService(new OrganisationsRepository(), new UsersRepository());