const { PrismaClient } = require('@prisma/client');

console.log('🔍 Checking Users in PostgreSQL Database\n');

async function checkUsers() {
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

    // Check if User table exists
    console.log('🔍 Checking if User table exists...');
    try {
      const userCount = await prisma.user.count();
      console.log(`📊 Total users in database: ${userCount}`);

      if (userCount > 0) {
        console.log('\n👥 Users in database:');
        const users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            lastLogin: true,
            company: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.name || 'Unknown'} (${user.email})`);
          console.log(`      Role: ${user.role || 'user'}`);
          console.log(`      Status: ${user.isActive ? 'Active' : 'Inactive'}`);
          console.log(`      Company: ${user.company || 'Unknown'}`);
          console.log(`      Created: ${user.createdAt.toISOString()}`);
          console.log(`      Last Login: ${user.lastLogin ? user.lastLogin.toISOString() : 'Never'}`);
          console.log('');
        });
      } else {
        console.log('⚠️ No users found in database');
        console.log('\n🔧 This could be why User Management shows no users');
        console.log('\n📋 To fix this:');
        console.log('   1. Create a user account by signing up at https://liftplannerpro.org/auth/signup');
        console.log('   2. Or run the admin panel and add users manually');
        console.log('   3. Check if the admin panel is reading from the correct database');
      }

    } catch (tableError) {
      console.log('❌ User table does not exist or is not accessible');
      console.log('Error:', tableError.message);
      console.log('\n🔧 This means the database schema needs to be created');
      console.log('   Run: npx prisma db push');
    }

    // Check database connection info
    console.log('\n📋 Database Connection Info:');
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('   Database:', result[0].current_database);
    console.log('   User:', result[0].current_user);
    console.log('   Version:', result[0].version.split(' ')[0] + ' ' + result[0].version.split(' ')[1]);

  } catch (error) {
    console.error('❌ Error checking users:', error.message);
    
    if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n🔧 Database does not exist');
      console.log('   Run: node scripts/create-production-db.js');
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

checkUsers().catch(console.error);
