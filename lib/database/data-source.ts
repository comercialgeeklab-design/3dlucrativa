import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Store } from './entities/Store';
import { Product } from './entities/Product';
import { ProductFilament } from './entities/ProductFilament';
import { Filament } from './entities/Filament';
import { FilamentPurchase } from './entities/FilamentPurchase';
import { Stock } from './entities/Stock';
import { StockPurchase } from './entities/StockPurchase';
import { Inventory } from './entities/Inventory';
import { Sale } from './entities/Sale';
import { Platform } from './entities/Platform';
import { PaymentRequest } from './entities/PaymentRequest';

// Force require reflect-metadata to load first
require('reflect-metadata');

const entities = [
  Platform,
  User,
  Store,
  Filament,
  FilamentPurchase,
  Product,
  ProductFilament,
  Stock,
  StockPurchase,
  Inventory,
  Sale,
  PaymentRequest,
];

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || '3dlucrativa',
  synchronize: false, // Desabilitar para segurança em produção
  logging: process.env.DB_LOGGING === 'true',
  entities: entities,
  migrations: [],
  subscribers: [],
  timezone: 'Z',
});

let isInitialized = false;

export async function getDataSource() {
  if (!isInitialized) {
    await AppDataSource.initialize();
    isInitialized = true;
    console.log('✅ Banco de dados conectado com sucesso!');
    
    // Sincronizar schema (criar tabelas)
    if (process.env.NODE_ENV === 'development') {
      await AppDataSource.synchronize();
      console.log('✅ Tabelas sincronizadas!');
    }

    // Garantir coluna de taxa fixa em plataformas (MySQL-safe)
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      const columnExists = await queryRunner.query(
        "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'platforms' AND COLUMN_NAME = 'fixedFeePerItem'",
        [AppDataSource.options.database],
      );
      const exists = Array.isArray(columnExists) && columnExists[0] && (columnExists[0].cnt || columnExists[0]['COUNT(*)']) > 0;
      if (!exists) {
        await queryRunner.query(
          'ALTER TABLE `platforms` ADD COLUMN `fixedFeePerItem` DECIMAL(10,2) NOT NULL DEFAULT 0',
        );
        console.log('✅ Coluna fixedFeePerItem adicionada em platforms');
      }
    } catch (err) {
      console.warn('ℹ️ Não foi possível garantir a coluna fixedFeePerItem:', err);
    } finally {
      await queryRunner.release();
    }
  }
  return AppDataSource;
}
