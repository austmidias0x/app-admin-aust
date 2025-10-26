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
  isSuperAdmin(user: AuthUser): boolean;
  canManageUsers(user: AuthUser): boolean;
  canManageSpaces(user: AuthUser): boolean;
  canManageClients(user: AuthUser): boolean;
  isSubUser(user: AuthUser): boolean;
  isManager(user: AuthUser): boolean;
  isMember(user: AuthUser): boolean;
  canAccessOrganization(user: AuthUser, organizationId: string): boolean;
  canManageSubUsers(user: AuthUser, organizationId: string): boolean;
  canEditUser(user: AuthUser, targetUserId: string, targetUserRole: string): boolean;
  canDeleteUser(user: AuthUser, targetUserId: string, targetUserRole: string): boolean;
  canCreateSubUsers(user: AuthUser): boolean;
  canViewSubUsers(user: AuthUser, organizationId: string): boolean;
}

