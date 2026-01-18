import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Filament } from './Filament';

@Entity('product_filaments')
export class ProductFilament {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne('Product', 'productFilaments')
  @JoinColumn({ name: 'productId' })
  product: any;

  @Column({ type: 'uuid' })
  filamentId: string;

  @ManyToOne(() => Filament)
  @JoinColumn({ name: 'filamentId' })
  filament: Filament;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  gramsUsed: number;
}
