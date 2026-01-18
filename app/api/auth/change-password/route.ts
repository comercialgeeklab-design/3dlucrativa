import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { User } from '@/lib/database/entities/User';
import { hashPassword, comparePassword } from '@/lib/auth/jwt';
import { withAuth } from '@/lib/auth/middleware';

async function handleChangePassword(request: NextRequest, user: User) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Senha atual e nova senha são obrigatórias' },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Nova senha deve ter no mínimo 6 caracteres' },
        { status: 400 },
      );
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 401 },
      );
    }

    const dataSource = await getDataSource();
    const userRepository = dataSource.getRepository(User);

    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    user.mustChangePassword = false;

    await userRepository.save(user);

    return NextResponse.json({
      message: 'Senha alterada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao trocar senha:', error);
    return NextResponse.json({ error: 'Erro ao trocar senha' }, { status: 500 });
  }
}

export const POST = withAuth(handleChangePassword);
