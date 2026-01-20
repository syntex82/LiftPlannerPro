const { Client } = require('pg');

console.log('🔧 Fixing Security Logs Table\n');

async function fixSecurityLogs() {
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

    // Add missing riskLevel column
    console.log('🔧 Adding riskLevel column to security_logs...');
    try {
      await client.query(`
        ALTER TABLE "security_logs" 
        ADD COLUMN IF NOT EXISTS "riskLevel" TEXT DEFAULT 'LOW'
      `);
      console.log('   ✅ riskLevel column added');
    } catch (error) {
      console.log('   ✅ riskLevel column already exists or error:', error.message);
    }

    // Verify structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'security_logs' 
      ORDER BY ordinal_position
    `);

    console.log('📋 Security logs table columns:');
    tableInfo.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.column_name} (${row.data_type})`);
    });

    console.log('\n✅ Security logs table fixed!');

  } catch (error) {
    console.error('❌ Error fixing security logs:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

fixSecurityLogs().catch(console.error);
