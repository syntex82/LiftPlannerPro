const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Running Production Database Migration...\n');

async function runProductionMigration() {
  try {
    // Load production environment
    require('dotenv').config({ path: '.env.production' });

    // Copy production env to .env.local for migration
    if (fs.existsSync('.env.production')) {
      console.log('📋 Using production environment...');
      fs.copyFileSync('.env.production', '.env.local');
    }

    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Push database schema
    console.log('📊 Pushing database schema...');
    execSync('npx prisma db push', { stdio: 'inherit' });

    // Run migrations
    console.log('🚀 Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    console.log('\n✅ Production database migration completed!');
    
    // Create initial admin user
    console.log('👤 Creating initial admin user...');
    await createAdminUser();
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

async function createAdminUser() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    
    const prisma = new PrismaClient();
    
    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@liftplanner.com' }
    });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      await prisma.$disconnect();
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123!@#', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@liftplanner.com',
        password: hashedPassword,
        role: 'admin',
        subscription: 'enterprise',
        emailVerified: new Date(),
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@liftplanner.com');
    console.log('🔐 Password: admin123!@#');
    console.log('⚠️  CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!');
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

runProductionMigration();
