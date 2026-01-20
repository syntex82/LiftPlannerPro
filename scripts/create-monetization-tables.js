const { Client } = require('pg')

async function createMonetizationTables() {
  console.log('🔧 Creating monetization tables...')

  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'liftplannerpro_prod',
    user: 'postgres',
    password: 'syntex82'
  })

  try {
    await client.connect()
    console.log('✅ Connected to PostgreSQL')

    // Add credits column to users table
    try {
      await client.query(`
        ALTER TABLE "User" 
        ADD COLUMN IF NOT EXISTS credits DECIMAL(10,2) DEFAULT 0.0;
      `)
      console.log('✅ Added credits column to User table')
    } catch (error) {
      console.log('   ⚠️  Credits column may already exist')
    }

    // Create pay_per_use_transactions table
    const createPayPerUseTableSQL = `
      CREATE TABLE IF NOT EXISTS pay_per_use_transactions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "serviceType" TEXT NOT NULL,
        "serviceName" TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        "unitPrice" DECIMAL(10,2) NOT NULL,
        "totalAmount" DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'PENDING',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_pay_per_use_user 
          FOREIGN KEY ("userId") 
          REFERENCES "User"(id) 
          ON DELETE CASCADE
      );
    `

    await client.query(createPayPerUseTableSQL)
    console.log('✅ pay_per_use_transactions table created successfully')

    // Create credit_purchases table
    const createCreditPurchasesTableSQL = `
      CREATE TABLE IF NOT EXISTS credit_purchases (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "packageType" TEXT NOT NULL,
        "packageName" TEXT NOT NULL,
        "creditsAmount" INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        "paymentMethod" TEXT DEFAULT 'stripe',
        "paymentId" TEXT,
        status TEXT DEFAULT 'PENDING',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_credit_purchase_user 
          FOREIGN KEY ("userId") 
          REFERENCES "User"(id) 
          ON DELETE CASCADE
      );
    `

    await client.query(createCreditPurchasesTableSQL)
    console.log('✅ credit_purchases table created successfully')

    // Create indexes for better performance
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_pay_per_use_user_id ON pay_per_use_transactions("userId");',
      'CREATE INDEX IF NOT EXISTS idx_pay_per_use_service_type ON pay_per_use_transactions("serviceType");',
      'CREATE INDEX IF NOT EXISTS idx_pay_per_use_status ON pay_per_use_transactions(status);',
      'CREATE INDEX IF NOT EXISTS idx_pay_per_use_created_at ON pay_per_use_transactions("createdAt");',
      'CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON credit_purchases("userId");',
      'CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON credit_purchases(status);',
      'CREATE INDEX IF NOT EXISTS idx_credit_purchases_created_at ON credit_purchases("createdAt");'
    ]

    for (const indexSQL of createIndexes) {
      await client.query(indexSQL)
    }
    console.log('✅ Indexes created successfully')

    // Add some demo credits to existing users
    try {
      await client.query(`
        UPDATE "User" 
        SET credits = 10.0 
        WHERE credits IS NULL OR credits = 0;
      `)
      console.log('✅ Added demo credits to existing users')
    } catch (error) {
      console.log('   ⚠️  Could not add demo credits:', error.message)
    }

    console.log('\n✅ Monetization tables created successfully!')
    console.log('💰 Pay-per-use system ready!')
    console.log('🎯 Credit purchase system ready!')

  } catch (error) {
    console.error('❌ Error creating tables:', error.message)
  } finally {
    await client.end()
    console.log('🔌 Disconnected from PostgreSQL')
  }
}

createMonetizationTables()
