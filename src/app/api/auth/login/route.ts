import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/lib/services/authService';
import { sessionService } from '@/lib/services/sessionService';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Tentar fazer login usando o authService
    const user = await authService.login({ email, password });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verificar se é admin ou superadmin (este é um app de gestão)
    if (user.role !== 'admin' && user.role !== 'super_admin' && user.email !== 'austmidias@gmail.com') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar este painel.' },
        { status: 403 }
      );
    }

    // Criar sessão
    await sessionService.createSession(user.id);

    // Retornar usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Login realizado com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}

