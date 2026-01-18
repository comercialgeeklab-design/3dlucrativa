import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromHeader, verifyToken } from './jwt';
import { getDataSource } from '../database/data-source';
import { User } from '../database/entities/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
}

export async function authenticateRequest(
  request: NextRequest,
): Promise<{ user: User | null; error: string | null }> {
  const token = getTokenFromHeader(request.headers.get('authorization') || '');

  if (!token) {
    return { user: null, error: 'Token não fornecido' };
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return { user: null, error: 'Token inválido ou expirado' };
  }

  try {
    const dataSource = await getDataSource();
    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      return { user: null, error: 'Usuário não encontrado ou inativo' };
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: 'Erro ao autenticar usuário' };
  }
}

export function withAuth(
  handler: (request: NextRequest, user: User) => Promise<NextResponse>,
) {
  return async (request: NextRequest) => {
    const { user, error } = await authenticateRequest(request);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    return handler(request, user);
  };
}

export function withAdmin(
  handler: (request: NextRequest, user: User) => Promise<NextResponse>,
) {
  return async (request: NextRequest) => {
    const { user, error } = await authenticateRequest(request);

    if (error || !user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403 },
      );
    }

    return handler(request, user);
  };
}
