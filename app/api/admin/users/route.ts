import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { User } from '@/lib/database/entities/User';
import { Store } from '@/lib/database/entities/Store';
import { withAdmin } from '@/lib/auth/middleware';

async function handleGetUsers(request: NextRequest, user: User) {
  try {
    const dataSource = await getDataSource();
    const userRepository = dataSource.getRepository(User);

    const users = await userRepository.find({
      relations: ['store'],
      order: { createdAt: 'DESC' },
    });

    // Format response without passwords
    const formattedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      store: u.store ? { storeName: u.store.storeName } : undefined,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 },
    );
  }
}

export const GET = withAdmin(handleGetUsers);
