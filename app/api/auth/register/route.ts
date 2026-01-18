import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database/data-source';
import { User, PaymentStatus, UserPlan } from '@/lib/database/entities/User';
import { Store } from '@/lib/database/entities/Store';
import { hashPassword, generateToken } from '@/lib/auth/jwt';
import { validateCPF, validateCNPJ, validateEmail } from '@/lib/utils/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, cpf, cnpj, email, address, plan } = body;

    // Validações
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 },
      );
    }

    if (!cpf && !cnpj) {
      return NextResponse.json(
        { error: 'CPF ou CNPJ é obrigatório' },
        { status: 400 },
      );
    }

    if (cpf && !validateCPF(cpf)) {
      return NextResponse.json({ error: 'CPF inválido' }, { status: 400 });
    }

    if (cnpj && !validateCNPJ(cnpj)) {
      return NextResponse.json({ error: 'CNPJ inválido' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const userRepository = dataSource.getRepository(User);
    const storeRepository = dataSource.getRepository(Store);

    // Verificar se já existe usuário com email, CPF ou CNPJ
    const existingUser = await userRepository.findOne({
      where: [
        { email },
        cpf ? { cpf: cpf.replace(/\D/g, '') } : {},
        cnpj ? { cnpj: cnpj.replace(/\D/g, '') } : {},
      ].filter((condition) => Object.keys(condition).length > 0),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já cadastrado com estes dados' },
        { status: 409 },
      );
    }

    // Determinar o plano do usuário
    let userPlan = UserPlan.FREE;
    let paymentStatus = PaymentStatus.PENDING;
    
    if (plan === 'intermediario') {
      userPlan = UserPlan.INTERMEDIARIO;
      paymentStatus = PaymentStatus.PENDING;
    } else if (plan === 'avancado') {
      userPlan = UserPlan.AVANCADO;
      paymentStatus = PaymentStatus.PENDING;
    } else {
      // Plano FREE não precisa de pagamento
      paymentStatus = PaymentStatus.APPROVED;
    }

    // Criar usuário com senha padrão
    const defaultPassword = process.env.DEFAULT_PASSWORD || 'abc12**';
    const hashedPassword = await hashPassword(defaultPassword);

    const newUser = userRepository.create({
      name,
      cpf: cpf ? cpf.replace(/\D/g, '') : null,
      cnpj: cnpj ? cnpj.replace(/\D/g, '') : null,
      email: email.toLowerCase(),
      password: hashedPassword,
      mustChangePassword: true,
      isActive: true,
      plan: userPlan,
      paymentStatus: paymentStatus,
    });

    await userRepository.save(newUser);

    // Criar loja associada ao usuário
    const newStore = storeRepository.create({
      userId: newUser.id,
      storeName: name,
      cep: address?.cep?.replace(/\D/g, '') || null,
      street: address?.street || null,
      number: address?.number || null,
      complement: address?.complement || null,
      neighborhood: address?.neighborhood || null,
      city: address?.city || null,
      state: address?.state || null,
    });

    await storeRepository.save(newStore);

    // Gerar token JWT para auto-login
    const token = generateToken({ 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role 
    });

    return NextResponse.json(
      {
        message: 'Cadastro realizado com sucesso!',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          plan: newUser.plan,
          role: newUser.role,
        },
        token,
        defaultPassword,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao processar cadastro' },
      { status: 500 },
    );
  }
}
