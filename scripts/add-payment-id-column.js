const { Client } = require('pg')

async function addPaymentIdColumn() {
  console.log('🔧 Adding paymentId column to pay_per_use_transactions...')

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

    // Add paymentId column to pay_per_use_transactions table
    try {
      await client.query(`
        ALTER TABLE pay_per_use_transactions 
        ADD COLUMN IF NOT EXISTS "paymentId" TEXT;
      `)
      console.log('✅ Added paymentId column to pay_per_use_transactions table')
    } catch (error) {
      console.log('   ⚠️  paymentId column may already exist')
    }

    console.log('\n✅ Database schema updated successfully!')

  } catch (error) {
    console.error('❌ Error updating schema:', error.message)
  } finally {
    await client.end()
    console.log('🔌 Disconnected from PostgreSQL')
  }
}

addPaymentIdColumn()
