import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { User } from '@/lib/database/entities/User';
import { withAdmin } from '@/lib/auth/middleware';

async function handleDeleteUser(
  request: NextRequest,
  user: User,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    // Prevent deleting self
    if (id === user.id) {
      return NextResponse.json(
        { error: 'Você não pode deletar a si mesmo' },
        { status: 400 },
      );
    }

    const dataSource = await getDataSource();
    const userRepository = dataSource.getRepository(User);

    const targetUser = await userRepository.findOne({ where: { id } });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 },
      );
    }

    // Prevent deleting other admins
    if (targetUser.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Não é possível deletar outro administrador' },
        { status: 400 },
      );
    }

    await userRepository.remove(targetUser);

    return NextResponse.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar usuário' },
      { status: 500 },
    );
  }
}

async function handleDeactivateUser(
  request: NextRequest,
  user: User,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    // Prevent deactivating self
    if (id === user.id) {
      return NextResponse.json(
        { error: 'Você não pode desativar a si mesmo' },
        { status: 400 },
      );
    }

    const dataSource = await getDataSource();
    const userRepository = dataSource.getRepository(User);

    const targetUser = await userRepository.findOne({ where: { id } });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 },
      );
    }

    targetUser.isActive = false;
    await userRepository.save(targetUser);

    return NextResponse.json({ message: 'Usuário desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao desativar usuário' },
      { status: 500 },
    );
  }
}

export const DELETE = withAdmin(handleDeleteUser);
export const POST = withAdmin(handleDeactivateUser);
