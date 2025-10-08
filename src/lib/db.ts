import { prisma } from './prisma';
import type { UserWithPermissions, UserWithStats } from './types';

// Re-exportar prisma para compatibilidade
export { prisma };

/**
 * Verifica se um usuário existe pelo email
 */
export async function userExists(email: string): Promise<boolean> {
  const count = await prisma.user.count({
    where: { email: email.toLowerCase().trim() },
  });
  return count > 0;
}

/**
 * Busca usuário por ID com permissões
 */
export async function getUserById(id: string): Promise<UserWithPermissions | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      permissions: true,
      _count: {
        select: {
          assignedTasks: true,
          tasks: true,
          documents: true,
          transactions: true,
        },
      },
    },
  });

  return user;
}

/**
 * Busca usuário por email com permissões
 */
export async function getUserByEmail(email: string): Promise<UserWithPermissions | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      permissions: true,
      _count: {
        select: {
          assignedTasks: true,
          tasks: true,
          documents: true,
          transactions: true,
        },
      },
    },
  });

  return user;
}

/**
 * Busca organização (admin) por ID
 */
export async function getOrganizationById(id: string): Promise<UserWithStats | null> {
  const organization = await prisma.user.findFirst({
    where: {
      id,
      role: 'admin',
      organizationId: null,
    },
    include: {
      permissions: true,
      _count: {
        select: {
          members: true,
          spaces: true,
          tasks: true,
          documents: true,
          transactions: true,
          sales: true,
          goals: true,
        },
      },
    },
  });

  return organization;
}

/**
 * Lista todas as organizações (admins)
 */
export async function listOrganizations(): Promise<UserWithStats[]> {
  const organizations = await prisma.user.findMany({
    where: {
      role: 'admin',
      organizationId: null,
    },
    include: {
      permissions: true,
      _count: {
        select: {
          members: true,
          spaces: true,
          tasks: true,
          documents: true,
          transactions: true,
          sales: true,
          goals: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return organizations;
}

/**
 * Lista usuários de uma organização (admin + membros)
 */
export async function listOrganizationUsers(organizationId: string): Promise<UserWithPermissions[]> {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { id: organizationId }, // O admin
        { organizationId: organizationId }, // Os membros
      ],
    },
    include: {
      permissions: true,
      _count: {
        select: {
          assignedTasks: true,
          tasks: true,
          documents: true,
          transactions: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users;
}

