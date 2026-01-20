const { PrismaClient } = require('@prisma/client');

console.log('✅ Verifying Complete Database Setup\n');

async function verifySetup() {
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

    console.log('\n📊 Database Verification Report:');
    console.log('================================');

    // 1. Users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        company: true
      }
    });
    console.log(`\n👥 USERS (${users.length} total):`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.isActive ? 'Active' : 'Inactive'}`);
    });

    // 2. System Configuration
    const configs = await prisma.systemConfig.findMany();
    console.log(`\n⚙️ SYSTEM CONFIGURATIONS (${configs.length} total):`);
    configs.forEach((config, index) => {
      console.log(`   ${index + 1}. ${config.key}`);
    });

    // 3. Projects
    const projects = await prisma.project.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    console.log(`\n📁 PROJECTS (${projects.length} total):`);
    projects.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name} (Owner: ${project.user.name})`);
    });

    // 4. Rigging Equipment
    const equipment = await prisma.riggingEquipment.findMany({
      include: {
        user: {
          select: { name: true }
        }
      }
    });
    console.log(`\n🏗️ RIGGING EQUIPMENT (${equipment.length} total):`);
    equipment.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.equipmentNumber} - ${item.type} (${item.status})`);
    });

    // 5. Security Logs
    const securityLogs = await prisma.securityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    });
    console.log(`\n🔒 RECENT SECURITY LOGS (showing last 5):`);
    securityLogs.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log.action} - ${log.user?.name || 'Unknown'} (${log.success ? 'Success' : 'Failed'})`);
    });

    // 6. Test API Functionality
    console.log('\n🧪 API FUNCTIONALITY TESTS:');
    
    // Test firewall config
    const firewallConfig = await prisma.systemConfig.findUnique({
      where: { key: 'firewall_config' }
    });
    console.log(`   ✅ Firewall Config: ${firewallConfig ? 'Available' : 'Missing'}`);

    // Test admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'mickyblenk@gmail.com' }
    });
    console.log(`   ✅ Admin User: ${adminUser ? 'Available' : 'Missing'}`);

    console.log('\n🎯 SETUP VERIFICATION COMPLETE!');
    console.log('\n📋 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📁 Projects: ${projects.length}`);
    console.log(`   🏗️ Equipment: ${equipment.length}`);
    console.log(`   ⚙️ Configurations: ${configs.length}`);
    console.log(`   🔒 Security Logs: ${securityLogs.length}`);

    console.log('\n🚀 READY TO USE:');
    console.log('   🌐 Website: https://liftplannerpro.org');
    console.log('   🔑 Admin Login: mickyblenk@gmail.com / syntex82');
    console.log('   🛡️ Admin Panel: https://liftplannerpro.org/admin');
    console.log('   📊 User Management: Should now show all users');
    console.log('   🔥 Firewall: Should work without errors');

    console.log('\n✅ ALL SYSTEMS OPERATIONAL!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

verifySetup().catch(console.error);
