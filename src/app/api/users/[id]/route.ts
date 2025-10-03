import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, canManageUser, hashPassword } from '@/lib/auth';
import { query, getUserById } from '@/lib/db';

const updateUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  role: z.enum(['admin', 'manager', 'member']).optional(),
  active: z.boolean().optional(),
  permissions: z.object({
    canAccessTasks: z.boolean().optional(),
    canAccessDocuments: z.boolean().optional(),
    canAccessFinancial: z.boolean().optional(),
    canAccessSales: z.boolean().optional(),
    canAccessGoals: z.boolean().optional(),
    canAccessClients: z.boolean().optional(),
    canCreateTasks: z.boolean().optional(),
    canEditAllTasks: z.boolean().optional(),
    canEditOwnTasks: z.boolean().optional(),
    canDeleteTasks: z.boolean().optional(),
    canAssignTasks: z.boolean().optional(),
    canChangeTaskDates: z.boolean().optional(),
    canChangeTaskStatus: z.boolean().optional(),
    canCreateDocuments: z.boolean().optional(),
    canEditDocuments: z.boolean().optional(),
    canDeleteDocuments: z.boolean().optional(),
    canCreateTransactions: z.boolean().optional(),
    canEditTransactions: z.boolean().optional(),
    canDeleteTransactions: z.boolean().optional(),
    canViewReports: z.boolean().optional(),
    canManageSales: z.boolean().optional(),
    canManageFunnel: z.boolean().optional(),
    canManageUsers: z.boolean().optional(),
    canManageSpaces: z.boolean().optional(),
    canManageClients: z.boolean().optional(),
  }).optional(),
});

// GET - Buscar usuário específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAdmin();
    const { id } = await params;

    const user = await getUserById(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão
    if (!canManageUser(authUser, user)) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Remover senha
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    const user = await getUserById(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão
    if (!canManageUser(authUser, user)) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();

    // Atualizar dados do usuário
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }

    if (data.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }

    if (data.password !== undefined) {
      const hashedPassword = await hashPassword(data.password);
      updates.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }

    if (data.role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      values.push(data.role);
    }

    if (data.active !== undefined) {
      updates.push(`active = $${paramIndex++}`);
      values.push(data.active);
    }

    if (updates.length > 0) {
      updates.push(`"updatedAt" = $${paramIndex++}`);
      values.push(now);
      values.push(id);

      await query(
        `UPDATE "User" SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        values
      );
    }

    // Atualizar permissões se fornecidas
    if (data.permissions) {
      const permUpdates: string[] = [];
      const permValues: any[] = [];
      let permParamIndex = 1;

      Object.entries(data.permissions).forEach(([key, value]) => {
        if (value !== undefined) {
          permUpdates.push(`"${key}" = $${permParamIndex++}`);
          permValues.push(value);
        }
      });

      if (permUpdates.length > 0) {
        permUpdates.push(`"updatedAt" = $${permParamIndex++}`);
        permValues.push(now);
        permValues.push(id);

        await query(
          `UPDATE "UserPermission" SET ${permUpdates.join(', ')} WHERE "userId" = $${permParamIndex}`,
          permValues
        );
      }
    }

    return NextResponse.json({
      message: 'Usuário atualizado com sucesso',
    });
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

    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}

// DELETE - Desativar usuário (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAdmin();
    const { id } = await params;

    const user = await getUserById(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão
    if (!canManageUser(authUser, user)) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Não permitir deletar a si mesmo
    if (authUser.id === id) {
      return NextResponse.json(
        { error: 'Você não pode desativar sua própria conta' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Soft delete - apenas desativa
    await query(
      `UPDATE "User" SET active = false, "updatedAt" = $1 WHERE id = $2`,
      [now, id]
    );

    return NextResponse.json({
      message: 'Usuário desativado com sucesso',
    });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Erro ao desativar usuário' },
      { status: 500 }
    );
  }
}

