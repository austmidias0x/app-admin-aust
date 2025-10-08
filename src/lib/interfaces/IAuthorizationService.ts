import type { AuthUser } from './IAuthService';

export type PermissionKey = keyof Omit<
  import('@prisma/client').UserPermission,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;

export type ModuleType = 'tasks' | 'documents' | 'financial' | 'sales' | 'goals' | 'clients';

export interface IAuthorizationService {
  hasPermission(user: AuthUser, permission: PermissionKey): boolean;
  canAccessModule(user: AuthUser, module: ModuleType): boolean;
  isAdmin(user: AuthUser): boolean;
}

