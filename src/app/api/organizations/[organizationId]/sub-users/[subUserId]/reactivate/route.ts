import { NextRequest, NextResponse } from 'next/server';
import { subUserService } from '@/lib/services/subUserService';
import { authService } from '@/lib/services/authService';
import { authorizationService } from '@/lib/services/authorizationService';

// POST /api/organizations/[organizationId]/sub-users/[subUserId]/reactivate
export async function POST(
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

    // SuperAdmin pode reativar sub-usuários de qualquer organização
    // Admin só pode reativar sub-usuários da própria organização
    if (!authorizationService.isSuperAdmin(user) && user.id !== organizationId) {
      return NextResponse.json({ error: 'Sem permissão para reativar usuários desta organização' }, { status: 403 });
    }

    const subUser = await subUserService.reactivateSubUser(subUserId, organizationId);

    return NextResponse.json({ 
      subUser,
      message: 'Sub-usuário reativado com sucesso'
    });
  } catch (error: any) {
    console.error('Error reactivating sub-user:', error);
    
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
