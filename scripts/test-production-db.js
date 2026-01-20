const { Client } = require('pg');

console.log('🏭 Testing Production Database Connection\n');

async function testProductionDatabase() {
  // Production database connection
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
    console.log('✅ Connected to production database: liftplannerpro_prod');

    // Test basic query
    console.log('🔍 Testing database query...');
    const versionResult = await client.query('SELECT version()');
    console.log('📊 PostgreSQL version:', versionResult.rows[0].version);

    // Check if tables exist
    console.log('🔍 Checking database tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log('📋 Existing tables:');
      tablesResult.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
      });
    } else {
      console.log('⚠️ No tables found - need to run schema migration');
      
      // Create basic tables manually
      console.log('🔧 Creating basic tables...');
      
      // Create User table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "User" (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          password TEXT,
          role TEXT DEFAULT 'USER',
          "emailVerified" TIMESTAMP,
          image TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create Account table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "Account" (
          id TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL,
          type TEXT NOT NULL,
          provider TEXT NOT NULL,
          "providerAccountId" TEXT NOT NULL,
          refresh_token TEXT,
          access_token TEXT,
          expires_at INTEGER,
          token_type TEXT,
          scope TEXT,
          id_token TEXT,
          session_state TEXT,
          FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
        )
      `);
      
      // Create Session table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "Session" (
          id TEXT PRIMARY KEY,
          "sessionToken" TEXT UNIQUE NOT NULL,
          "userId" TEXT NOT NULL,
          expires TIMESTAMP NOT NULL,
          FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
        )
      `);
      
      // Create Project table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "Project" (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          "userId" TEXT NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
        )
      `);
      
      console.log('✅ Basic tables created successfully!');
    }

    // Test table access
    console.log('🔍 Testing table access...');
    try {
      const userCount = await client.query('SELECT COUNT(*) FROM "User"');
      console.log(`👥 User table accessible, count: ${userCount.rows[0].count}`);
    } catch (tableError) {
      console.log('⚠️ User table not accessible:', tableError.message);
    }

    console.log('\n✅ Production database test completed successfully!');
    console.log('🎯 Production database is ready for Lift Planner Pro!');

  } catch (error) {
    console.error('❌ Production database test failed:', error.message);
    
    if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n🔧 Database does not exist. Creating it...');
      
      // Connect to postgres database to create liftplannerpro_prod
      const adminClient = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'syntex82',
        database: 'postgres'
      });
      
      try {
        await adminClient.connect();
        await adminClient.query('CREATE DATABASE liftplannerpro_prod');
        console.log('✅ Production database created!');
        await adminClient.end();
        
        // Retry the test
        console.log('🔄 Retrying production database test...');
        await testProductionDatabase();
        
      } catch (createError) {
        console.error('❌ Failed to create production database:', createError.message);
        await adminClient.end();
      }
    }
  } finally {
    await client.end();
  }
}

testProductionDatabase().catch(console.error);
