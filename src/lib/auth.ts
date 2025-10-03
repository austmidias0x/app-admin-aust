import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getUserById } from './db';
import type { User } from './types';

const COOKIE_NAME = 'admin-auth-token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 dias

// Pega o usuário autenticado do cookie
export async function getAuthUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  
  if (!token?.value) {
    return null;
  }

  try {
    const user = await getUserById(token.value);
    return user as User;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

// Verifica se o usuário tem permissão de super admin
export async function requireSuperAdmin(): Promise<User> {
  const user = await getAuthUser();
  
  if (!user || user.role !== 'super_admin') {
    throw new Error('Unauthorized: Super Admin access required');
  }
  
  return user;
}

// Verifica se o usuário tem permissão de admin ou super admin
export async function requireAdmin(): Promise<User> {
  const user = await getAuthUser();
  
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  return user;
}

// Cria sessão (salva cookie)
export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

// Destroi sessão (remove cookie)
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Hash de senha
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verifica senha
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Verifica se usuário está ativo
export function isUserActive(user: User): boolean {
  return user.active;
}

// Verifica se usuário pode gerenciar outro usuário
export function canManageUser(actor: User, target: User): boolean {
  // Super admin pode gerenciar qualquer um
  if (actor.role === 'super_admin') {
    return true;
  }
  
  // Admin pode gerenciar usuários da sua organização
  if (actor.role === 'admin' && target.organizationId === actor.id) {
    return true;
  }
  
  return false;
}

