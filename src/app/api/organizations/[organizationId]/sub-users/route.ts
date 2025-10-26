import { NextRequest, NextResponse } from 'next/server';
import { subUserService } from '@/lib/services/subUserService';
import { authService } from '@/lib/services/authService';
import { authorizationService } from '@/lib/services/authorizationService';

// GET /api/organizations/[organizationId]/sub-users
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

    // SuperAdmin pode ver sub-usuários de qualquer organização
    // Admin só pode ver sub-usuários da própria organização
    if (!authorizationService.isSuperAdmin(user) && user.id !== organizationId) {
      return NextResponse.json({ error: 'Sem permissão para acessar esta organização' }, { status: 403 });
    }

    // Buscar parâmetros de filtro
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') as 'manager' | 'member' || undefined;
    const active = searchParams.get('active') === 'true' ? true : searchParams.get('active') === 'false' ? false : undefined;

    const subUsers = await subUserService.searchSubUsers(organizationId, {
      search,
      role,
      active
    });

    return NextResponse.json({ subUsers });
  } catch (error) {
    console.error('Error fetching sub-users:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[organizationId]/sub-users
export async function POST(
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

    // SuperAdmin pode criar sub-usuários em qualquer organização
    // Admin só pode criar sub-usuários na própria organização
    if (!authorizationService.isSuperAdmin(user) && user.id !== organizationId) {
      return NextResponse.json({ error: 'Sem permissão para criar usuários nesta organização' }, { status: 403 });
    }

    const body = await request.json();
    const { email, name, password, role, permissions } = body;

    // Validações básicas
    if (!email || !name || !password || !role) {
      return NextResponse.json(
        { error: 'Email, nome, senha e função são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['manager', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Função deve ser manager ou member' },
        { status: 400 }
      );
    }

    const subUser = await subUserService.createSubUser({
      email,
      name,
      password,
      role,
      organizationId,
      permissions
    });

    return NextResponse.json({ 
      subUser,
      message: 'Sub-usuário criado com sucesso'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating sub-user:', error);
    
    if (error.message === 'Email já está em uso') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    if (error.message === 'Organização não encontrada ou não é uma conta admin') {
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
