const { Client } = require('pg');

console.log('🏭 Creating Production Database for Lift Planner Pro\n');

async function createProductionDatabase() {
  // Connect to PostgreSQL server (not to a specific database)
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'syntex82',
    database: 'postgres' // Connect to default postgres database
  });

  try {
    console.log('🔍 Connecting to PostgreSQL server...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Check if production database exists
    console.log('🔍 Checking if production database exists...');
    const checkResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'liftplannerpro_prod'"
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Production database already exists: liftplannerpro_prod');
    } else {
      console.log('🏭 Creating production database: liftplannerpro_prod');
      await client.query('CREATE DATABASE liftplannerpro_prod');
      console.log('✅ Production database created successfully!');
    }

    // Check if development database exists
    console.log('🔍 Checking if development database exists...');
    const checkDevResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'liftplannerpro_dev'"
    );

    if (checkDevResult.rows.length > 0) {
      console.log('✅ Development database exists: liftplannerpro_dev');
    } else {
      console.log('🏗️ Creating development database: liftplannerpro_dev');
      await client.query('CREATE DATABASE liftplannerpro_dev');
      console.log('✅ Development database created successfully!');
    }

    // List all databases
    console.log('\n📋 Current databases:');
    const listResult = await client.query(
      "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname"
    );
    
    listResult.rows.forEach(row => {
      const dbName = row.datname;
      if (dbName.includes('liftplannerpro')) {
        console.log(`   ✅ ${dbName}`);
      } else {
        console.log(`   📊 ${dbName}`);
      }
    });

    console.log('\n🎯 Database creation completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run: npx prisma db push');
    console.log('   2. Test: node scripts/test-db-connection.js');
    console.log('   3. Access: https://liftplannerpro.org');

  } catch (error) {
    console.error('❌ Error creating production database:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('   - Verify password is exactly: syntex82');
      console.log('   - Check PostgreSQL user configuration');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('   - Ensure PostgreSQL service is running');
      console.log('   - Check Windows Services for "postgresql-x64-XX"');
    } else if (error.message.includes('already exists')) {
      console.log('✅ Database already exists - this is fine!');
    }
  } finally {
    await client.end();
    console.log('🔌 Disconnected from PostgreSQL server');
  }
}

createProductionDatabase().catch(console.error);
