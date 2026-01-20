const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Lift Planner Pro in Production Mode...\n');

function checkProductionReadiness() {
  console.log('🔍 Checking production readiness...');
  
  const checks = [
    { name: 'Production build', path: '.next', type: 'directory' },
    { name: 'Production environment', path: '.env.production', type: 'file' },
    { name: 'Database', path: './storage/production.db', type: 'file' },
    { name: 'Storage directories', path: 'storage', type: 'directory' },
  ];
  
  let allChecksPass = true;
  
  checks.forEach(check => {
    if (fs.existsSync(check.path)) {
      console.log(`✅ ${check.name}: Ready`);
    } else {
      console.log(`❌ ${check.name}: Missing`);
      allChecksPass = false;
    }
  });
  
  if (!allChecksPass) {
    console.log('\n❌ Production readiness check failed!');
    console.log('Please run the following commands:');
    console.log('1. npm run build:prod');
    console.log('2. npm run db:migrate:prod');
    console.log('3. npm run setup:storage');
    process.exit(1);
  }
  
  console.log('✅ All production checks passed!\n');
}

function displayStartupInfo() {
  console.log('🏗️  Lift Planner Pro - Production Server');
  console.log('=' .repeat(50));
  console.log('🌐 Server will be available at:');
  console.log('   • Local: http://localhost:3000');
  console.log('   • Network: http://your-ip-address:3000');
  console.log('   • External: http://your-domain.ddns.net:3000');
  console.log('');
  console.log('📋 Admin Credentials:');
  console.log('   • Email: mickyblenk@gmail.com');
  console.log('   • Password: admin123');
  console.log('');
  console.log('🔧 Production Features:');
  console.log('   ✅ SQLite Database');
  console.log('   ✅ File Storage System');
  console.log('   ✅ Stripe Live Payments');
  console.log('   ✅ OpenAI Integration');
  console.log('   ✅ Security Middleware');
  console.log('   ✅ Rate Limiting');
  console.log('   ✅ Automatic Backups');
  console.log('');
  console.log('⚠️  IMPORTANT SETUP STEPS:');
  console.log('1. Update .env.production with your NoIP domain');
  console.log('2. Configure port forwarding (port 3000)');
  console.log('3. Set up NoIP dynamic DNS');
  console.log('4. Change admin password after first login');
  console.log('');
  console.log('🔄 Starting server...\n');
}

function startProductionServer() {
  // Copy production environment
  if (fs.existsSync('.env.production')) {
    fs.copyFileSync('.env.production', '.env.local');
    console.log('📋 Using production environment');
  }
  
  // Start the Next.js production server
  const serverProcess = spawn('npm', ['run', 'start:prod'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '3000'
    }
  });
  
  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
  
  serverProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Server exited with code ${code}`);
      process.exit(code);
    }
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill('SIGTERM');
    process.exit(0);
  });
}

function scheduleBackups() {
  console.log('⏰ Scheduling automatic backups...');
  
  // Schedule backup every 24 hours
  setInterval(() => {
    console.log('💾 Running scheduled backup...');
    const { spawn } = require('child_process');
    
    const backupProcess = spawn('node', ['scripts/backup-database.js', 'now'], {
      stdio: 'inherit',
      shell: true
    });
    
    backupProcess.on('exit', (code) => {
      if (code === 0) {
        console.log('✅ Scheduled backup completed');
      } else {
        console.error('❌ Scheduled backup failed');
      }
    });
    
  }, 24 * 60 * 60 * 1000); // 24 hours
}

// Main execution
async function main() {
  try {
    displayStartupInfo();
    checkProductionReadiness();
    scheduleBackups();
    startProductionServer();
    
  } catch (error) {
    console.error('❌ Production startup failed:', error);
    process.exit(1);
  }
}

main();
