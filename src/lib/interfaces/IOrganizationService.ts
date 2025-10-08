import type { User } from '@prisma/client';

export interface IOrganizationService {
  getOrganizationId(userId: string): Promise<string>;
  getOrganizationMembers(organizationId: string): Promise<User[]>;
  getOrganizationFilter(organizationId: string): object;
  isAdmin(user: User): boolean;
}

