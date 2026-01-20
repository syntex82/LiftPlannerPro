const { Client } = require('pg');

console.log('🔧 Fixing Project Table Structure\n');

async function fixProjectTable() {
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

    // Check current Project table structure
    console.log('🔍 Checking Project table structure...');
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Project' 
      ORDER BY ordinal_position
    `);

    console.log('📋 Current Project table columns:');
    tableInfo.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check if 'data' column exists
    const hasDataColumn = tableInfo.rows.some(row => row.column_name === 'data');
    
    if (!hasDataColumn) {
      console.log('\n🔧 Adding missing "data" column to Project table...');
      await client.query(`
        ALTER TABLE "Project" 
        ADD COLUMN "data" TEXT
      `);
      console.log('   ✅ "data" column added successfully');
    } else {
      console.log('\n✅ "data" column already exists');
    }

    // Check if other required columns exist and add them if missing
    const requiredColumns = [
      { name: 'createdAt', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      { name: 'updatedAt', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    ];

    for (const col of requiredColumns) {
      const hasColumn = tableInfo.rows.some(row => row.column_name === col.name);
      
      if (!hasColumn) {
        console.log(`🔧 Adding missing "${col.name}" column...`);
        await client.query(`
          ALTER TABLE "Project" 
          ADD COLUMN "${col.name}" ${col.type} DEFAULT ${col.default}
        `);
        console.log(`   ✅ "${col.name}" column added`);
      }
    }

    // Verify final structure
    console.log('\n🔍 Final Project table structure:');
    const finalTableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Project' 
      ORDER BY ordinal_position
    `);

    finalTableInfo.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n✅ Project table structure fixed!');

  } catch (error) {
    console.error('❌ Error fixing Project table:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

fixProjectTable().catch(console.error);
