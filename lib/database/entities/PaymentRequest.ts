import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  PIX = 'pix',
}

export enum PaymentRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('payment_requests')
export class PaymentRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentRequestStatus,
    default: PaymentRequestStatus.PENDING,
  })
  status: PaymentRequestStatus;

  // Campos para Cartão de Crédito
  @Column({ length: 255, nullable: true })
  cardHolderName?: string;

  @Column({ length: 19, nullable: true })
  cardNumber?: string;

  @Column({ length: 7, nullable: true })
  cardExpiry?: string;

  @Column({ length: 4, nullable: true })
  cardCvv?: string;

  // Campos para PIX
  @Column({ length: 255, nullable: true })
  pixKey?: string;

  @Column({ type: 'text', nullable: true })
  pixQrCode?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Campos para integração com Mercado Pago
  @Column({ length: 255, nullable: true })
  mercadoPagoPaymentId?: string;

  @Column({ length: 255, nullable: true })
  mercadoPagoPreferenceId?: string;

  @Column({ length: 255, nullable: true })
  mercadoPagoQrCodeUrl?: string;

  @Column({ type: 'text', nullable: true })
  mercadoPagoQrCodeData?: string;

  @Column({ length: 50, nullable: true })
  mercadoPagoPaymentMethod?: string;

  @Column({ type: 'json', nullable: true })
  mercadoPagoMetadata?: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
