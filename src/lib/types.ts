export type UserRole = 'super_admin' | 'admin' | 'manager' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  active: boolean;
  organizationId: string | null;
  parentUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermission {
  id: string;
  userId: string;
  // Acesso a módulos
  canAccessTasks: boolean;
  canAccessDocuments: boolean;
  canAccessFinancial: boolean;
  canAccessSales: boolean;
  canAccessGoals: boolean;
  canAccessClients: boolean;
  // Permissões de tarefas
  canCreateTasks: boolean;
  canEditAllTasks: boolean;
  canEditOwnTasks: boolean;
  canDeleteTasks: boolean;
  canAssignTasks: boolean;
  canChangeTaskDates: boolean;
  canChangeTaskStatus: boolean;
  // Permissões de documentos
  canCreateDocuments: boolean;
  canEditDocuments: boolean;
  canDeleteDocuments: boolean;
  // Permissões financeiras
  canCreateTransactions: boolean;
  canEditTransactions: boolean;
  canDeleteTransactions: boolean;
  canViewReports: boolean;
  // Permissões de vendas
  canManageSales: boolean;
  canManageFunnel: boolean;
  // Permissões de gerenciamento
  canManageUsers: boolean;
  canManageSpaces: boolean;
  canManageClients: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPermissions extends User {
  permissions?: UserPermission;
  tasks_count?: number;
}

export interface CreateUserDTO {
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  organizationId?: string;
  permissions?: Partial<UserPermission>;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: UserRole;
  active?: boolean;
  permissions?: Partial<UserPermission>;
}

