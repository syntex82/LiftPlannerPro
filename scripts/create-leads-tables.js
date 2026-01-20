const { Client } = require('pg')

async function createLeadsTables() {
  console.log('🔧 Creating leads and lead_interactions tables...')

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

    // Create the leads table
    const createLeadsTableSQL = `
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        company TEXT,
        phone TEXT,
        source TEXT,
        interests TEXT[] DEFAULT '{}',
        "leadMagnet" TEXT,
        "ipAddress" TEXT,
        status TEXT DEFAULT 'NEW',
        "leadScore" INTEGER DEFAULT 20,
        "lastContactDate" TIMESTAMP,
        notes TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    await client.query(createLeadsTableSQL)
    console.log('✅ leads table created successfully')

    // Create the lead_interactions table
    const createInteractionsTableSQL = `
      CREATE TABLE IF NOT EXISTS lead_interactions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "leadId" TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        outcome TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_lead_interaction 
          FOREIGN KEY ("leadId") 
          REFERENCES leads(id) 
          ON DELETE CASCADE
      );
    `

    await client.query(createInteractionsTableSQL)
    console.log('✅ lead_interactions table created successfully')

    // Create indexes for better performance
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);',
      'CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);',
      'CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);',
      'CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads("createdAt");',
      'CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_id ON lead_interactions("leadId");',
      'CREATE INDEX IF NOT EXISTS idx_lead_interactions_type ON lead_interactions(type);'
    ]

    for (const indexSQL of createIndexes) {
      await client.query(indexSQL)
    }
    console.log('✅ Indexes created successfully')

    // Insert some sample leads for testing
    const sampleLeads = [
      {
        email: 'john.engineer@example.com',
        name: 'John Smith',
        company: 'Heavy Lift Solutions Ltd',
        source: 'free_load_calculator',
        interests: ['lifting', 'safety', 'calculations'],
        leadMagnet: 'Free Load Calculator Pro',
        leadScore: 75,
        status: 'NEW'
      },
      {
        email: 'sarah.manager@cranecompany.com',
        name: 'Sarah Johnson',
        company: 'Crane & Rigging Co',
        source: 'exit_intent',
        interests: ['rigging', 'equipment'],
        leadMagnet: '7-Day Free Trial',
        leadScore: 60,
        status: 'CONTACTED'
      },
      {
        email: 'mike.supervisor@construction.com',
        name: 'Mike Wilson',
        company: 'Construction Dynamics',
        source: 'homepage',
        interests: ['safety', 'training'],
        leadScore: 45,
        status: 'NEW'
      }
    ]

    for (const lead of sampleLeads) {
      try {
        await client.query(`
          INSERT INTO leads (email, name, company, source, interests, "leadMagnet", "leadScore", status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (email) DO NOTHING
        `, [
          lead.email,
          lead.name,
          lead.company,
          lead.source,
          lead.interests,
          lead.leadMagnet,
          lead.leadScore,
          lead.status
        ])
        console.log(`   ✅ Sample lead created: ${lead.email}`)
      } catch (error) {
        console.log(`   ⚠️  Lead already exists: ${lead.email}`)
      }
    }

    console.log('\n✅ Leads tables and sample data created successfully!')

  } catch (error) {
    console.error('❌ Error creating tables:', error.message)
  } finally {
    await client.end()
    console.log('🔌 Disconnected from PostgreSQL')
  }
}

createLeadsTables()
