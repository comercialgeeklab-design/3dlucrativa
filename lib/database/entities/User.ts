import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Store } from './Store';
import { Sale } from './Sale';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum UserPlan {
  FREE = 'free',
  INTERMEDIARIO = 'intermediario',
  AVANCADO = 'avancado',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 14, unique: true, nullable: true })
  cpf: string;

  @Column({ length: 18, unique: true, nullable: true })
  cnpj: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: true })
  mustChangePassword: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: UserPlan,
    default: UserPlan.FREE,
  })
  plan: UserPlan;

  @Column({ type: 'timestamp', nullable: true })
  planActivatedAt?: Date;

  @OneToOne(() => Store, (store) => store.user)
  store: Store;

  @OneToMany(() => Sale, (sale) => sale.user)
  sales: Sale[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
