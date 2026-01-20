const { Client } = require('pg')

async function createContactTable() {
  console.log('🔧 Creating contact_submissions table...')

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

    // Create the contact_submissions table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT,
        phone TEXT,
        message TEXT NOT NULL,
        "demoType" TEXT DEFAULT 'general',
        "ipAddress" TEXT,
        status TEXT DEFAULT 'NEW',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    await client.query(createTableSQL)
    console.log('✅ contact_submissions table created successfully')

    // Create indexes for better performance
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);',
      'CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);',
      'CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions("createdAt");'
    ]

    for (const indexSQL of createIndexes) {
      await client.query(indexSQL)
    }
    console.log('✅ Indexes created successfully')

    console.log('\n✅ Contact submissions table created successfully!')

  } catch (error) {
    console.error('❌ Error creating table:', error.message)
  } finally {
    await client.end()
    console.log('🔌 Disconnected from PostgreSQL')
  }
}

createContactTable()
