// Production Configuration for Lift Planner Pro
export const productionConfig = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0', // Allow external connections
    nodeEnv: process.env.NODE_ENV || 'production',
  },

  // Security Configuration
  security: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://your-domain.ddns.net:3000'
    ],
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    sessionSecret: process.env.NEXTAUTH_SECRET,
    cookieSecure: process.env.NODE_ENV === 'production',
    cookieSameSite: 'lax' as const,
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
    maxConnections: 20,
    connectionTimeout: 30000,
    queryTimeout: 60000,
  },

  // File Storage Configuration
  storage: {
    maxFileSize: process.env.MAX_FILE_SIZE || '50MB',
    allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.dwg', '.dxf', '.svg', '.json'],
    userStorageLimit: '1GB',
    tempFileCleanupHours: 24,
    backupRetentionDays: 90,
  },

  // External Services
  services: {
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      maxTokens: 4000,
      model: 'gpt-3.5-turbo',
    },
  },

  // Performance Configuration
  performance: {
    enableCompression: true,
    enableCaching: true,
    cacheMaxAge: 3600, // 1 hour
    staticFileMaxAge: 86400, // 24 hours
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableFileLogging: true,
    logRetentionDays: 30,
    enableErrorReporting: true,
  },

  // Backup Configuration
  backup: {
    enableAutoBackup: true,
    backupInterval: '0 2 * * *', // Daily at 2 AM
    maxBackupFiles: 30,
    compressionEnabled: true,
  },

  // Feature Flags
  features: {
    enableAI: true,
    enableFileUploads: true,
    enableExports: true,
    enableCollaboration: true,
    maintenanceMode: false,
  },
};

export default productionConfig;
