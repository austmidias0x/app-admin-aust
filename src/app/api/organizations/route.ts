import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';
import { listOrganizations } from '@/lib/db';

export async function GET() {
  try {
    // Apenas super_admin pode listar organizações
    await requireSuperAdmin();

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

