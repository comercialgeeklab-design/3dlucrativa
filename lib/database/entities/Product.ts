import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Store } from './Store';
import { ProductFilament } from './ProductFilament';
import { Sale } from './Sale';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  storeId: string;

  @ManyToOne(() => Store, (store) => store.products)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'longtext', nullable: true })
  photo: string;

  @Column({ type: 'text', nullable: true })
  file: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  printingHours: number;

  @Column({ type: 'uuid', nullable: true })
  stockId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  packagingCost: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  profitMarginPercentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  calculatedCost: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ProductFilament, (productFilament) => productFilament.product)
  productFilaments: ProductFilament[];

  @OneToMany(() => Sale, (sale) => sale.product)
  sales: Sale[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
