const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

console.log('🧪 Testing Authentication System\n');

async function testAuthSystem() {
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
    console.log('✅ Connected successfully');

    console.log('\n🧪 AUTHENTICATION SYSTEM TESTS:');
    console.log('================================');

    // Test 1: Check existing users
    console.log('\n1. 📊 Checking existing users...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        loginAttempts: true,
        lockedUntil: true,
        password: true
      }
    });

    console.log(`   Found ${users.length} users:`);
    users.forEach((user, index) => {
      const hasPassword = user.password ? '✅' : '❌';
      const isActive = user.isActive ? '✅' : '❌';
      const isLocked = user.lockedUntil && new Date(user.lockedUntil) > new Date() ? '🔒' : '🔓';
      console.log(`   ${index + 1}. ${user.email} - ${user.role} - Active:${isActive} - Password:${hasPassword} - ${isLocked}`);
    });

    // Test 2: Test password verification for admin user
    console.log('\n2. 🔑 Testing password verification...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'mickyblenk@gmail.com' }
    });

    if (adminUser && adminUser.password) {
      const isValidPassword = await bcrypt.compare('syntex82', adminUser.password);
      console.log(`   Admin password verification: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);
      
      if (!isValidPassword) {
        console.log('   🔧 Fixing admin password...');
        const hashedPassword = await bcrypt.hash('syntex82', 12);
        await prisma.user.update({
          where: { id: adminUser.id },
          data: { password: hashedPassword }
        });
        console.log('   ✅ Admin password updated');
      }
    } else {
      console.log('   ❌ Admin user not found or no password set');
    }

    // Test 3: Check for inactive users that might cause "User already exists" errors
    console.log('\n3. 👻 Checking for inactive users...');
    const inactiveUsers = await prisma.user.findMany({
      where: { isActive: false }
    });

    if (inactiveUsers.length > 0) {
      console.log(`   Found ${inactiveUsers.length} inactive users:`);
      inactiveUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - ${user.name} (Inactive since ${user.updatedAt})`);
      });
      console.log('   💡 These users can be reactivated during registration');
    } else {
      console.log('   ✅ No inactive users found');
    }

    // Test 4: Check for locked users
    console.log('\n4. 🔒 Checking for locked users...');
    const lockedUsers = await prisma.user.findMany({
      where: {
        lockedUntil: {
          gt: new Date()
        }
      }
    });

    if (lockedUsers.length > 0) {
      console.log(`   Found ${lockedUsers.length} locked users:`);
      lockedUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - Locked until ${user.lockedUntil}`);
      });
    } else {
      console.log('   ✅ No locked users found');
    }

    // Test 5: Check security logs
    console.log('\n5. 📋 Recent security logs...');
    const recentLogs = await prisma.securityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    if (recentLogs.length > 0) {
      console.log('   Recent authentication events:');
      recentLogs.forEach((log, index) => {
        const userEmail = log.user?.email || 'Unknown';
        const status = log.success ? '✅' : '❌';
        console.log(`   ${index + 1}. ${log.action} - ${userEmail} - ${status} (${log.createdAt.toISOString()})`);
      });
    } else {
      console.log('   ⚠️ No security logs found');
    }

    console.log('\n🎯 AUTHENTICATION SYSTEM STATUS:');
    console.log('================================');

    // Summary
    const activeUsers = users.filter(u => u.isActive).length;
    const usersWithPasswords = users.filter(u => u.password).length;
    const adminExists = users.some(u => u.email === 'mickyblenk@gmail.com' && u.role === 'admin');

    console.log(`✅ Total Users: ${users.length}`);
    console.log(`✅ Active Users: ${activeUsers}`);
    console.log(`✅ Users with Passwords: ${usersWithPasswords}`);
    console.log(`✅ Admin User Exists: ${adminExists ? 'Yes' : 'No'}`);
    console.log(`✅ Security Logging: ${recentLogs.length > 0 ? 'Working' : 'No logs yet'}`);

    console.log('\n🚀 READY FOR TESTING:');
    console.log('   1. Go to: https://liftplannerpro.org/auth/signin');
    console.log('   2. Login with: mickyblenk@gmail.com / syntex82');
    console.log('   3. Try registering new users at: https://liftplannerpro.org/auth/signup');
    console.log('   4. Check admin panel: https://liftplannerpro.org/admin');

    if (usersWithPasswords === users.length && adminExists) {
      console.log('\n✅ AUTHENTICATION SYSTEM IS READY!');
    } else {
      console.log('\n⚠️ AUTHENTICATION SYSTEM NEEDS ATTENTION!');
      if (usersWithPasswords < users.length) {
        console.log('   - Some users missing passwords');
      }
      if (!adminExists) {
        console.log('   - Admin user missing');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

testAuthSystem().catch(console.error);
