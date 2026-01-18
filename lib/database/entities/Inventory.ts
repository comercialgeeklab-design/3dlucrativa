import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Store } from './Store';

@Entity('inventories')
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  storeId: string;

  @ManyToOne(() => Store, (store) => store.inventories)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @Column({ length: 255 })
  brand: string;

  @Column({ length: 255 })
  model: string;

  @Column({ length: 255, nullable: true })
  nickname: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  paidValue: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  photo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
