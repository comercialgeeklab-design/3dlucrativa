import 'reflect-metadata';
import { getDataSource } from '../lib/database/data-source';
import { Platform } from '../lib/database/entities/Platform';
import { User, UserRole, PaymentStatus } from '../lib/database/entities/User';
import { hashPassword } from '../lib/auth/jwt';

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    const dataSource = await getDataSource();
    
    // Forçar sincronização do schema
    console.log('🔄 Sincronizando tabelas...');
    await dataSource.synchronize();
    console.log('✅ Tabelas criadas com sucesso!');
    
    const platformRepository = dataSource.getRepository(Platform);
    const userRepository = dataSource.getRepository(User);

    // Criar plataformas
    const platforms = [
      { name: 'Shopee', commissionPercentage: 12.0, fixedFeePerItem: 0 },
      { name: 'Mercado Livre', commissionPercentage: 16.0, fixedFeePerItem: 0 },
      { name: 'Amazon', commissionPercentage: 15.0, fixedFeePerItem: 0 },
      { name: 'Outros', commissionPercentage: 10.0, fixedFeePerItem: 0 },
    ];

    console.log('📦 Criando plataformas de venda...');
    for (const platformData of platforms) {
      const existingPlatform = await platformRepository.findOne({
        where: { name: platformData.name },
      });

      if (!existingPlatform) {
        const platform = platformRepository.create(platformData);
        await platformRepository.save(platform);
        console.log(`  ✅ Plataforma criada: ${platform.name}`);
      } else {
        console.log(`  ⏭️  Plataforma já existe: ${platformData.name}`);
      }
    }

    // Criar usuário admin
    console.log('👤 Criando usuário administrador...');
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@3dlucrativa.com' },
    });

    if (!existingAdmin) {
      const adminPassword = await hashPassword('admin123');
      const admin = userRepository.create({
        name: 'Administrador',
        email: 'admin@3dlucrativa.com',
        password: adminPassword,
        role: UserRole.ADMIN,
        mustChangePassword: false,
        isActive: true,
        paymentStatus: PaymentStatus.APPROVED,
      });
      await userRepository.save(admin);
      console.log('  ✅ Admin criado: admin@3dlucrativa.com / admin123');
    } else {
      console.log('  ⏭️  Admin já existe');
    }

    console.log('✅ Seed concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

seed();
