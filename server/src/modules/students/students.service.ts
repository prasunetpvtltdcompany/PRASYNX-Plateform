import bcrypt from 'bcryptjs';
import { StudentsRepository } from './students.repository';
import { UsersRepository } from '../users/users.repository';
import { config } from '../../config';
import { ConflictError, NotFoundError } from '../../shared/errors/errors';
import type { CreateStudentInput, StudentDTO, UpdateStudentInput } from '@prasynx/types';

export class StudentsService {
  constructor(
    private repo: StudentsRepository,
    private usersRepo: UsersRepository,
  ) {}

  list(tenantId: string): Promise<StudentDTO[]> {
    return this.repo.list(tenantId);
  }

  async get(tenantId: string, id: string): Promise<StudentDTO> {
    const student = await this.repo.findById(tenantId, id);
    if (!student) throw new NotFoundError('Student not found in this school');
    return student;
  }

  async create(tenantId: string, input: CreateStudentInput): Promise<StudentDTO> {
    const resolved = await this.resolveClassRefs(tenantId, input);
    let userId: string | null = null;

    if (input.email && input.password) {
      const existing = await this.usersRepo.findByEmail(input.email);
      if (existing) throw new ConflictError(`A user with email ${input.email} already exists`);
      const hash = await bcrypt.hash(input.password, config.jwt.bcryptRounds);
      userId = await this.usersRepo.createUserWithAuth({
        email: input.email,
        password: hash,
        fullName: input.full_name,
        role: 'student',
        organisationId: tenantId,
        status: 'active',
      });
    }

    const id = await this.repo.create(tenantId, resolved, userId);
    await this.repo.syncClassMap(tenantId, id, resolved.class_id ?? null);
    const created = await this.repo.findById(tenantId, id);
    if (!created) throw new NotFoundError('Student was created but could not be loaded');
    return created;
  }

  async update(tenantId: string, id: string, patch: UpdateStudentInput): Promise<StudentDTO> {
    await this.repo.assertExists(tenantId, id);
    const resolved = await this.resolveClassRefs(tenantId, patch);
    await this.repo.update(tenantId, id, resolved);
    if (patch.class_id !== undefined || patch.class_name !== undefined) {
      await this.repo.syncClassMap(tenantId, id, resolved.class_id ?? null);
    }
    const updated = await this.repo.findById(tenantId, id);
    if (!updated) throw new NotFoundError('Student not found in this school');
    return updated;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.repo.assertExists(tenantId, id);
    await this.repo.remove(tenantId, id);
  }

  /** Class/section may arrive as an id or a display name; resolve to ids. */
  private async resolveClassRefs<T extends CreateStudentInput | UpdateStudentInput>(tenantId: string, input: T): Promise<T> {
    let classId = input.class_id ?? null;
    let sectionId = input.section_id ?? null;
    if (!classId && input.class_name) classId = await this.repo.resolveClassIdByName(tenantId, input.class_name);
    if (classId && !sectionId && input.section_name) {
      sectionId = await this.repo.resolveSectionIdByName(tenantId, classId, input.section_name);
    }
    return { ...input, class_id: classId, section_id: sectionId };
  }
}

export const studentsService = new StudentsService(new StudentsRepository(), new UsersRepository());