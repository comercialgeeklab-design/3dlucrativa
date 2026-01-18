import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Platform } from './Platform';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne('User', 'sales')
  @JoinColumn({ name: 'userId' })
  user: any;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne('Product', 'sales')
  @JoinColumn({ name: 'productId' })
  product: any;

  @Column({ type: 'uuid' })
  platformId: string;

  @ManyToOne(() => Platform)
  @JoinColumn({ name: 'platformId' })
  platform: Platform;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  platformCommission: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  taxValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  netValue: number;

  @CreateDateColumn()
  saleDate: Date;
}
