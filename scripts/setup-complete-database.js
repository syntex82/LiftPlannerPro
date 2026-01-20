const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

console.log('🚀 Setting Up Complete Database for Lift Planner Pro\n');
console.log('📋 Database: PostgreSQL');
console.log('🔑 Password: syntex82');
console.log('🏭 Environment: Production\n');

async function setupCompleteDatabase() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres:syntex82@localhost:5432/liftplannerpro_prod'
      }
    }
  });

  try {
    console.log('🔍 Connecting to PostgreSQL database...');
    await prisma.$connect();
    console.log('✅ Connected to production database');

    // Test database connection
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 PostgreSQL version:', result[0].version.split(' ')[0] + ' ' + result[0].version.split(' ')[1]);

    console.log('\n🔧 Setting up database schema...');

    // 1. USERS SETUP
    console.log('\n👥 Setting up users...');
    const existingUsers = await prisma.user.count();
    
    if (existingUsers === 0) {
      const hashedPassword = await bcrypt.hash('syntex82', 12);
      
      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          name: 'Micky Blenk',
          email: 'mickyblenk@gmail.com',
          password: hashedPassword,
          role: 'admin',
          company: 'DarkSpace Software & Security',
          subscription: 'enterprise',
          isActive: true,
          loginAttempts: 0,
          lastLogin: new Date()
        }
      });
      console.log(`   ✅ Admin user created: ${adminUser.email}`);

      // Create demo users
      const demoUsers = [
        { name: 'John Smith', email: 'john.smith@company.com', company: 'Construction Corp' },
        { name: 'Sarah Johnson', email: 'sarah.johnson@engineering.com', company: 'Engineering Solutions' },
        { name: 'Mike Wilson', email: 'mike.wilson@lifting.com', company: 'Lifting Specialists' },
        { name: 'Emma Davis', email: 'emma.davis@safety.com', company: 'Safety First Ltd' }
      ];

      for (const userData of demoUsers) {
        await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: 'user',
            company: userData.company,
            subscription: 'free',
            isActive: true,
            loginAttempts: 0,
            lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          }
        });
      }
      console.log(`   ✅ Created ${demoUsers.length} demo users`);
    } else {
      console.log(`   ✅ Users already exist: ${existingUsers} users`);
    }

    // 2. SYSTEM CONFIGURATION
    console.log('\n⚙️ Setting up system configuration...');
    
    // Firewall configuration
    const firewallConfig = await prisma.systemConfig.upsert({
      where: { key: 'firewall_config' },
      update: {},
      create: {
        key: 'firewall_config',
        value: JSON.stringify({
          standardRulesApplied: true,
          customRulesApplied: false,
          activeRules: [
            {
              id: 'waf-001',
              name: 'SQL Injection Protection',
              type: 'WAF',
              enabled: true,
              description: 'Blocks SQL injection attempts'
            },
            {
              id: 'waf-002', 
              name: 'XSS Protection',
              type: 'WAF',
              enabled: true,
              description: 'Prevents cross-site scripting attacks'
            },
            {
              id: 'net-001',
              name: 'Rate Limiting',
              type: 'Network',
              enabled: true,
              description: 'Limits request rate per IP'
            }
          ],
          lastUpdated: new Date().toISOString()
        })
      }
    });
    console.log('   ✅ Firewall configuration created');

    // Security settings
    await prisma.systemConfig.upsert({
      where: { key: 'security_settings' },
      update: {},
      create: {
        key: 'security_settings',
        value: JSON.stringify({
          passwordMinLength: 8,
          requireSpecialChars: true,
          sessionTimeout: 3600,
          maxLoginAttempts: 5,
          lockoutDuration: 900,
          enableTwoFactor: false,
          auditLogging: true
        })
      }
    });
    console.log('   ✅ Security settings configured');

    // Application settings
    await prisma.systemConfig.upsert({
      where: { key: 'app_settings' },
      update: {},
      create: {
        key: 'app_settings',
        value: JSON.stringify({
          appName: 'Lift Planner Pro',
          version: '1.0.0',
          maintenanceMode: false,
          registrationEnabled: true,
          maxProjectsPerUser: 100,
          maxFileSize: 50,
          supportedFileTypes: ['pdf', 'dwg', 'jpg', 'png', 'doc', 'docx']
        })
      }
    });
    console.log('   ✅ Application settings configured');

    // 3. DEMO PROJECTS
    console.log('\n📁 Setting up demo projects...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'mickyblenk@gmail.com' }
    });

    if (adminUser) {
      const existingProjects = await prisma.project.count({
        where: { userId: adminUser.id }
      });

      if (existingProjects === 0) {
        const demoProjects = [
          {
            name: 'Bridge Construction Lift Plan',
            description: 'Comprehensive lifting plan for bridge beam installation using 500-ton crane'
          },
          {
            name: 'Industrial Equipment Installation',
            description: 'Multi-crane lift plan for heavy machinery installation in manufacturing facility'
          },
          {
            name: 'Wind Turbine Assembly',
            description: 'Specialized lifting procedures for wind turbine nacelle and blade installation'
          }
        ];

        for (const projectData of demoProjects) {
          await prisma.project.create({
            data: {
              name: projectData.name,
              description: projectData.description,
              userId: adminUser.id
            }
          });
        }
        console.log(`   ✅ Created ${demoProjects.length} demo projects`);
      } else {
        console.log(`   ✅ Projects already exist: ${existingProjects} projects`);
      }
    }

    // 4. RIGGING EQUIPMENT
    console.log('\n🏗️ Setting up rigging equipment...');
    const existingEquipment = await prisma.riggingEquipment.count();
    
    if (existingEquipment === 0) {
      const equipment = [
        {
          equipmentNumber: 'SL-001',
          type: 'Sling',
          category: 'Lifting',
          manufacturer: 'Lifting Solutions Ltd',
          workingLoadLimit: 2.5,
          status: 'IN_SERVICE',
          location: 'Warehouse A',
          condition: 5,
          userId: adminUser.id
        },
        {
          equipmentNumber: 'SH-001',
          type: 'Shackle',
          category: 'Hardware',
          manufacturer: 'Safety First Equipment',
          workingLoadLimit: 8.5,
          status: 'IN_SERVICE',
          location: 'Warehouse A',
          condition: 5,
          userId: adminUser.id
        },
        {
          equipmentNumber: 'CB-001',
          type: 'Chain Block',
          category: 'Hoisting',
          manufacturer: 'Heavy Lift Corp',
          workingLoadLimit: 5.0,
          status: 'IN_SERVICE',
          location: 'Workshop B',
          condition: 4,
          userId: adminUser.id
        }
      ];

      for (const equipData of equipment) {
        await prisma.riggingEquipment.create({
          data: {
            ...equipData,
            nextInspection: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
            certificationExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
          }
        });
      }
      console.log(`   ✅ Created ${equipment.length} rigging equipment items`);
    } else {
      console.log(`   ✅ Equipment already exists: ${existingEquipment} items`);
    }

    // 5. SECURITY LOGS
    console.log('\n🔒 Setting up security logging...');
    const existingLogs = await prisma.securityLog.count();
    
    if (existingLogs === 0) {
      // Create some sample security logs
      const securityLogs = [
        {
          userId: adminUser?.id,
          action: 'login',
          resource: 'authentication',
          details: 'Admin user successful login',
          ipAddress: '192.168.1.191',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          success: true,
          riskLevel: 'LOW'
        },
        {
          userId: adminUser?.id,
          action: 'system_change',
          resource: 'firewall_config',
          details: 'Firewall rules updated',
          ipAddress: '192.168.1.191',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          success: true,
          riskLevel: 'MEDIUM'
        }
      ];

      for (const logData of securityLogs) {
        await prisma.securityLog.create({
          data: logData
        });
      }
      console.log(`   ✅ Created ${securityLogs.length} security log entries`);
    } else {
      console.log(`   ✅ Security logs already exist: ${existingLogs} entries`);
    }

    // 6. VERIFICATION
    console.log('\n🔍 Verifying database setup...');
    
    const counts = {
      users: await prisma.user.count(),
      projects: await prisma.project.count(),
      equipment: await prisma.riggingEquipment.count(),
      configs: await prisma.systemConfig.count(),
      securityLogs: await prisma.securityLog.count()
    };

    console.log('📊 Database Statistics:');
    console.log(`   👥 Users: ${counts.users}`);
    console.log(`   📁 Projects: ${counts.projects}`);
    console.log(`   🏗️ Equipment: ${counts.equipment}`);
    console.log(`   ⚙️ Configurations: ${counts.configs}`);
    console.log(`   🔒 Security Logs: ${counts.securityLogs}`);

    console.log('\n✅ Complete database setup finished successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   🔑 Admin: mickyblenk@gmail.com / syntex82');
    console.log('   🔑 Demo Users: [any demo email] / syntex82');
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Go to: https://liftplannerpro.org');
    console.log('   2. Login with: mickyblenk@gmail.com / syntex82');
    console.log('   3. Access admin panel: https://liftplannerpro.org/admin');
    console.log('   4. All features should now work correctly!');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

setupCompleteDatabase().catch(console.error);
