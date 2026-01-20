const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Database Restore Utility\n');

function listBackups() {
  const backupDir = './storage/backups';
  
  if (!fs.existsSync(backupDir)) {
    console.log('❌ No backup directory found');
    return [];
  }
  
  const backups = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('liftplanner_backup_') && file.endsWith('.sql.gz'))
    .map(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      return {
        file,
        path: filePath,
        date: stats.mtime,
        size: `${sizeMB} MB`
      };
    })
    .sort((a, b) => b.date - a.date);
  
  return backups;
}

function restoreDatabase(backupFile) {
  try {
    console.log(`🔄 Restoring database from: ${backupFile}\n`);
    
    // Check if backup file exists
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }
    
    // Extract if compressed
    let sqlFile = backupFile;
    if (backupFile.endsWith('.gz')) {
      console.log('📦 Extracting compressed backup...');
      sqlFile = backupFile.replace('.gz', '');
      execSync(`gunzip -c "${backupFile}" > "${sqlFile}"`, { stdio: 'inherit' });
    }
    
    const dbUrl = process.env.DATABASE_URL || 'postgresql://liftplanner:secure_production_password_2024@localhost:5432/liftplanner_production';
    
    // Extract connection details
    const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!urlParts) {
      throw new Error('Invalid DATABASE_URL format');
    }
    
    const [, username, password, host, port, database] = urlParts;
    
    // Set environment variable for password
    process.env.PGPASSWORD = password;
    
    // Confirm restore
    console.log('⚠️  WARNING: This will completely replace the current database!');
    console.log(`Database: ${database}`);
    console.log(`Backup: ${path.basename(backupFile)}`);
    
    // In production, you might want to add a confirmation prompt
    // For now, we'll proceed automatically
    
    console.log('🗑️ Dropping existing database...');
    try {
      execSync(`dropdb -h ${host} -p ${port} -U ${username} ${database}`, { stdio: 'pipe' });
    } catch (error) {
      console.log('⚠️ Database might not exist, continuing...');
    }
    
    console.log('🆕 Creating new database...');
    execSync(`createdb -h ${host} -p ${port} -U ${username} ${database}`, { stdio: 'inherit' });
    
    console.log('📊 Restoring data...');
    execSync(`psql -h ${host} -p ${port} -U ${username} -d ${database} -f "${sqlFile}"`, { stdio: 'inherit' });
    
    // Clean up extracted file if it was compressed
    if (backupFile.endsWith('.gz') && fs.existsSync(sqlFile)) {
      fs.unlinkSync(sqlFile);
    }
    
    console.log('✅ Database restore completed successfully!');
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
  }
}

function showBackupList() {
  console.log('📋 Available Backups:\n');
  
  const backups = listBackups();
  
  if (backups.length === 0) {
    console.log('No backups found.');
    return;
  }
  
  backups.forEach((backup, index) => {
    console.log(`${index + 1}. ${backup.file}`);
    console.log(`   Date: ${backup.date.toLocaleString()}`);
    console.log(`   Size: ${backup.size}`);
    console.log('');
  });
}

// Main execution
if (require.main === module) {
  // Load environment variables
  require('dotenv').config({ path: '.env.production' });
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'list':
      showBackupList();
      break;
      
    case 'restore':
      const backupFile = args[1];
      if (!backupFile) {
        console.log('❌ Please specify a backup file');
        console.log('Usage: npm run restore:db restore <backup-file>');
        console.log('       npm run restore:db list');
        process.exit(1);
      }
      restoreDatabase(backupFile);
      break;
      
    default:
      console.log('Database Restore Utility');
      console.log('Usage:');
      console.log('  npm run restore:db list          - List available backups');
      console.log('  npm run restore:db restore <file> - Restore from backup file');
      break;
  }
}

module.exports = { restoreDatabase, listBackups, showBackupList };
