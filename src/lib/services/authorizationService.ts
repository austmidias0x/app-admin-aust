import type { AuthUser } from '../interfaces/IAuthService';
import type {
  IAuthorizationService,
  PermissionKey,
  ModuleType,
} from '../interfaces/IAuthorizationService';

export class AuthorizationService implements IAuthorizationService {
  /**
   * Verifica se usuário tem uma permissão específica
   * SuperAdmin e Admin sempre têm todas as permissões
   */
  hasPermission(user: AuthUser, permission: PermissionKey): boolean {
    // SuperAdmin e Admin têm todas as permissões
    if (this.isSuperAdmin(user) || this.isAdmin(user)) {
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
   * Verifica se usuário é superadmin
   */
  isSuperAdmin(user: AuthUser): boolean {
    // Verificar por email específico (para o caso atual)
    if (user.email === 'austmidias@gmail.com') {
      return true;
    }
    
    // Verificar por role super_admin (para casos futuros)
    if (user.role === 'super_admin') {
      return true;
    }
    
    return false;
  }

  /**
   * Verifica se usuário pode gerenciar outros usuários
   */
  canManageUsers(user: AuthUser): boolean {
    return this.isSuperAdmin(user) || this.isAdmin(user) || this.hasPermission(user, 'canManageUsers');
  }

  /**
   * Verifica se usuário pode gerenciar espaços
   */
  canManageSpaces(user: AuthUser): boolean {
    return this.isSuperAdmin(user) || this.isAdmin(user) || this.hasPermission(user, 'canManageSpaces');
  }

  /**
   * Verifica se usuário pode gerenciar clientes
   */
  canManageClients(user: AuthUser): boolean {
    return this.isSuperAdmin(user) || this.isAdmin(user) || this.hasPermission(user, 'canManageClients');
  }

  /**
   * Verifica se usuário é um sub-usuário (manager ou member)
   */
  isSubUser(user: AuthUser): boolean {
    return user.role === 'manager' || user.role === 'member';
  }

  /**
   * Verifica se usuário é manager
   */
  isManager(user: AuthUser): boolean {
    return user.role === 'manager';
  }

  /**
   * Verifica se usuário é member
   */
  isMember(user: AuthUser): boolean {
    return user.role === 'member';
  }

  /**
   * Verifica se usuário pode acessar dados de uma organização específica
   */
  canAccessOrganization(user: AuthUser, organizationId: string): boolean {
    // SuperAdmin pode acessar qualquer organização
    if (this.isSuperAdmin(user)) {
      return true;
    }

    // Admin pode acessar apenas sua própria organização
    if (this.isAdmin(user)) {
      return user.id === organizationId;
    }

    // Sub-usuários podem acessar apenas a organização à qual pertencem
    if (this.isSubUser(user)) {
      return user.organizationId === organizationId;
    }

    return false;
  }

  /**
   * Verifica se usuário pode gerenciar sub-usuários de uma organização
   */
  canManageSubUsers(user: AuthUser, organizationId: string): boolean {
    // SuperAdmin pode gerenciar sub-usuários de qualquer organização
    if (this.isSuperAdmin(user)) {
      return true;
    }

    // Admin pode gerenciar sub-usuários apenas de sua própria organização
    if (this.isAdmin(user)) {
      return user.id === organizationId;
    }

    // Sub-usuários não podem gerenciar outros sub-usuários
    return false;
  }

  /**
   * Verifica se usuário pode editar outro usuário
   */
  canEditUser(user: AuthUser, targetUserId: string, targetUserRole: string): boolean {
    // SuperAdmin pode editar qualquer usuário
    if (this.isSuperAdmin(user)) {
      return true;
    }

    // Admin pode editar apenas sub-usuários de sua organização
    if (this.isAdmin(user)) {
      return (targetUserRole === 'manager' || targetUserRole === 'member') && 
             user.id === targetUserId; // Verificar se o targetUser pertence à organização do admin
    }

    // Sub-usuários não podem editar outros usuários
    return false;
  }

  /**
   * Verifica se usuário pode deletar outro usuário
   */
  canDeleteUser(user: AuthUser, targetUserId: string, targetUserRole: string): boolean {
    // SuperAdmin pode deletar qualquer usuário
    if (this.isSuperAdmin(user)) {
      return true;
    }

    // Admin pode deletar apenas sub-usuários de sua organização
    if (this.isAdmin(user)) {
      return (targetUserRole === 'manager' || targetUserRole === 'member') && 
             user.id === targetUserId; // Verificar se o targetUser pertence à organização do admin
    }

    // Sub-usuários não podem deletar outros usuários
    return false;
  }

  /**
   * Verifica se usuário pode criar sub-usuários
   */
  canCreateSubUsers(user: AuthUser): boolean {
    return this.isSuperAdmin(user) || this.isAdmin(user);
  }

  /**
   * Verifica se usuário pode ver sub-usuários de uma organização
   */
  canViewSubUsers(user: AuthUser, organizationId: string): boolean {
    return this.canManageSubUsers(user, organizationId);
  }
}

// Singleton
export const authorizationService = new AuthorizationService();

