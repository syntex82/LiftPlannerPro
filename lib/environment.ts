/**
 * Environment detection and configuration utilities
 */

export const getEnvironment = () => {
  return process.env.NODE_ENV || 'development'
}

export const isDevelopment = () => {
  return getEnvironment() === 'development'
}

export const isProduction = () => {
  return getEnvironment() === 'production'
}

export const getBaseUrl = () => {
  // In production, always use the production URL
  if (isProduction()) {
    return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://liftplannerpro.org'
  }

  // In development, check for environment variable first
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // Fallback for development
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return 'http://localhost:3000'
}

export const getApiUrl = (path: string = '') => {
  const baseUrl = getBaseUrl()
  return `${baseUrl}/api${path}`
}

export const getAuthUrl = (path: string = '') => {
  const baseUrl = getBaseUrl()
  return `${baseUrl}/auth${path}`
}

export const getRedirectUrl = (path: string = '/') => {
  const baseUrl = getBaseUrl()
  
  // Ensure path starts with /
  if (!path.startsWith('/')) {
    path = `/${path}`
  }
  
  return `${baseUrl}${path}`
}

export const logEnvironmentInfo = () => {
  console.log('Environment Info:', {
    NODE_ENV: getEnvironment(),
    isDevelopment: isDevelopment(),
    isProduction: isProduction(),
    baseUrl: getBaseUrl(),
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  })
}

// Environment-specific configurations
export const getConfig = () => {
  const env = getEnvironment()
  
  const configs = {
    development: {
      baseUrl: 'http://localhost:3000',
      httpsPort: 3443,
      httpPort: 3080,
      logLevel: 'debug',
      enableDebug: true,
      enableAnalytics: false,
      enableErrorReporting: false
    },
    production: {
      baseUrl: 'https://liftplannerpro.org',
      httpsPort: 443,
      httpPort: 80,
      logLevel: 'error',
      enableDebug: false,
      enableAnalytics: true,
      enableErrorReporting: true
    }
  }
  
  return configs[env as keyof typeof configs] || configs.development
}
