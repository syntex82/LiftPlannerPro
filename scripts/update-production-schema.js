const { Client } = require('pg');

console.log('🔄 Updating Production Database Schema\n');

async function updateSchema() {
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

    console.log('🔄 Adding missing columns to User table...');

    // Add missing columns to User table
    const alterQueries = [
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscription" TEXT DEFAULT \'free\'',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "loginAttempts" INTEGER DEFAULT 0',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "company" TEXT'
    ];

    for (const query of alterQueries) {
      try {
        await client.query(query);
        console.log(`   ✅ ${query.split(' ')[5]} column added/verified`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ✅ ${query.split(' ')[5]} column already exists`);
        } else {
          console.log(`   ❌ Error adding ${query.split(' ')[5]}: ${error.message}`);
        }
      }
    }

    // Update default values for existing records
    console.log('🔄 Setting default values for existing records...');
    await client.query(`
      UPDATE "User" 
      SET 
        "subscription" = COALESCE("subscription", 'free'),
        "isActive" = COALESCE("isActive", true),
        "loginAttempts" = COALESCE("loginAttempts", 0),
        "role" = COALESCE("role", 'user')
      WHERE "subscription" IS NULL OR "isActive" IS NULL OR "loginAttempts" IS NULL OR "role" IS NULL
    `);

    console.log('✅ Schema update completed successfully!');

    // Verify the updated schema
    console.log('\n🔍 Verifying updated schema...');
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY ordinal_position
    `);

    console.log('📋 Updated User table columns:');
    tableInfo.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

  } catch (error) {
    console.error('❌ Error updating schema:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

updateSchema().catch(console.error);
