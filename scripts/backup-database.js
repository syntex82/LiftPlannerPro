const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('💾 Starting Database Backup...\n');

function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = './storage/backups';
    const backupFile = path.join(backupDir, `liftplanner_backup_${timestamp}.sql`);
    
    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log('📊 Creating database backup...');
    
    // Create PostgreSQL backup
    const dbUrl = process.env.DATABASE_URL || 'postgresql://liftplanner:secure_production_password_2024@localhost:5432/liftplanner_production';
    
    // Extract connection details from URL
    const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!urlParts) {
      throw new Error('Invalid DATABASE_URL format');
    }
    
    const [, username, password, host, port, database] = urlParts;
    
    // Set environment variable for password
    process.env.PGPASSWORD = password;
    
    // Create backup using pg_dump
    const command = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f "${backupFile}" --verbose`;
    
    console.log('🔄 Running backup command...');
    execSync(command, { stdio: 'inherit' });
    
    // Compress backup
    console.log('🗜️ Compressing backup...');
    const compressedFile = `${backupFile}.gz`;
    execSync(`gzip "${backupFile}"`, { stdio: 'inherit' });
    
    // Get file size
    const stats = fs.statSync(compressedFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ Backup completed successfully!`);
    console.log(`📁 File: ${compressedFile}`);
    console.log(`📏 Size: ${fileSizeMB} MB`);
    
    // Clean up old backups (keep last 30)
    cleanupOldBackups(backupDir);
    
    return compressedFile;
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

function cleanupOldBackups(backupDir) {
  try {
    console.log('🧹 Cleaning up old backups...');
    
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('liftplanner_backup_') && file.endsWith('.sql.gz'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        mtime: fs.statSync(path.join(backupDir, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);
    
    // Keep only the latest 30 backups
    const filesToDelete = files.slice(30);
    
    filesToDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`🗑️ Deleted old backup: ${file.name}`);
    });
    
    console.log(`✅ Cleanup completed. Keeping ${Math.min(files.length, 30)} backups.`);
    
  } catch (error) {
    console.error('⚠️ Cleanup warning:', error.message);
  }
}

function scheduleBackups() {
  console.log('⏰ Setting up automatic backups...');
  
  const cron = require('node-cron');
  
  // Schedule daily backup at 2 AM
  cron.schedule('0 2 * * *', () => {
    console.log('🕐 Running scheduled backup...');
    createBackup();
  });
  
  console.log('✅ Automatic backups scheduled for 2:00 AM daily');
}

// Main execution
if (require.main === module) {
  // Load environment variables
  require('dotenv').config({ path: '.env.production' });
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'schedule':
      scheduleBackups();
      break;
    case 'now':
    default:
      createBackup();
      break;
  }
}

module.exports = { createBackup, cleanupOldBackups, scheduleBackups };
