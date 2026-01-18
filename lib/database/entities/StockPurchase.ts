import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('stock_purchases')
export class StockPurchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  stockId: string;

  @ManyToOne('Stock', 'purchases')
  @JoinColumn({ name: 'stockId' })
  stock: any;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalValue: number;

  @CreateDateColumn()
  purchaseDate: Date;
}
