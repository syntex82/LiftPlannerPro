const { Client } = require('pg');

console.log('🔧 Fixing Rigging Equipment Table Structure\n');

async function fixRiggingTable() {
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

    // Check current rigging_equipment table structure
    console.log('🔍 Checking rigging_equipment table structure...');
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'rigging_equipment' 
      ORDER BY ordinal_position
    `);

    console.log('📋 Current rigging_equipment table columns:');
    tableInfo.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Required columns based on Prisma schema
    const requiredColumns = [
      { name: 'category', type: 'TEXT', required: true },
      { name: 'model', type: 'TEXT', required: false },
      { name: 'condition', type: 'INTEGER', default: '5' },
      { name: 'lastInspection', type: 'TIMESTAMP', required: false },
      { name: 'userId', type: 'TEXT', required: true },
      { name: 'createdAt', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
      { name: 'updatedAt', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
    ];

    console.log('\n🔧 Adding missing columns...');

    for (const col of requiredColumns) {
      const hasColumn = tableInfo.rows.some(row => row.column_name === col.name);
      
      if (!hasColumn) {
        console.log(`📝 Adding "${col.name}" column...`);
        
        let query = `ALTER TABLE "rigging_equipment" ADD COLUMN "${col.name}" ${col.type}`;
        
        if (col.required) {
          // For required columns, add with default first, then make NOT NULL
          if (col.name === 'category') {
            query += ` DEFAULT 'General'`;
          } else if (col.name === 'userId') {
            // Get the admin user ID
            const adminUser = await client.query(`SELECT id FROM "User" WHERE email = 'mickyblenk@gmail.com' LIMIT 1`);
            if (adminUser.rows.length > 0) {
              query += ` DEFAULT '${adminUser.rows[0].id}'`;
            } else {
              query += ` DEFAULT 'admin-user'`;
            }
          }
        } else if (col.default) {
          query += ` DEFAULT ${col.default}`;
        }
        
        await client.query(query);
        console.log(`   ✅ "${col.name}" column added`);
        
        // If it's a required column, update existing records and make NOT NULL
        if (col.required && col.name !== 'userId') {
          if (col.name === 'category') {
            await client.query(`UPDATE "rigging_equipment" SET "category" = 'General' WHERE "category" IS NULL`);
          }
        }
      } else {
        console.log(`   ✅ "${col.name}" column already exists`);
      }
    }

    // Fix status column values to match schema
    console.log('\n🔧 Updating status values to match schema...');
    await client.query(`
      UPDATE "rigging_equipment" 
      SET status = 'IN_SERVICE' 
      WHERE status = 'in_service' OR status IS NULL
    `);
    console.log('   ✅ Status values updated');

    // Remove columns that don't exist in schema
    const columnsToRemove = ['description', 'safeWorkingLoad'];
    for (const colName of columnsToRemove) {
      const hasColumn = tableInfo.rows.some(row => row.column_name === colName);
      if (hasColumn) {
        console.log(`🗑️ Removing "${colName}" column (not in schema)...`);
        try {
          await client.query(`ALTER TABLE "rigging_equipment" DROP COLUMN "${colName}"`);
          console.log(`   ✅ "${colName}" column removed`);
        } catch (error) {
          console.log(`   ⚠️ Could not remove "${colName}": ${error.message}`);
        }
      }
    }

    // Verify final structure
    console.log('\n🔍 Final rigging_equipment table structure:');
    const finalTableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'rigging_equipment' 
      ORDER BY ordinal_position
    `);

    finalTableInfo.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n✅ Rigging equipment table structure fixed!');

  } catch (error) {
    console.error('❌ Error fixing rigging equipment table:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

fixRiggingTable().catch(console.error);
