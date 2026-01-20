import fs from 'fs';
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
        console.log(`Cleaned up temp file: ${file}`);
      }
    });
  }
}

export default FileManager;
