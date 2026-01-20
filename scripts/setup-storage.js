const fs = require('fs');
const path = require('path');

console.log('📁 Setting up Production File Storage System...\n');

// Storage directories configuration
const storageConfig = {
  baseDir: './storage',
  directories: {
    uploads: './storage/uploads',
    cadFiles: './storage/cad-files',
    exports: './storage/exports',
    backups: './storage/backups',
    temp: './storage/temp',
    userProjects: './storage/user-projects',
    templates: './storage/templates',
    logs: './storage/logs'
  },
  subdirectories: {
    uploads: ['images', 'documents', 'avatars'],
    cadFiles: ['drawings', 'projects', 'libraries'],
    exports: ['pdf', 'html', 'json', 'cad'],
    userProjects: ['active', 'archived', 'shared'],
    templates: ['cad', 'rams', 'step-plans']
  }
};

function createStorageDirectories() {
  console.log('📂 Creating storage directories...');
  
  // Create base storage directory
  if (!fs.existsSync(storageConfig.baseDir)) {
    fs.mkdirSync(storageConfig.baseDir, { recursive: true });
    console.log(`✅ Created: ${storageConfig.baseDir}`);
  }
  
  // Create main directories
  Object.entries(storageConfig.directories).forEach(([name, dirPath]) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created: ${dirPath}`);
    }
    
    // Create subdirectories
    if (storageConfig.subdirectories[name]) {
      storageConfig.subdirectories[name].forEach(subDir => {
        const subDirPath = path.join(dirPath, subDir);
        if (!fs.existsSync(subDirPath)) {
          fs.mkdirSync(subDirPath, { recursive: true });
          console.log(`✅ Created: ${subDirPath}`);
        }
      });
    }
  });
}

function createStorageConfig() {
  console.log('⚙️ Creating storage configuration...');
  
  const config = `// Storage Configuration for Production
export const storageConfig = {
  // Base directories
  UPLOAD_DIR: process.env.UPLOAD_DIR || './storage/uploads',
  CAD_FILES_DIR: process.env.CAD_FILES_DIR || './storage/cad-files',
  EXPORTS_DIR: process.env.EXPORTS_DIR || './storage/exports',
  BACKUPS_DIR: './storage/backups',
  TEMP_DIR: './storage/temp',
  USER_PROJECTS_DIR: './storage/user-projects',
  TEMPLATES_DIR: './storage/templates',
  LOGS_DIR: './storage/logs',
  
  // File size limits
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '50MB',
  MAX_CAD_FILE_SIZE: '100MB',
  MAX_EXPORT_SIZE: '200MB',
  
  // Allowed file types
  ALLOWED_IMAGE_TYPES: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  ALLOWED_CAD_TYPES: ['.dwg', '.dxf', '.svg', '.json'],
  ALLOWED_DOCUMENT_TYPES: ['.pdf', '.doc', '.docx', '.txt'],
  
  // Storage limits per user
  USER_STORAGE_LIMIT: '1GB',
  PROJECT_LIMIT_PER_USER: 100,
  
  // Cleanup settings
  TEMP_FILE_CLEANUP_HOURS: 24,
  LOG_RETENTION_DAYS: 30,
  BACKUP_RETENTION_DAYS: 90
};

export default storageConfig;
`;

  fs.writeFileSync('lib/storage-config.ts', config);
  console.log('✅ Storage configuration created: lib/storage-config.ts');
}

function createFileManager() {
  console.log('🔧 Creating file manager utility...');
  
  const fileManager = `import fs from 'fs';
import path from 'path';
import { storageConfig } from './storage-config';

export class FileManager {
  static ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  static getUserProjectDir(userId: string): string {
    const userDir = path.join(storageConfig.USER_PROJECTS_DIR, userId);
    this.ensureDirectory(userDir);
    return userDir;
  }

  static saveUserFile(userId: string, fileName: string, content: Buffer | string): string {
    const userDir = this.getUserProjectDir(userId);
    const filePath = path.join(userDir, fileName);
    
    if (typeof content === 'string') {
      fs.writeFileSync(filePath, content, 'utf8');
    } else {
      fs.writeFileSync(filePath, content);
    }
    
    return filePath;
  }

  static getUserFiles(userId: string): string[] {
    const userDir = this.getUserProjectDir(userId);
    if (!fs.existsSync(userDir)) return [];
    
    return fs.readdirSync(userDir).filter(file => 
      !file.startsWith('.') && fs.statSync(path.join(userDir, file)).isFile()
    );
  }

  static deleteUserFile(userId: string, fileName: string): boolean {
    const filePath = path.join(this.getUserProjectDir(userId), fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  static getFileSize(filePath: string): number {
    if (fs.existsSync(filePath)) {
      return fs.statSync(filePath).size;
    }
    return 0;
  }

  static getUserStorageUsage(userId: string): number {
    const userDir = this.getUserProjectDir(userId);
    if (!fs.existsSync(userDir)) return 0;
    
    let totalSize = 0;
    const files = fs.readdirSync(userDir);
    
    files.forEach(file => {
      const filePath = path.join(userDir, file);
      if (fs.statSync(filePath).isFile()) {
        totalSize += fs.statSync(filePath).size;
      }
    });
    
    return totalSize;
  }

  static cleanupTempFiles(): void {
    const tempDir = storageConfig.TEMP_DIR;
    if (!fs.existsSync(tempDir)) return;
    
    const cutoffTime = Date.now() - (storageConfig.TEMP_FILE_CLEANUP_HOURS * 60 * 60 * 1000);
    
    fs.readdirSync(tempDir).forEach(file => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < cutoffTime) {
        fs.unlinkSync(filePath);
        console.log(\`Cleaned up temp file: \${file}\`);
      }
    });
  }
}

export default FileManager;
`;

  fs.writeFileSync('lib/file-manager.ts', fileManager);
  console.log('✅ File manager created: lib/file-manager.ts');
}

function createGitignoreEntries() {
  console.log('🔒 Updating .gitignore for storage directories...');
  
  const gitignoreEntries = `
# Production Storage (DO NOT COMMIT)
/storage/
!/storage/.gitkeep
/uploads/
/exports/
/backups/
*.log
.env.production
`;

  // Add to .gitignore if it exists, create if it doesn't
  const gitignorePath = '.gitignore';
  let gitignoreContent = '';
  
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  }
  
  if (!gitignoreContent.includes('/storage/')) {
    fs.appendFileSync(gitignorePath, gitignoreEntries);
    console.log('✅ Updated .gitignore with storage directories');
  }
}

function createStorageKeepFiles() {
  console.log('📝 Creating .gitkeep files...');
  
  Object.values(storageConfig.directories).forEach(dirPath => {
    const keepFile = path.join(dirPath, '.gitkeep');
    if (!fs.existsSync(keepFile)) {
      fs.writeFileSync(keepFile, '# Keep this directory in git\n');
    }
  });
  
  console.log('✅ Created .gitkeep files');
}

async function setupStorage() {
  console.log('🏗️  Lift Planner Pro - Production Storage Setup');
  console.log('=' .repeat(50));
  
  createStorageDirectories();
  createStorageConfig();
  createFileManager();
  createGitignoreEntries();
  createStorageKeepFiles();
  
  console.log('\n🎉 Production storage setup completed!');
  console.log('\n📋 Storage Structure Created:');
  console.log('├── storage/');
  console.log('│   ├── uploads/ (user uploads)');
  console.log('│   ├── cad-files/ (CAD drawings)');
  console.log('│   ├── exports/ (PDF/HTML exports)');
  console.log('│   ├── backups/ (database backups)');
  console.log('│   ├── temp/ (temporary files)');
  console.log('│   ├── user-projects/ (user data)');
  console.log('│   ├── templates/ (system templates)');
  console.log('│   └── logs/ (application logs)');
  console.log('\n⚠️  Storage directories are excluded from git for security');
}

setupStorage().catch(console.error);
