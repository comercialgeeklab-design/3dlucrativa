import 'reflect-metadata';
import { getDataSource } from '../lib/database/data-source';
import { User, UserRole, PaymentStatus } from '../lib/database/entities/User';

async function fixAdmin() {
  try {
    console.log('🔧 Atualizando admin...');

    const dataSource = await getDataSource();
    const userRepository = dataSource.getRepository(User);

    const admin = await userRepository.findOne({
      where: { email: 'admin@3dlucrativa.com' },
    });

    if (admin) {
      admin.role = UserRole.ADMIN;
      admin.paymentStatus = PaymentStatus.APPROVED;
      admin.isActive = true;
      await userRepository.save(admin);
      console.log('✅ Admin atualizado com sucesso!');
      console.log('  Email: admin@3dlucrativa.com');
      console.log('  Role:', admin.role);
      console.log('  Payment Status:', admin.paymentStatus);
    } else {
      console.log('❌ Admin não encontrado');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

fixAdmin();
