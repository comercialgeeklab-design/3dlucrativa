import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne('User', 'store')
  @JoinColumn({ name: 'userId' })
  user: any;

  @Column({ length: 255 })
  storeName: string;

  @Column({ type: 'text', nullable: true })
  logo: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 9, nullable: true })
  cep: string;

  @Column({ length: 255, nullable: true })
  street: string;

  @Column({ length: 50, nullable: true })
  number: string;

  @Column({ length: 255, nullable: true })
  complement: string;

  @Column({ length: 255, nullable: true })
  neighborhood: string;

  @Column({ length: 255, nullable: true })
  city: string;

  @Column({ length: 2, nullable: true })
  state: string;

  @Column({ default: false })
  paysTax: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxPercentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  energyCostPerKwh: number;

  @OneToMany('Product', 'store')
  products: any[];

  @OneToMany('Filament', 'store')
  filaments: any[];

  @OneToMany('Stock', 'store')
  stocks: any[];

  @OneToMany('Inventory', 'store')
  inventories: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
