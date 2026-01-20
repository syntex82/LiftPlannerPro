const { Client } = require('pg')

async function createCertificationsTable() {
  console.log('🔧 Creating equipment_certifications table...')

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

    // Create the equipment_certifications table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS equipment_certifications (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "equipmentId" TEXT NOT NULL,
        "certificateNumber" TEXT UNIQUE NOT NULL,
        "certificateType" TEXT NOT NULL,
        "issuedDate" TIMESTAMP NOT NULL,
        "expiryDate" TIMESTAMP NOT NULL,
        "issuedBy" TEXT NOT NULL,
        "competentPerson" TEXT NOT NULL,
        "testLoad" DOUBLE PRECISION,
        "testResult" TEXT DEFAULT 'pass',
        notes TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_equipment_certification 
          FOREIGN KEY ("equipmentId") 
          REFERENCES rigging_equipment(id) 
          ON DELETE CASCADE
      );
    `

    await client.query(createTableSQL)
    console.log('✅ equipment_certifications table created successfully')

    // Create indexes for better performance
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_equipment_certifications_equipment_id ON equipment_certifications("equipmentId");',
      'CREATE INDEX IF NOT EXISTS idx_equipment_certifications_expiry_date ON equipment_certifications("expiryDate");',
      'CREATE INDEX IF NOT EXISTS idx_equipment_certifications_certificate_type ON equipment_certifications("certificateType");'
    ]

    for (const indexSQL of createIndexes) {
      await client.query(indexSQL)
    }
    console.log('✅ Indexes created successfully')

  } catch (error) {
    console.error('❌ Error creating table:', error.message)
  } finally {
    await client.end()
    console.log('🔌 Disconnected from PostgreSQL')
  }
}

createCertificationsTable()
