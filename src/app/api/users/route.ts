import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';
import { requireAdmin, hashPassword } from '@/lib/auth';
import { query, userExists, listOrganizationUsers } from '@/lib/db';

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

// GET - Listar usuários de uma organização
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId') || user.id;

    // Super admin pode ver qualquer organização
    // Admin só pode ver sua própria organização
    if (user.role !== 'super_admin' && organizationId !== user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const users = await listOrganizationUsers(organizationId);

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

    // Definir organizationId
    let organizationId = data.organizationId;
    
    // Se for admin criando usuário, usar seu próprio ID como organizationId
    if (authUser.role === 'admin') {
      organizationId = authUser.id;
    }
    
    // Se for admin sendo criado, organizationId deve ser null
    if (data.role === 'admin') {
      organizationId = undefined;
    }

    // Senha padrão ou fornecida
    const password = data.password || 'Senha@123';
    const hashedPassword = await hashPassword(password);

    const userId = createId();
    const now = new Date().toISOString();

    // Criar usuário
    await query(
      `INSERT INTO "User" (
        id, email, name, password, role, active, "organizationId", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        userId,
        data.email,
        data.name,
        hashedPassword,
        data.role,
        true,
        organizationId || null,
        now,
        now,
      ]
    );

    // Criar permissões
    const permissions = data.permissions || {
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
    const permissionId = createId();

    await query(
      `INSERT INTO "UserPermission" (
        id, "userId",
        "canAccessTasks", "canAccessDocuments", "canAccessFinancial",
        "canAccessSales", "canAccessGoals", "canAccessClients",
        "canCreateTasks", "canEditAllTasks", "canEditOwnTasks",
        "canDeleteTasks", "canAssignTasks", "canChangeTaskDates", "canChangeTaskStatus",
        "canCreateDocuments", "canEditDocuments", "canDeleteDocuments",
        "canCreateTransactions", "canEditTransactions", "canDeleteTransactions", "canViewReports",
        "canManageSales", "canManageFunnel",
        "canManageUsers", "canManageSpaces", "canManageClients",
        "createdAt", "updatedAt"
      ) VALUES (
        $1, $2,
        $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18,
        $19, $20, $21, $22,
        $23, $24,
        $25, $26, $27,
        $28, $29
      )`,
      [
        permissionId, userId,
        permissions.canAccessTasks ?? true,
        permissions.canAccessDocuments ?? true,
        permissions.canAccessFinancial ?? false,
        permissions.canAccessSales ?? false,
        permissions.canAccessGoals ?? false,
        permissions.canAccessClients ?? false,
        permissions.canCreateTasks ?? true,
        permissions.canEditAllTasks ?? false,
        permissions.canEditOwnTasks ?? true,
        permissions.canDeleteTasks ?? false,
        permissions.canAssignTasks ?? false,
        permissions.canChangeTaskDates ?? true,
        permissions.canChangeTaskStatus ?? true,
        permissions.canCreateDocuments ?? true,
        permissions.canEditDocuments ?? false,
        permissions.canDeleteDocuments ?? false,
        permissions.canCreateTransactions ?? false,
        permissions.canEditTransactions ?? false,
        permissions.canDeleteTransactions ?? false,
        permissions.canViewReports ?? false,
        permissions.canManageSales ?? false,
        permissions.canManageFunnel ?? false,
        permissions.canManageUsers ?? false,
        permissions.canManageSpaces ?? false,
        permissions.canManageClients ?? false,
        now, now,
      ]
    );

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: {
        id: userId,
        email: data.email,
        name: data.name,
        role: data.role,
        organizationId,
      },
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

