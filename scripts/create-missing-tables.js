const { Client } = require('pg');

console.log('🔧 Creating Missing Database Tables\n');

async function createMissingTables() {
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
    `);
    
    const existing = existingTables.rows.map(row => row.table_name);
    console.log('📋 Existing tables:', existing.join(', '));

    // Required tables from Prisma schema
    const requiredTables = [
      'Account', 'Session', 'User', 'VerificationToken', 'Project',
      'UserSession', 'SecurityLog', 'SystemConfig', 'IssueReport',
      'LMSProgress', 'Certificate', 'RiggingEquipment', 
      'EquipmentMovement', 'EquipmentInspection'
    ];

    console.log('\n🔧 Creating missing tables...');

    // Create SecurityLog table if missing
    if (!existing.includes('SecurityLog')) {
      console.log('📝 Creating SecurityLog table...');
      await client.query(`
        CREATE TABLE "SecurityLog" (
          id TEXT PRIMARY KEY DEFAULT (random()::text),
          "userId" TEXT,
          action TEXT NOT NULL,
          resource TEXT,
          details TEXT,
          "ipAddress" TEXT,
          "userAgent" TEXT,
          success BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('   ✅ SecurityLog table created');
    }

    // Create VerificationToken table if missing
    if (!existing.includes('VerificationToken')) {
      console.log('📝 Creating VerificationToken table...');
      await client.query(`
        CREATE TABLE "VerificationToken" (
          identifier TEXT NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires TIMESTAMP NOT NULL,
          PRIMARY KEY (identifier, token)
        )
      `);
      console.log('   ✅ VerificationToken table created');
    }

    // Create UserSession table if missing
    if (!existing.includes('UserSession')) {
      console.log('📝 Creating UserSession table...');
      await client.query(`
        CREATE TABLE "UserSession" (
          id TEXT PRIMARY KEY DEFAULT (random()::text),
          "userId" TEXT NOT NULL,
          "sessionToken" TEXT UNIQUE NOT NULL,
          expires TIMESTAMP NOT NULL,
          "ipAddress" TEXT,
          "userAgent" TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('   ✅ UserSession table created');
    }

    // Create IssueReport table if missing
    if (!existing.includes('IssueReport')) {
      console.log('📝 Creating IssueReport table...');
      await client.query(`
        CREATE TABLE "IssueReport" (
          id TEXT PRIMARY KEY DEFAULT (random()::text),
          "userId" TEXT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          priority TEXT DEFAULT 'medium',
          status TEXT DEFAULT 'open',
          "assignedTo" TEXT,
          "attachments" TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "resolvedAt" TIMESTAMP
        )
      `);
      console.log('   ✅ IssueReport table created');
    }

    // Create LMSProgress table if missing
    if (!existing.includes('LMSProgress')) {
      console.log('📝 Creating LMSProgress table...');
      await client.query(`
        CREATE TABLE "LMSProgress" (
          id TEXT PRIMARY KEY DEFAULT (random()::text),
          "userId" TEXT NOT NULL,
          "courseId" TEXT NOT NULL,
          "moduleId" TEXT,
          "lessonId" TEXT,
          progress INTEGER DEFAULT 0,
          completed BOOLEAN DEFAULT false,
          "timeSpent" INTEGER DEFAULT 0,
          "lastAccessed" TIMESTAMP,
          "completedAt" TIMESTAMP,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('   ✅ LMSProgress table created');
    }

    // Create Certificate table if missing
    if (!existing.includes('Certificate')) {
      console.log('📝 Creating Certificate table...');
      await client.query(`
        CREATE TABLE "Certificate" (
          id TEXT PRIMARY KEY DEFAULT (random()::text),
          "userId" TEXT NOT NULL,
          "courseId" TEXT NOT NULL,
          "certificateNumber" TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          "issuedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "expiresAt" TIMESTAMP,
          "downloadUrl" TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('   ✅ Certificate table created');
    }

    // Create RiggingEquipment table if missing
    if (!existing.includes('RiggingEquipment')) {
      console.log('📝 Creating RiggingEquipment table...');
      await client.query(`
        CREATE TABLE "RiggingEquipment" (
          id TEXT PRIMARY KEY DEFAULT (random()::text),
          "equipmentNumber" TEXT UNIQUE NOT NULL,
          type TEXT NOT NULL,
          description TEXT,
          manufacturer TEXT,
          model TEXT,
          "serialNumber" TEXT,
          "workingLoadLimit" DECIMAL,
          "safeWorkingLoad" DECIMAL,
          "purchaseDate" TIMESTAMP,
          "lastInspection" TIMESTAMP,
          "nextInspection" TIMESTAMP,
          "certificationExpiry" TIMESTAMP,
          status TEXT DEFAULT 'in_service',
          location TEXT,
          "assignedTo" TEXT,
          notes TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('   ✅ RiggingEquipment table created');
    }

    // Create EquipmentMovement table if missing
    if (!existing.includes('EquipmentMovement')) {
      console.log('📝 Creating EquipmentMovement table...');
      await client.query(`
        CREATE TABLE "EquipmentMovement" (
          id TEXT PRIMARY KEY DEFAULT (random()::text),
          "equipmentId" TEXT NOT NULL,
          "equipmentNumber" TEXT NOT NULL,
          "movementType" TEXT NOT NULL,
          "fromLocation" TEXT,
          "toLocation" TEXT,
          "assignedTo" TEXT,
          "assignedBy" TEXT,
          reason TEXT,
          notes TEXT,
          "movedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('   ✅ EquipmentMovement table created');
    }

    // Create EquipmentInspection table if missing
    if (!existing.includes('EquipmentInspection')) {
      console.log('📝 Creating EquipmentInspection table...');
      await client.query(`
        CREATE TABLE "EquipmentInspection" (
          id TEXT PRIMARY KEY DEFAULT (random()::text),
          "equipmentId" TEXT NOT NULL,
          "inspectionType" TEXT NOT NULL,
          "inspectedBy" TEXT NOT NULL,
          "inspectionDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          result TEXT NOT NULL,
          findings TEXT,
          recommendations TEXT,
          "nextInspectionDate" TIMESTAMP,
          "certificateNumber" TEXT,
          "attachments" TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('   ✅ EquipmentInspection table created');
    }

    // Verify all tables now exist
    console.log('\n🔍 Verifying all tables exist...');
    const finalTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Final table list:');
    finalTables.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    console.log('\n✅ All required tables have been created!');
    console.log('🎯 The firewall API should now work correctly.');

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

createMissingTables().catch(console.error);
