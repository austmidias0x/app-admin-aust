/**
 * Wrapper de compatibilidade para autenticação
 * Usa os services internos para manter a interface simples nas rotas
 */

import { authService } from './services/authService';
import { sessionService } from './services/sessionService';
import { authorizationService } from './services/authorizationService';
import type { AuthUser } from './interfaces/IAuthService';
import type { User } from '@prisma/client';

// ========================================
// AUTENTICAÇÃO
// ========================================

/**
 * Obtém o usuário autenticado atual
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  return authService.getCurrentUser();
}

/**
 * Requer que o usuário seja admin (dono da organização) ou superadmin
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await getAuthUser();
  
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  if (!authorizationService.isAdmin(user) && !authorizationService.isSuperAdmin(user)) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  return user;
}

/**
 * Requer que o usuário esteja autenticado (qualquer role)
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }
  
  return user;
}

// ========================================
// SESSÕES
// ========================================

/**
 * Cria uma nova sessão para o usuário
 */
export async function createSession(userId: string): Promise<void> {
  return sessionService.createSession(userId);
}

/**
 * Destroi a sessão atual
 */
export async function destroySession(): Promise<void> {
  return sessionService.destroySession();
}

// ========================================
// SENHAS
// ========================================

/**
 * Cria hash bcrypt da senha
 */
export async function hashPassword(password: string): Promise<string> {
  return authService.hashPassword(password);
}

/**
 * Verifica se a senha corresponde ao hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return authService.verifyPassword(password, hash);
}

// ========================================
// VALIDAÇÕES
// ========================================

/**
 * Verifica se usuário está ativo
 */
export function isUserActive(user: User): boolean {
  return user.active === true;
}

/**
 * Verifica se o ator pode gerenciar o usuário alvo
 * - SuperAdmin pode gerenciar TODOS os usuários (contas mães)
 * - Admin pode gerenciar membros de sua organização
 */
export function canManageUser(actor: AuthUser, target: User): boolean {
  // SuperAdmin pode gerenciar TODOS os usuários (contas mães)
  if (isSuperAdmin(actor)) {
    return true;
  }
  
  // Admin pode gerenciar usuários da sua organização
  if (actor.role === 'admin' && target.organizationId === actor.id) {
    return true;
  }
  
  // Admin pode gerenciar a si mesmo
  if (actor.role === 'admin' && actor.id === target.id) {
    return true;
  }
  
  return false;
}

/**
 * Verifica se usuário é admin
 */
export function isAdmin(user: User): boolean {
  return user.role === 'admin' && user.organizationId === null;
}

/**
 * Verifica se usuário é superadmin
 * SuperAdmin é identificado pelo email específico ou role especial
 */
export function isSuperAdmin(user: AuthUser): boolean {
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

// ========================================
// PERMISSÕES
// ========================================

/**
 * Verifica se usuário pode gerenciar outros usuários
 */
export function canManageUsers(user: AuthUser): boolean {
  return authorizationService.canManageUsers(user);
}

