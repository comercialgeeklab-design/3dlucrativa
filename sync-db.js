require('reflect-metadata');

const mysql = require('mysql2/promise');

async function setupDatabase() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    
    const connection = await mysql.createConnection({
      host: 'mysql',
      user: '3dlucrativa',
      password: '3dlucrativa',
      database: '3dlucrativa',
      port: 3306,
    });

    console.log('✅ Conectado ao banco!');

    // Criar tabelas
    const tables = [
      `CREATE TABLE IF NOT EXISTS platforms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        commissionPercentage DECIMAL(5, 2) NOT NULL,
        fixedFeePerItem DECIMAL(10, 2) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        storeName VARCHAR(255) NOT NULL,
        logo VARCHAR(255),
        description TEXT,
        cep VARCHAR(10),
        street VARCHAR(255),
        number VARCHAR(10),
        complement VARCHAR(255),
        neighborhood VARCHAR(255),
        city VARCHAR(255),
        state VARCHAR(2),
        paysTax BOOLEAN DEFAULT FALSE,
        taxPercentage DECIMAL(5, 2),
        energyCostPerKwh DECIMAL(10, 4),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cpf VARCHAR(14),
        cnpj VARCHAR(18),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        mustChangePassword BOOLEAN DEFAULT FALSE,
        isActive BOOLEAN DEFAULT TRUE,
        paymentStatus ENUM('pending', 'active', 'suspended', 'canceled') DEFAULT 'pending',
        plan ENUM('free', 'basic', 'advanced', 'enterprise') DEFAULT 'free',
        planActivatedAt DATETIME,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        storeId INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        weight DECIMAL(10, 2),
        volume DECIMAL(10, 2),
        cost DECIMAL(10, 2),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS filaments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        storeId INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(50),
        cost DECIMAL(10, 2),
        weight DECIMAL(10, 2),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE
      )`,

      `CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        storeId INT NOT NULL,
        platformId INT NOT NULL,
        productId INT,
        filamentId INT,
        quantity INT,
        unitPrice DECIMAL(10, 2),
        totalPrice DECIMAL(10, 2),
        profitMargin DECIMAL(5, 2),
        status ENUM('pending', 'completed', 'canceled') DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE,
        FOREIGN KEY (platformId) REFERENCES platforms(id),
        FOREIGN KEY (productId) REFERENCES products(id),
        FOREIGN KEY (filamentId) REFERENCES filaments(id)
      )`,

      `CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        externalId VARCHAR(255),
        amount DECIMAL(10, 2),
        status ENUM('pending', 'approved', 'rejected', 'refunded') DEFAULT 'pending',
        description TEXT,
        paymentMethod VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )`
    ];

    for (const sql of tables) {
      await connection.execute(sql);
      console.log('✅ Tabela criada/verificada');
    }

    // Inserir plataformas padrão
    const platforms = [
      { name: 'Shopee', commission: 12.0 },
      { name: 'Mercado Livre', commission: 16.0 },
      { name: 'Amazon', commission: 15.0 },
      { name: 'Outros', commission: 10.0 },
    ];

    for (const platform of platforms) {
      const [existing] = await connection.execute(
        'SELECT id FROM platforms WHERE name = ?',
        [platform.name]
      );
      
      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO platforms (name, commissionPercentage, fixedFeePerItem) VALUES (?, ?, ?)',
          [platform.name, platform.commission, 0]
        );
        console.log(`✅ Plataforma inserida: ${platform.name}`);
      }
    }

    await connection.end();
    console.log('✅ Banco de dados configurado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

setupDatabase();
