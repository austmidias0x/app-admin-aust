import type { AuthUser } from '../interfaces/IAuthService';
import type {
  IAuthorizationService,
  PermissionKey,
  ModuleType,
} from '../interfaces/IAuthorizationService';

export class AuthorizationService implements IAuthorizationService {
  /**
   * Verifica se usuário tem uma permissão específica
   * Admin sempre tem todas as permissões
   */
  hasPermission(user: AuthUser, permission: PermissionKey): boolean {
    // Admin tem todas as permissões
    if (this.isAdmin(user)) {
      return true;
    }

    // Verificar na tabela de permissões
    return user.permissions?.[permission] === true;
  }

  /**
   * Verifica se usuário pode acessar um módulo
   */
  canAccessModule(user: AuthUser, module: ModuleType): boolean {
    const modulePermissionMap: Record<ModuleType, PermissionKey> = {
      tasks: 'canAccessTasks',
      documents: 'canAccessDocuments',
      financial: 'canAccessFinancial',
      sales: 'canAccessSales',
      goals: 'canAccessGoals',
      clients: 'canAccessClients',
    };

    const permission = modulePermissionMap[module];
    return this.hasPermission(user, permission);
  }

  /**
   * Verifica se usuário é admin (dono da organização)
   */
  isAdmin(user: AuthUser): boolean {
    return user.role === 'admin';
  }

  /**
   * Verifica se usuário pode gerenciar outros usuários
   */
  canManageUsers(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, 'canManageUsers');
  }

  /**
   * Verifica se usuário pode gerenciar espaços
   */
  canManageSpaces(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, 'canManageSpaces');
  }

  /**
   * Verifica se usuário pode gerenciar clientes
   */
  canManageClients(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, 'canManageClients');
  }
}

// Singleton
export const authorizationService = new AuthorizationService();

