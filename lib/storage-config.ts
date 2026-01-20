// Storage Configuration for Production
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
