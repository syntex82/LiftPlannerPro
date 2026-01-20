const { Client } = require('pg');

console.log('🔍 Checking SystemConfig Table\n');

async function checkSystemConfig() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'syntex82',
    database: 'liftplannerpro_prod'
  });

  try {
    console.log('🔍 Connecting to production database...');
    await client.connect();
    console.log('✅ Connected to production database');

    // Check if SystemConfig table exists
    console.log('🔍 Checking if SystemConfig table exists...');
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'SystemConfig'
      )
    `);

    if (tableExists.rows[0].exists) {
      console.log('✅ SystemConfig table exists');
      
      // Check table structure
      const tableInfo = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'SystemConfig' 
        ORDER BY ordinal_position
      `);

      console.log('📋 SystemConfig table columns:');
      tableInfo.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });

      // Check existing records
      const records = await client.query('SELECT * FROM "SystemConfig"');
      console.log(`\n📊 SystemConfig records: ${records.rows.length}`);
      
      if (records.rows.length > 0) {
        console.log('📋 Existing records:');
        records.rows.forEach((row, index) => {
          console.log(`   ${index + 1}. ${row.key}: ${row.value ? row.value.substring(0, 100) + '...' : 'null'}`);
        });
      }

    } else {
      console.log('❌ SystemConfig table does not exist');
      console.log('🔧 Creating SystemConfig table...');
      
      // Create SystemConfig table
      await client.query(`
        CREATE TABLE "SystemConfig" (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          key TEXT UNIQUE NOT NULL,
          value TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ SystemConfig table created successfully!');
      
      // Create initial firewall config
      console.log('🔧 Creating initial firewall configuration...');
      const initialConfig = {
        standardRulesApplied: false,
        customRulesApplied: false,
        activeRules: [],
        lastUpdated: new Date().toISOString()
      };
      
      await client.query(`
        INSERT INTO "SystemConfig" (key, value) 
        VALUES ('firewall_config', $1)
      `, [JSON.stringify(initialConfig)]);
      
      console.log('✅ Initial firewall configuration created!');
    }

    // Check all tables to see what exists
    console.log('\n🔍 All tables in database:');
    const allTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    allTables.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Error checking SystemConfig:', error.message);
    
    if (error.message.includes('gen_random_uuid')) {
      console.log('\n🔧 UUID extension not available, using alternative...');
      
      try {
        // Create table without UUID extension
        await client.query(`
          CREATE TABLE IF NOT EXISTS "SystemConfig" (
            id TEXT PRIMARY KEY DEFAULT (random()::text),
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ SystemConfig table created with alternative ID generation!');
      } catch (altError) {
        console.error('❌ Alternative table creation failed:', altError.message);
      }
    }
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

checkSystemConfig().catch(console.error);
