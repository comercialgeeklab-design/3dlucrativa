import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/database/entities/User';
import { withAuth } from '@/lib/auth/middleware';

async function handleGetMe(request: NextRequest, user: User) {
  try {
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        cnpj: user.cnpj,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(handleGetMe);
