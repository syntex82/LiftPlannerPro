const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Lift Planner Pro - System Status Check\n');

function checkSystemStatus() {
  const checks = {
    'Production Build': {
      check: () => fs.existsSync('.next'),
      fix: 'Run: npm run build:prod'
    },
    'Environment Configuration': {
      check: () => fs.existsSync('.env.production'),
      fix: 'Environment file exists but check domain configuration'
    },
    'Database': {
      check: () => fs.existsSync('storage/production.db'),
      fix: 'Run: npm run db:migrate:prod'
    },
    'Storage Directories': {
      check: () => fs.existsSync('storage'),
      fix: 'Run: npm run setup:storage'
    },
    'Node Modules': {
      check: () => fs.existsSync('node_modules'),
      fix: 'Run: npm install'
    },
    'Prisma Client': {
      check: () => fs.existsSync('node_modules/@prisma/client'),
      fix: 'Run: npx prisma generate'
    }
  };

  console.log('📋 System Status Report');
  console.log('=' .repeat(50));

  let allGood = true;
  Object.entries(checks).forEach(([name, { check, fix }]) => {
    const status = check();
    const icon = status ? '✅' : '❌';
    console.log(`${icon} ${name}: ${status ? 'OK' : 'MISSING'}`);
    
    if (!status) {
      console.log(`   Fix: ${fix}`);
      allGood = false;
    }
  });

  return allGood;
}

function checkDatabaseUsers() {
  console.log('\n👥 Database Users');
  console.log('=' .repeat(30));

  try {
    require('dotenv').config({ path: '.env.local' });
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscription: true,
        createdAt: true
      }
    }).then(users => {
      if (users.length === 0) {
        console.log('❌ No users found in database');
        console.log('   Fix: Run node scripts/create-admin.js');
      } else {
        console.log(`✅ Found ${users.length} users:`);
        users.forEach(user => {
          console.log(`   • ${user.name} (${user.email}) - ${user.role}/${user.subscription}`);
        });
      }
      prisma.$disconnect();
    }).catch(error => {
      console.log('❌ Database connection failed:', error.message);
      console.log('   Fix: Check database configuration');
    });

  } catch (error) {
    console.log('❌ Database check failed:', error.message);
  }
}

function checkStorageUsage() {
  console.log('\n💾 Storage Usage');
  console.log('=' .repeat(25));

  const storageDir = './storage';
  if (!fs.existsSync(storageDir)) {
    console.log('❌ Storage directory not found');
    return;
  }

  const subdirs = ['uploads', 'cad-files', 'exports', 'backups', 'user-projects', 'temp', 'logs'];
  
  subdirs.forEach(subdir => {
    const dirPath = path.join(storageDir, subdir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      let totalSize = 0;
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isFile()) {
          totalSize += fs.statSync(filePath).size;
        }
      });
      
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      console.log(`📁 ${subdir}: ${files.length} files, ${sizeMB} MB`);
    } else {
      console.log(`❌ ${subdir}: Directory missing`);
    }
  });
}

function checkEnvironmentVariables() {
  console.log('\n⚙️ Environment Configuration');
  console.log('=' .repeat(35));

  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'OPENAI_API_KEY'
  ];

  require('dotenv').config({ path: '.env.production' });

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value && !value.includes('your-') && !value.includes('change-this')) {
      console.log(`✅ ${varName}: Configured`);
    } else {
      console.log(`❌ ${varName}: Missing or placeholder`);
    }
  });

  // Check domain configuration
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl && nextAuthUrl.includes('your-domain.ddns.net')) {
    console.log('⚠️  NEXTAUTH_URL still contains placeholder domain');
    console.log('   Update with your actual NoIP domain');
  }
}

function checkNetworkConfiguration() {
  console.log('\n🌐 Network Configuration');
  console.log('=' .repeat(30));

  try {
    // Check if port 3000 is available
    const { execSync } = require('child_process');
    
    try {
      const result = execSync('netstat -ano | findstr :3000', { encoding: 'utf8' });
      if (result.trim()) {
        console.log('⚠️  Port 3000 is currently in use');
        console.log('   Stop existing server or use different port');
      } else {
        console.log('✅ Port 3000 is available');
      }
    } catch (error) {
      console.log('✅ Port 3000 is available');
    }

    // Check local IP
    try {
      const ipResult = execSync('ipconfig | findstr IPv4', { encoding: 'utf8' });
      const ipMatch = ipResult.match(/(\d+\.\d+\.\d+\.\d+)/);
      if (ipMatch) {
        console.log(`📍 Local IP: ${ipMatch[1]}`);
        console.log(`   Network access: http://${ipMatch[1]}:3000`);
      }
    } catch (error) {
      console.log('⚠️  Could not determine local IP');
    }

  } catch (error) {
    console.log('❌ Network check failed:', error.message);
  }
}

function displaySummary(systemOK) {
  console.log('\n🎯 Production Readiness Summary');
  console.log('=' .repeat(40));

  if (systemOK) {
    console.log('✅ System is ready for production!');
    console.log('');
    console.log('🚀 To start the server:');
    console.log('   • Windows: Double-click start-production.bat');
    console.log('   • Command: node scripts/start-production.js');
    console.log('   • NPM: npm run start:prod');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('   1. Update domain in .env.production');
    console.log('   2. Configure router port forwarding');
    console.log('   3. Set up NoIP dynamic DNS');
    console.log('   4. Start the production server');
  } else {
    console.log('❌ System needs configuration before production');
    console.log('');
    console.log('🔧 Run the fixes shown above, then:');
    console.log('   node scripts/system-status.js');
  }
}

// Main execution
async function main() {
  const systemOK = checkSystemStatus();
  checkDatabaseUsers();
  checkStorageUsage();
  checkEnvironmentVariables();
  checkNetworkConfiguration();
  displaySummary(systemOK);
}

main().catch(console.error);
