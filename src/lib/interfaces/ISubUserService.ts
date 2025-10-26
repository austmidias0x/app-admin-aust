import type { User, UserPermission } from '@prisma/client';

export interface SubUserWithPermissions extends User {
  permissions?: UserPermission | null;
  organization?: User | null;
  _count?: {
    tasks?: number;
    documents?: number;
    transactions?: number;
    sales?: number;
  };
}

export interface CreateSubUserDTO {
  email: string;
  name: string;
  password: string;
  role: 'manager' | 'member';
  organizationId: string;
  permissions?: Partial<Omit<UserPermission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
}

export interface UpdateSubUserDTO {
  name?: string;
  email?: string;
  role?: 'manager' | 'member';
  active?: boolean;
  permissions?: Partial<Omit<UserPermission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
}

export interface SubUserFilters {
  search?: string;
  role?: 'manager' | 'member';
  active?: boolean;
}

export interface SubUserStats {
  total: number;
  active: number;
  inactive: number;
  managers: number;
  members: number;
}

export interface ISubUserService {
  getSubUsersByOrganization(organizationId: string): Promise<SubUserWithPermissions[]>;
  getSubUserById(subUserId: string, organizationId: string): Promise<SubUserWithPermissions | null>;
  createSubUser(data: CreateSubUserDTO): Promise<SubUserWithPermissions>;
  updateSubUser(subUserId: string, organizationId: string, data: UpdateSubUserDTO): Promise<SubUserWithPermissions>;
  deleteSubUser(subUserId: string, organizationId: string): Promise<void>;
  hardDeleteSubUser(subUserId: string, organizationId: string): Promise<void>;
  reactivateSubUser(subUserId: string, organizationId: string): Promise<SubUserWithPermissions>;
  searchSubUsers(organizationId: string, filters?: SubUserFilters): Promise<SubUserWithPermissions[]>;
  getSubUserStats(organizationId: string): Promise<SubUserStats>;
}
