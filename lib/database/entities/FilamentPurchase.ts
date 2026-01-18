import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('filament_purchases')
export class FilamentPurchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  filamentId: string;

  @ManyToOne('Filament', 'purchases')
  @JoinColumn({ name: 'filamentId' })
  filament: any;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalValue: number;

  @CreateDateColumn()
  purchaseDate: Date;
}
