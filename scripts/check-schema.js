const { Client } = require('pg');

console.log('🔍 Checking Database Schema\n');

async function checkSchema() {
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

    // Check if User table exists and get its structure
    console.log('🔍 Checking User table structure...');
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY ordinal_position
    `);

    if (tableInfo.rows.length > 0) {
      console.log('📋 User table columns:');
      tableInfo.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } else {
      console.log('❌ User table does not exist');
      
      // Check what tables do exist
      console.log('\n🔍 Checking what tables exist...');
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      if (tables.rows.length > 0) {
        console.log('📋 Existing tables:');
        tables.rows.forEach((row, index) => {
          console.log(`   ${index + 1}. ${row.table_name}`);
        });
      } else {
        console.log('❌ No tables found in database');
      }
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

checkSchema().catch(console.error);
