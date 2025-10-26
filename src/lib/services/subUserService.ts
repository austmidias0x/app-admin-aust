import { prisma } from '../prisma';
import type { User, UserPermission, Prisma } from '@prisma/client';
import type { CreateUserDTO, UpdateUserDTO } from '../types';

export interface SubUserWithPermissions extends User {
  permissions?: UserPermission | null;
  organization?: User | null;
  _count?: {
    tasks?: number;
    documents?: number;
    transactions?: number;
    sales?: number;
  };
}

export interface CreateSubUserDTO {
  email: string;
  name: string;
  password: string;
  role: 'manager' | 'member';
  organizationId: string; // ID do admin (conta mãe)
  permissions?: Partial<Omit<UserPermission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
}

export interface UpdateSubUserDTO {
  name?: string;
  email?: string;
  role?: 'manager' | 'member';
  active?: boolean;
  permissions?: Partial<Omit<UserPermission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
}

export class SubUserService {
  /**
   * Lista todos os sub-usuários de uma organização (conta admin)
   */
  async getSubUsersByOrganization(organizationId: string): Promise<SubUserWithPermissions[]> {
    return await prisma.user.findMany({
      where: {
        organizationId,
        role: {
          in: ['manager', 'member']
        }
      },
      include: {
        permissions: true,
        organization: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            tasks: true,
            documents: true,
            transactions: true,
            sales: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Busca um sub-usuário específico
   */
  async getSubUserById(subUserId: string, organizationId: string): Promise<SubUserWithPermissions | null> {
    return await prisma.user.findFirst({
      where: {
        id: subUserId,
        organizationId,
        role: {
          in: ['manager', 'member']
        }
      },
      include: {
        permissions: true,
        organization: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            tasks: true,
            documents: true,
            transactions: true,
            sales: true
          }
        }
      }
    });
  }

  /**
   * Cria um novo sub-usuário
   */
  async createSubUser(data: CreateSubUserDTO): Promise<SubUserWithPermissions> {
    // Verificar se a organização existe e é um admin
    const organization = await prisma.user.findFirst({
      where: {
        id: data.organizationId,
        role: 'admin'
      }
    });

    if (!organization) {
      throw new Error('Organização não encontrada ou não é uma conta admin');
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Hash da senha
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role,
        organizationId: data.organizationId,
        active: true
      },
      include: {
        permissions: true,
        organization: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            tasks: true,
            documents: true,
            transactions: true,
            sales: true
          }
        }
      }
    });

    // Criar permissões padrão se não fornecidas
    const defaultPermissions = {
      canAccessTasks: data.role === 'manager',
      canAccessDocuments: data.role === 'manager',
      canAccessFinancial: data.role === 'manager',
      canAccessSales: data.role === 'manager',
      canAccessGoals: data.role === 'manager',
      canAccessClients: data.role === 'manager',
      canCreateTasks: data.role === 'manager',
      canEditAllTasks: data.role === 'manager',
      canEditOwnTasks: true,
      canDeleteTasks: data.role === 'manager',
      canAssignTasks: data.role === 'manager',
      canChangeTaskDates: data.role === 'manager',
      canChangeTaskStatus: true,
      canCreateDocuments: data.role === 'manager',
      canEditDocuments: data.role === 'manager',
      canDeleteDocuments: data.role === 'manager',
      canCreateTransactions: data.role === 'manager',
      canEditTransactions: data.role === 'manager',
      canDeleteTransactions: data.role === 'manager',
      canViewReports: data.role === 'manager',
      canManageSales: data.role === 'manager',
      canManageFunnel: data.role === 'manager',
      canManageUsers: false, // Sub-usuários não podem gerenciar outros usuários
      canManageSpaces: data.role === 'manager',
      canManageClients: data.role === 'manager',
      ...data.permissions
    };

    await prisma.userPermission.create({
      data: {
        userId: user.id,
        ...defaultPermissions
      }
    });

    // Retornar usuário com permissões atualizadas
    return await this.getSubUserById(user.id, data.organizationId) as SubUserWithPermissions;
  }

  /**
   * Atualiza um sub-usuário
   */
  async updateSubUser(subUserId: string, organizationId: string, data: UpdateSubUserDTO): Promise<SubUserWithPermissions> {
    // Verificar se o sub-usuário existe e pertence à organização
    const existingUser = await this.getSubUserById(subUserId, organizationId);
    if (!existingUser) {
      throw new Error('Sub-usuário não encontrado');
    }

    // Se está alterando o email, verificar se não existe outro usuário com esse email
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: subUserId }
        }
      });

      if (emailExists) {
        throw new Error('Email já está em uso por outro usuário');
      }
    }

    // Atualizar dados do usuário
    const updateData: Prisma.UserUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (typeof data.active === 'boolean') updateData.active = data.active;

    await prisma.user.update({
      where: { id: subUserId },
      data: updateData
    });

    // Atualizar permissões se fornecidas
    if (data.permissions) {
      await prisma.userPermission.upsert({
        where: { userId: subUserId },
        update: data.permissions,
        create: {
          userId: subUserId,
          ...data.permissions
        }
      });
    }

    return await this.getSubUserById(subUserId, organizationId) as SubUserWithPermissions;
  }

  /**
   * Remove um sub-usuário (soft delete - desativa)
   */
  async deleteSubUser(subUserId: string, organizationId: string): Promise<void> {
    const existingUser = await this.getSubUserById(subUserId, organizationId);
    if (!existingUser) {
      throw new Error('Sub-usuário não encontrado');
    }

    // Soft delete - apenas desativa
    await prisma.user.update({
      where: { id: subUserId },
      data: { active: false }
    });
  }

  /**
   * Remove permanentemente um sub-usuário (hard delete)
   */
  async hardDeleteSubUser(subUserId: string, organizationId: string): Promise<void> {
    const existingUser = await this.getSubUserById(subUserId, organizationId);
    if (!existingUser) {
      throw new Error('Sub-usuário não encontrado');
    }

    // Hard delete - remove completamente
    await prisma.user.delete({
      where: { id: subUserId }
    });
  }

  /**
   * Reativa um sub-usuário
   */
  async reactivateSubUser(subUserId: string, organizationId: string): Promise<SubUserWithPermissions> {
    const existingUser = await this.getSubUserById(subUserId, organizationId);
    if (!existingUser) {
      throw new Error('Sub-usuário não encontrado');
    }

    await prisma.user.update({
      where: { id: subUserId },
      data: { active: true }
    });

    return await this.getSubUserById(subUserId, organizationId) as SubUserWithPermissions;
  }

  /**
   * Busca sub-usuários com filtros
   */
  async searchSubUsers(
    organizationId: string,
    filters: {
      search?: string;
      role?: 'manager' | 'member';
      active?: boolean;
    } = {}
  ): Promise<SubUserWithPermissions[]> {
    const where: Prisma.UserWhereInput = {
      organizationId,
      role: {
        in: ['manager', 'member']
      }
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.role) {
      where.role = filters.role;
    }

    if (typeof filters.active === 'boolean') {
      where.active = filters.active;
    }

    return await prisma.user.findMany({
      where,
      include: {
        permissions: true,
        organization: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            tasks: true,
            documents: true,
            transactions: true,
            sales: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Obtém estatísticas dos sub-usuários de uma organização
   */
  async getSubUserStats(organizationId: string) {
    const [total, active, inactive, managers, members] = await Promise.all([
      prisma.user.count({
        where: {
          organizationId,
          role: { in: ['manager', 'member'] }
        }
      }),
      prisma.user.count({
        where: {
          organizationId,
          role: { in: ['manager', 'member'] },
          active: true
        }
      }),
      prisma.user.count({
        where: {
          organizationId,
          role: { in: ['manager', 'member'] },
          active: false
        }
      }),
      prisma.user.count({
        where: {
          organizationId,
          role: 'manager'
        }
      }),
      prisma.user.count({
        where: {
          organizationId,
          role: 'member'
        }
      })
    ]);

    return {
      total,
      active,
      inactive,
      managers,
      members
    };
  }
}

// Singleton
export const subUserService = new SubUserService();
