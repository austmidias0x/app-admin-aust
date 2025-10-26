import { NextRequest, NextResponse } from 'next/server';
import { subUserService } from '@/lib/services/subUserService';
import { authService } from '@/lib/services/authService';
import { authorizationService } from '@/lib/services/authorizationService';

// GET /api/organizations/[organizationId]/sub-users/stats
export async function GET(
  request: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    // Verificar autenticação
    const user = await authService.getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { organizationId } = params;

    // Verificar se o usuário pode gerenciar usuários
    if (!authorizationService.canManageUsers(user)) {
      return NextResponse.json({ error: 'Sem permissão para gerenciar usuários' }, { status: 403 });
    }

    // SuperAdmin pode ver estatísticas de qualquer organização
    // Admin só pode ver estatísticas da própria organização
    if (!authorizationService.isSuperAdmin(user) && user.id !== organizationId) {
      return NextResponse.json({ error: 'Sem permissão para acessar esta organização' }, { status: 403 });
    }

    const stats = await subUserService.getSubUserStats(organizationId);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching sub-user stats:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
