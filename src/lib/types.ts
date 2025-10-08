// Importar tipos do Prisma
import type { User, UserPermission, Prisma } from '@prisma/client';

// Re-exportar tipos do Prisma
export type { User, UserPermission };

// Tipos derivados do Prisma
export type UserRole = 'admin' | 'manager' | 'member';

export type UserWithPermissions = User & {
  permissions?: UserPermission | null;
  _count?: {
    assignedTasks?: number;
    tasks?: number;
    documents?: number;
    transactions?: number;
  };
};

export type UserWithStats = User & {
  permissions?: UserPermission | null;
  _count?: {
    members?: number;
    spaces?: number;
    tasks?: number;
    documents?: number;
    transactions?: number;
    sales?: number;
    goals?: number;
  };
};

export interface CreateUserDTO {
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  organizationId?: string | null;
  permissions?: Partial<Omit<UserPermission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: UserRole;
  active?: boolean;
  permissions?: Partial<Omit<UserPermission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
}

