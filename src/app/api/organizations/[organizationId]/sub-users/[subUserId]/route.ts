import { NextRequest, NextResponse } from 'next/server';
import { subUserService } from '@/lib/services/subUserService';
import { authService } from '@/lib/services/authService';
import { authorizationService } from '@/lib/services/authorizationService';

// GET /api/organizations/[organizationId]/sub-users/[subUserId]
export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string; subUserId: string } }
) {
  try {
    // Verificar autenticação
    const user = await authService.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { organizationId, subUserId } = params;

    // Verificar se o usuário pode gerenciar usuários
    if (!authorizationService.canManageUsers(user)) {
      return NextResponse.json({ error: 'Sem permissão para gerenciar usuários' }, { status: 403 });
    }

    // SuperAdmin pode ver sub-usuários de qualquer organização
    // Admin só pode ver sub-usuários da própria organização
    if (!authorizationService.isSuperAdmin(user) && user.id !== organizationId) {
      return NextResponse.json({ error: 'Sem permissão para acessar esta organização' }, { status: 403 });
    }

    const subUser = await subUserService.getSubUserById(subUserId, organizationId);

    if (!subUser) {
      return NextResponse.json({ error: 'Sub-usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ subUser });
  } catch (error) {
    console.error('Error fetching sub-user:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/organizations/[organizationId]/sub-users/[subUserId]
export async function PUT(
  request: NextRequest,
  { params }: { params: { organizationId: string; subUserId: string } }
) {
  try {
    // Verificar autenticação
    const user = await authService.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { organizationId, subUserId } = params;

    // Verificar se o usuário pode gerenciar usuários
    if (!authorizationService.canManageUsers(user)) {
      return NextResponse.json({ error: 'Sem permissão para gerenciar usuários' }, { status: 403 });
    }

    // SuperAdmin pode editar sub-usuários de qualquer organização
    // Admin só pode editar sub-usuários da própria organização
    if (!authorizationService.isSuperAdmin(user) && user.id !== organizationId) {
      return NextResponse.json({ error: 'Sem permissão para editar usuários desta organização' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, role, active, permissions } = body;

    // Validações básicas
    if (role && !['manager', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Função deve ser manager ou member' },
        { status: 400 }
      );
    }

    const subUser = await subUserService.updateSubUser(subUserId, organizationId, {
      name,
      email,
      role,
      active,
      permissions
    });

    return NextResponse.json({ 
      subUser,
      message: 'Sub-usuário atualizado com sucesso'
    });
  } catch (error: any) {
    console.error('Error updating sub-user:', error);
    
    if (error.message === 'Sub-usuário não encontrado') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    if (error.message === 'Email já está em uso por outro usuário') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[organizationId]/sub-users/[subUserId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { organizationId: string; subUserId: string } }
) {
  try {
    // Verificar autenticação
    const user = await authService.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { organizationId, subUserId } = params;

    // Verificar se o usuário pode gerenciar usuários
    if (!authorizationService.canManageUsers(user)) {
      return NextResponse.json({ error: 'Sem permissão para gerenciar usuários' }, { status: 403 });
    }

    // SuperAdmin pode deletar sub-usuários de qualquer organização
    // Admin só pode deletar sub-usuários da própria organização
    if (!authorizationService.isSuperAdmin(user) && user.id !== organizationId) {
      return NextResponse.json({ error: 'Sem permissão para deletar usuários desta organização' }, { status: 403 });
    }

    // Verificar se é hard delete (apenas para SuperAdmin)
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    if (hardDelete && !authorizationService.isSuperAdmin(user)) {
      return NextResponse.json({ error: 'Apenas SuperAdmin pode excluir permanentemente usuários' }, { status: 403 });
    }

    if (hardDelete) {
      await subUserService.hardDeleteSubUser(subUserId, organizationId);
      return NextResponse.json({ 
        message: 'Sub-usuário excluído permanentemente'
      });
    } else {
      await subUserService.deleteSubUser(subUserId, organizationId);
      return NextResponse.json({ 
        message: 'Sub-usuário desativado com sucesso'
      });
    }
  } catch (error: any) {
    console.error('Error deleting sub-user:', error);
    
    if (error.message === 'Sub-usuário não encontrado') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
