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
import { FilamentPurchase } from './FilamentPurchase';

export enum FilamentType {
  PLA = 'PLA',
  ABS = 'ABS',
  PETG = 'PETG',
  TPU = 'TPU',
  NYLON = 'NYLON',
  ASA = 'ASA',
  OTHER = 'OTHER',
}

@Entity('filaments')
export class Filament {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  storeId: string;

  @ManyToOne(() => Store, (store) => store.filaments)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @Column({
    type: 'enum',
    enum: FilamentType,
  })
  type: FilamentType;

  @Column({ length: 100 })
  color: string;

  @Column({ length: 255 })
  manufacturer: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  currentStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  pricePerGram: number;

  @OneToMany(() => FilamentPurchase, (purchase) => purchase.filament)
  purchases: FilamentPurchase[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
