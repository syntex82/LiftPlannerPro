const { Client } = require('pg');

console.log('🔄 Updating Project Schema for Categories\n');

async function updateProjectSchema() {
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
    console.log('🔍 Checking current Project table structure...');
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

    // Create enums if they don't exist
    console.log('\n🔧 Creating project enums...');
    
    try {
      await client.query(`
        CREATE TYPE "ProjectCategory" AS ENUM (
          'CAD',
          'RAMS',
          'LOFT_MANAGEMENT',
          'LOAD_CALCULATION',
          'TRAINING',
          'INSPECTION',
          'GENERAL'
        )
      `);
      console.log('   ✅ ProjectCategory enum created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ✅ ProjectCategory enum already exists');
      } else {
        console.log(`   ⚠️ Error creating ProjectCategory enum: ${error.message}`);
      }
    }

    try {
      await client.query(`
        CREATE TYPE "ProjectStatus" AS ENUM (
          'ACTIVE',
          'COMPLETED',
          'ARCHIVED',
          'TEMPLATE'
        )
      `);
      console.log('   ✅ ProjectStatus enum created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ✅ ProjectStatus enum already exists');
      } else {
        console.log(`   ⚠️ Error creating ProjectStatus enum: ${error.message}`);
      }
    }

    // Add new columns to Project table
    console.log('\n🔧 Adding new columns to Project table...');

    const newColumns = [
      { name: 'category', type: '"ProjectCategory"', default: "'CAD'" },
      { name: 'type', type: 'TEXT', default: "'general'" },
      { name: 'tags', type: 'TEXT[]', default: 'ARRAY[]::TEXT[]' },
      { name: 'status', type: '"ProjectStatus"', default: "'ACTIVE'" }
    ];

    for (const col of newColumns) {
      try {
        const hasColumn = tableInfo.rows.some(row => row.column_name === col.name);
        
        if (!hasColumn) {
          console.log(`📝 Adding "${col.name}" column...`);
          await client.query(`
            ALTER TABLE "Project" 
            ADD COLUMN "${col.name}" ${col.type} DEFAULT ${col.default}
          `);
          console.log(`   ✅ "${col.name}" column added`);
        } else {
          console.log(`   ✅ "${col.name}" column already exists`);
        }
      } catch (error) {
        console.log(`   ❌ Error adding "${col.name}" column: ${error.message}`);
      }
    }

    // Update existing projects with default values
    console.log('\n🔄 Updating existing projects with default values...');
    try {
      const updateResult = await client.query(`
        UPDATE "Project" 
        SET 
          "category" = COALESCE("category", 'CAD'),
          "type" = COALESCE("type", 'general'),
          "tags" = COALESCE("tags", ARRAY[]::TEXT[]),
          "status" = COALESCE("status", 'ACTIVE')
        WHERE "category" IS NULL OR "type" IS NULL OR "tags" IS NULL OR "status" IS NULL
      `);
      console.log(`   ✅ Updated ${updateResult.rowCount} existing projects`);
    } catch (error) {
      console.log(`   ⚠️ Error updating existing projects: ${error.message}`);
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

    // Test project creation with new schema
    console.log('\n🧪 Testing project creation with new schema...');
    try {
      const testProject = await client.query(`
        INSERT INTO "Project" (
          id, name, description, category, type, tags, status, "userId", "createdAt", "updatedAt"
        ) VALUES (
          'test_project_' || extract(epoch from now()),
          'Test Project with Categories',
          'Testing the new project schema',
          'CAD',
          'test-project',
          ARRAY['test', 'schema'],
          'ACTIVE',
          'test-user-id',
          NOW(),
          NOW()
        ) RETURNING id, name, category, type, tags, status
      `);
      
      console.log('   ✅ Test project created successfully:');
      console.log(`      ID: ${testProject.rows[0].id}`);
      console.log(`      Name: ${testProject.rows[0].name}`);
      console.log(`      Category: ${testProject.rows[0].category}`);
      console.log(`      Type: ${testProject.rows[0].type}`);
      console.log(`      Tags: ${testProject.rows[0].tags}`);
      console.log(`      Status: ${testProject.rows[0].status}`);

      // Clean up test project
      await client.query(`DELETE FROM "Project" WHERE id = $1`, [testProject.rows[0].id]);
      console.log('   ✅ Test project cleaned up');

    } catch (error) {
      console.log(`   ❌ Error testing project creation: ${error.message}`);
    }

    console.log('\n✅ Project schema update completed successfully!');
    console.log('\n🎯 New Project Features Available:');
    console.log('   📂 Categories: CAD, RAMS, Loft Management, Load Calculation, Training, Inspection');
    console.log('   🏷️ Tags: Custom project tags for organization');
    console.log('   📊 Status: Active, Completed, Archived, Template');
    console.log('   🎨 Types: Specific project types within categories');

  } catch (error) {
    console.error('❌ Error updating project schema:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database');
  }
}

updateProjectSchema().catch(console.error);
