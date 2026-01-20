const { Client } = require('pg');

console.log('🔧 Fixing Table Names to Match Prisma Schema\n');

async function fixTableNames() {
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

    // Check existing tables
    const existingTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Current tables:');
    existingTables.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    console.log('\n🔄 Renaming tables to match Prisma schema...');

    // Rename tables to match Prisma @@map directives
    const tableRenames = [
      { from: 'SystemConfig', to: 'system_config' },
      { from: 'SecurityLog', to: 'security_logs' },
      { from: 'IssueReport', to: 'issue_reports' },
      { from: 'LMSProgress', to: 'lms_progress' },
      { from: 'Certificate', to: 'certificates' },
      { from: 'RiggingEquipment', to: 'rigging_equipment' },
      { from: 'EquipmentMovement', to: 'equipment_movements' },
      { from: 'EquipmentInspection', to: 'equipment_inspections' },
      { from: 'UserSession', to: 'user_sessions' }
    ];

    for (const rename of tableRenames) {
      try {
        // Check if source table exists
        const sourceExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [rename.from]);

        // Check if target table exists
        const targetExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [rename.to]);

        if (sourceExists.rows[0].exists && !targetExists.rows[0].exists) {
          await client.query(`ALTER TABLE "${rename.from}" RENAME TO "${rename.to}"`);
          console.log(`   ✅ Renamed ${rename.from} → ${rename.to}`);
        } else if (targetExists.rows[0].exists) {
          console.log(`   ✅ ${rename.to} already exists`);
        } else {
          console.log(`   ⚠️ ${rename.from} does not exist, creating ${rename.to}...`);
          
          // Create the table with correct name
          if (rename.to === 'system_config') {
            await client.query(`
              CREATE TABLE "${rename.to}" (
                id TEXT PRIMARY KEY DEFAULT (random()::text),
                key TEXT UNIQUE NOT NULL,
                value TEXT,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )
            `);
            console.log(`   ✅ Created ${rename.to} table`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error renaming ${rename.from}: ${error.message}`);
      }
    }

    // Verify final table structure
    console.log('\n🔍 Final table structure:');
    const finalTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    finalTables.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    console.log('\n✅ Table names fixed to match Prisma schema!');

  } catch (error) {
    console.error('❌ Error fixing table names:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

fixTableNames().catch(console.error);
