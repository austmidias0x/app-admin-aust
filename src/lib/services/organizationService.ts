import { prisma } from '../prisma';
import type { User } from '@prisma/client';
import type { IOrganizationService } from '../interfaces/IOrganizationService';

export class OrganizationService implements IOrganizationService {
  /**
   * Obtém o ID da organização (admin) de um usuário
   * - Se for admin: retorna seu próprio ID
   * - Se for sub-usuário: retorna o organizationId
   */
  async getOrganizationId(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, organizationId: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Admin é a própria organização
    if (user.role === 'admin') {
      return user.id;
    }

    // Sub-usuário retorna o ID do admin
    if (user.organizationId) {
      return user.organizationId;
    }

    // Fallback: retornar próprio ID
    return user.id;
  }

  /**
   * Lista todos os membros de uma organização (admin + sub-usuários)
   */
  async getOrganizationMembers(organizationId: string): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        OR: [
          { id: organizationId }, // O admin
          { organizationId: organizationId }, // Os membros
        ],
        active: true,
      },
      include: {
        permissions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Retorna filtro Prisma para queries multi-tenant
   * Usado para filtrar dados que pertencem à organização
   */
  getOrganizationFilter(organizationId: string): object {
    return {
      OR: [
        { userId: organizationId }, // Criado pelo admin
        { user: { organizationId: organizationId } }, // Criado por membros
      ],
    };
  }

  /**
   * Verifica se usuário é admin (dono da organização)
   */
  isAdmin(user: User): boolean {
    return user.role === 'admin' && user.organizationId === null;
  }

  /**
   * Lista todas as organizações (todos os admins)
   */
  async listAllOrganizations(): Promise<User[]> {
    return prisma.user.findMany({
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
  }

  /**
   * Obtém detalhes completos de uma organização
   */
  async getOrganizationDetails(organizationId: string) {
    const admin = await prisma.user.findUnique({
      where: {
        id: organizationId,
        role: 'admin',
        organizationId: null,
      },
      include: {
        permissions: true,
        members: {
          where: { active: true },
          include: {
            permissions: true,
            _count: {
              select: {
                assignedTasks: true,
                documents: true,
                transactions: true,
              },
            },
          },
        },
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

    return admin;
  }
}

// Singleton
export const organizationService = new OrganizationService();

