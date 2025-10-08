import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, hashPassword, isAdmin } from '@/lib/auth';
import { prisma, userExists, listOrganizationUsers } from '@/lib/db';
import { organizationService } from '@/lib/services/organizationService';

const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  role: z.enum(['admin', 'manager', 'member'], {
    message: 'Role inválido',
  }),
  organizationId: z.string().optional(),
  permissions: z.object({
    canAccessTasks: z.boolean().default(true),
    canAccessDocuments: z.boolean().default(true),
    canAccessFinancial: z.boolean().default(false),
    canAccessSales: z.boolean().default(false),
    canAccessGoals: z.boolean().default(false),
    canAccessClients: z.boolean().default(false),
    canCreateTasks: z.boolean().default(true),
    canEditAllTasks: z.boolean().default(false),
    canEditOwnTasks: z.boolean().default(true),
    canDeleteTasks: z.boolean().default(false),
    canAssignTasks: z.boolean().default(false),
    canChangeTaskDates: z.boolean().default(true),
    canChangeTaskStatus: z.boolean().default(true),
    canCreateDocuments: z.boolean().default(true),
    canEditDocuments: z.boolean().default(false),
    canDeleteDocuments: z.boolean().default(false),
    canCreateTransactions: z.boolean().default(false),
    canEditTransactions: z.boolean().default(false),
    canDeleteTransactions: z.boolean().default(false),
    canViewReports: z.boolean().default(false),
    canManageSales: z.boolean().default(false),
    canManageFunnel: z.boolean().default(false),
    canManageUsers: z.boolean().default(false),
    canManageSpaces: z.boolean().default(false),
    canManageClients: z.boolean().default(false),
  }).optional(),
});

// GET - Listar TODAS as contas mães (admins independentes)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();

    // ===================================
    // APP DE GESTÃO: LISTAR CONTAS MÃES
    // ===================================
    // Listar TODOS os admins (contas mães) do sistema
    // Este app é para gerenciar contas, não sub-usuários
    const users = await prisma.user.findMany({
      where: {
        role: 'admin',
        organizationId: null,  // Apenas contas mães (independentes)
      },
      include: {
        permissions: true,
        _count: {
          select: {
            members: true,  // Conta quantos sub-usuários cada admin tem
            spaces: true,
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

    // Remover senhas
    const usersWithoutPasswords = users.map(({ password, ...user }: any) => user);
    
    return NextResponse.json({ users: usersWithoutPasswords });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error('List users error:', error);
    return NextResponse.json(
      { error: 'Erro ao listar usuários' },
      { status: 500 }
    );
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAdmin();
    const body = await request.json();
    const data = createUserSchema.parse(body);

    // Verificar se email já existe
    const exists = await userExists(data.email);
    if (exists) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    // ===================================
    // APP DE GESTÃO: CRIAR CONTAS MÃES
    // ===================================
    // Este app serve APENAS para criar admins independentes (contas mães)
    // que depois farão login no app principal e criarão seus próprios sub-usuários.
    //
    // SEMPRE criar como admin com organizationId = null
    const role = 'admin';  // Forçar role como admin
    const organizationId = null;  // Forçar conta mãe (independente)

    // Senha padrão ou fornecida
    const password = data.password || 'Senha@123';
    const hashedPassword = await hashPassword(password);

    // Permissões padrão ou fornecidas
    const defaultPermissions = {
      canAccessTasks: true,
      canAccessDocuments: true,
      canAccessFinancial: false,
      canAccessSales: false,
      canAccessGoals: false,
      canAccessClients: false,
      canCreateTasks: true,
      canEditAllTasks: false,
      canEditOwnTasks: true,
      canDeleteTasks: false,
      canAssignTasks: false,
      canChangeTaskDates: true,
      canChangeTaskStatus: true,
      canCreateDocuments: true,
      canEditDocuments: false,
      canDeleteDocuments: false,
      canCreateTransactions: false,
      canEditTransactions: false,
      canDeleteTransactions: false,
      canViewReports: false,
      canManageSales: false,
      canManageFunnel: false,
      canManageUsers: false,
      canManageSpaces: false,
      canManageClients: false,
    };

    const permissions = data.permissions 
      ? { ...defaultPermissions, ...data.permissions }
      : defaultPermissions;

    // Criar usuário com Prisma
    const newUser = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        name: data.name.trim(),
        password: hashedPassword,
        role: role,  // Sempre 'admin' (conta mãe)
        active: true,
        organizationId: organizationId,  // Sempre null (conta independente)
        permissions: {
          create: permissions,
        },
      },
      include: {
        permissions: true,
      },
    });

    // Retornar sem senha
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: userWithoutPassword,
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}

