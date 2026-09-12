import { MemoryRepository } from '../../db/memoryRepository.ts';
import { SEED_ADMIN_USERS } from '../../db/seedData.ts';
import type { AdminUserEntity } from './auth.model.ts';

export class AuthService {
  private repo: MemoryRepository<AdminUserEntity>;

  constructor() {
    this.repo = new MemoryRepository<AdminUserEntity>(SEED_ADMIN_USERS);
  }

  public async getAdminUserByEmail(email: string): Promise<AdminUserEntity | null> {
    const users = await this.repo.findAll((u) => u.email.toLowerCase() === email.toLowerCase());
    return users[0] || null;
  }

  public async getAdminUsers(): Promise<AdminUserEntity[]> {
    return this.repo.findAll();
  }
}

export const authService = new AuthService();
