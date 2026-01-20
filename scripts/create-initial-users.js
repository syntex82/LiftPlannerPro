const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

console.log('👥 Creating Initial Users for Lift Planner Pro\n');

async function createInitialUsers() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres:syntex82@localhost:5432/liftplannerpro_prod'
      }
    }
  });

  try {
    console.log('🔍 Connecting to production database...');
    await prisma.$connect();
    console.log('✅ Connected to production database');

    // Check if users already exist
    const existingUserCount = await prisma.user.count();
    console.log(`📊 Current users in database: ${existingUserCount}`);

    if (existingUserCount > 0) {
      console.log('⚠️ Users already exist in database');
      console.log('   Skipping user creation to avoid duplicates');
      
      // Show existing users
      const existingUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true
        }
      });
      
      console.log('\n👥 Existing users:');
      existingUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
      });
      
      return;
    }

    console.log('🔧 Creating initial users...');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create admin user (you)
    console.log('👑 Creating admin user...');
    const adminUser = await prisma.user.create({
      data: {
        name: 'Micky Blenk',
        email: 'mickyblenk@gmail.com',
        password: hashedPassword,
        role: 'admin',
        company: 'DarkSpace Software & Security',
        isActive: true,
        loginAttempts: 0,
        lastLogin: new Date()
      }
    });
    console.log(`   ✅ Created admin: ${adminUser.name} (${adminUser.email})`);

    // Create backup admin
    console.log('🛡️ Creating backup admin...');
    const backupAdmin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@liftplannerpro.org',
        password: hashedPassword,
        role: 'admin',
        company: 'Lift Planner Pro',
        isActive: true,
        loginAttempts: 0,
        lastLogin: new Date()
      }
    });
    console.log(`   ✅ Created backup admin: ${backupAdmin.name} (${backupAdmin.email})`);

    // Create some demo users
    console.log('👤 Creating demo users...');
    
    const demoUsers = [
      {
        name: 'John Smith',
        email: 'john.smith@company.com',
        company: 'Construction Corp',
        role: 'user'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@engineering.com',
        company: 'Engineering Solutions',
        role: 'user'
      },
      {
        name: 'Mike Wilson',
        email: 'mike.wilson@lifting.com',
        company: 'Lifting Specialists',
        role: 'user'
      },
      {
        name: 'Emma Davis',
        email: 'emma.davis@safety.com',
        company: 'Safety First Ltd',
        role: 'user'
      },
      {
        name: 'David Brown',
        email: 'david.brown@crane.com',
        company: 'Crane Operations',
        role: 'user'
      }
    ];

    for (const userData of demoUsers) {
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          company: userData.company,
          isActive: true,
          loginAttempts: 0,
          lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random last login within 30 days
        }
      });
      console.log(`   ✅ Created user: ${user.name} (${user.email})`);
    }

    // Final count
    const finalUserCount = await prisma.user.count();
    console.log(`\n📊 Total users created: ${finalUserCount}`);

    console.log('\n🎯 Initial users created successfully!');
    console.log('\n📋 Login credentials for testing:');
    console.log('   Admin: mickyblenk@gmail.com / password123');
    console.log('   Backup Admin: admin@liftplannerpro.org / password123');
    console.log('   Demo Users: [any demo email] / password123');
    
    console.log('\n🔧 Next steps:');
    console.log('   1. Go to https://liftplannerpro.org/admin');
    console.log('   2. Login with mickyblenk@gmail.com / password123');
    console.log('   3. Check User Management tab - should now show users!');

  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    
    if (error.code === 'P2002') {
      console.log('\n🔧 Unique constraint violation - user already exists');
      console.log('   This is normal if users were already created');
    } else if (error.message.includes('password authentication failed')) {
      console.log('\n🔧 Authentication failed');
      console.log('   Check PostgreSQL password is: syntex82');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Connection refused');
      console.log('   Ensure PostgreSQL service is running');
    }
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  }
}

createInitialUsers().catch(console.error);
