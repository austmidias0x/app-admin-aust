import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, hashPassword } from '@/lib/auth';
import { prisma, listOrganizations, userExists } from '@/lib/db';

const createOrgSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

/**
 * GET /api/organizations
 * Lista todas as organizações (admins) do sistema
 * Este é um painel de gestão, então qualquer admin pode ver todas as organizações
 */
export async function GET() {
  try {
    // Verificar se está autenticado como admin
    await requireAdmin();

    const organizations = await listOrganizations();
    
    return NextResponse.json({ organizations });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error('List organizations error:', error);
    return NextResponse.json(
      { error: 'Erro ao listar organizações' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations
 * Cria uma nova organização (conta admin)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar se está autenticado como admin
    await requireAdmin();

    const body = await request.json();
    const { name, email, password } = createOrgSchema.parse(body);

    // Verificar se email já existe
    const exists = await userExists(email);
    if (exists) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    // Criar organização usando Prisma
    const hashedPassword = await hashPassword(password);

    const newOrganization = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        password: hashedPassword,
        role: 'admin',
        active: true,
        organizationId: null, // Admin não tem organizationId
        permissions: {
          create: {
            // Permissões completas para admin
            canAccessTasks: true,
            canAccessDocuments: true,
            canAccessFinancial: true,
            canAccessSales: true,
            canAccessGoals: true,
            canAccessClients: true,
            canCreateTasks: true,
            canEditAllTasks: true,
            canEditOwnTasks: true,
            canDeleteTasks: true,
            canAssignTasks: true,
            canChangeTaskDates: true,
            canChangeTaskStatus: true,
            canCreateDocuments: true,
            canEditDocuments: true,
            canDeleteDocuments: true,
            canCreateTransactions: true,
            canEditTransactions: true,
            canDeleteTransactions: true,
            canViewReports: true,
            canManageSales: true,
            canManageFunnel: true,
            canManageUsers: true,
            canManageSpaces: true,
            canManageClients: true,
          },
        },
      },
      include: {
        permissions: true,
      },
    });

    // Retornar sem senha
    const { password: _, ...organizationWithoutPassword } = newOrganization;

    return NextResponse.json({
      message: 'Organização criada com sucesso',
      organization: organizationWithoutPassword,
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

    console.error('Create organization error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar organização' },
      { status: 500 }
    );
  }
}

