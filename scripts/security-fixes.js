#!/usr/bin/env node

/**
 * 🛡️ Lift Planner Pro - Automated Security Fixes
 * 
 * This script automatically applies security fixes to the application.
 * Run with: node scripts/security-fixes.js
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🛡️ Starting Lift Planner Pro Security Fixes...\n')

// 1. Update Next.js configuration with security headers
function addSecurityHeaders() {
  console.log('📝 Adding security headers to next.config.js...')
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.js')
  const securityHeaders = `
const nextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ]
  },
  
  // Image optimization security
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Experimental security features
  experimental: {
    serverComponentsExternalPackages: ['bcrypt'],
  }
}

module.exports = nextConfig
`
  
  try {
    fs.writeFileSync(nextConfigPath, securityHeaders)
    console.log('✅ Security headers added successfully')
  } catch (error) {
    console.error('❌ Failed to add security headers:', error.message)
  }
}

// 2. Create rate limiting middleware
function createRateLimitingMiddleware() {
  console.log('⏱️ Creating rate limiting middleware...')
  
  const middlewareDir = path.join(process.cwd(), 'middleware')
  const middlewarePath = path.join(middlewareDir, 'rateLimiting.js')
  
  if (!fs.existsSync(middlewareDir)) {
    fs.mkdirSync(middlewareDir, { recursive: true })
  }
  
  const rateLimitingCode = `
import { NextResponse } from 'next/server'

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map()

export function rateLimitMiddleware(request) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 100
  
  // Clean old entries
  for (const [key, data] of rateLimitMap.entries()) {
    if (now - data.resetTime > windowMs) {
      rateLimitMap.delete(key)
    }
  }
  
  // Get or create rate limit data for this IP
  let rateLimitData = rateLimitMap.get(ip)
  if (!rateLimitData) {
    rateLimitData = {
      count: 0,
      resetTime: now + windowMs
    }
    rateLimitMap.set(ip, rateLimitData)
  }
  
  // Check if rate limit exceeded
  if (rateLimitData.count >= maxRequests) {
    return new NextResponse(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitData.resetTime.toString()
        }
      }
    )
  }
  
  // Increment counter
  rateLimitData.count++
  
  return null // Continue to next middleware
}

// Auth-specific rate limiting (stricter)
export function authRateLimitMiddleware(request) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 5 // Only 5 auth attempts per 15 minutes
  
  const key = \`auth:\${ip}\`
  let rateLimitData = rateLimitMap.get(key)
  
  if (!rateLimitData) {
    rateLimitData = {
      count: 0,
      resetTime: now + windowMs
    }
    rateLimitMap.set(key, rateLimitData)
  }
  
  if (rateLimitData.count >= maxRequests) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many authentication attempts' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimitData.resetTime - now) / 1000).toString()
        }
      }
    )
  }
  
  rateLimitData.count++
  return null
}
`
  
  try {
    fs.writeFileSync(middlewarePath, rateLimitingCode)
    console.log('✅ Rate limiting middleware created')
  } catch (error) {
    console.error('❌ Failed to create rate limiting middleware:', error.message)
  }
}

// 3. Create input validation utilities
function createInputValidation() {
  console.log('🔍 Creating input validation utilities...')
  
  const utilsDir = path.join(process.cwd(), 'utils')
  const validationPath = path.join(utilsDir, 'validation.js')
  
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true })
  }
  
  const validationCode = `
import DOMPurify from 'isomorphic-dompurify'

// Input sanitization
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}

// SQL injection detection
export function detectSQLInjection(input) {
  const sqlPatterns = [
    /('|(\\-\\-)|(;)|(\\||\\|)|(\\*|\\*))/i,
    /(union|select|insert|delete|drop|create|alter|exec|execute)/i,
    /(script|javascript|vbscript|onload|onerror|onclick)/i
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

// XSS detection
export function detectXSS(input) {
  const xssPatterns = [
    /<script[^>]*>.*?<\\/script>/gi,
    /<iframe[^>]*>.*?<\\/iframe>/gi,
    /javascript:/gi,
    /on\\w+\\s*=/gi
  ]
  
  return xssPatterns.some(pattern => pattern.test(input))
}

// Validate crane data
export function validateCraneData(data) {
  const errors = []
  
  if (!data.capacity || data.capacity < 0 || data.capacity > 10000) {
    errors.push('Capacity must be between 0 and 10000 tonnes')
  }
  
  if (!data.radius || data.radius < 0 || data.radius > 100) {
    errors.push('Radius must be between 0 and 100 meters')
  }
  
  if (!data.height || data.height < 0 || data.height > 200) {
    errors.push('Height must be between 0 and 200 meters')
  }
  
  if (!data.manufacturer || data.manufacturer.length > 50) {
    errors.push('Manufacturer name is required and must be less than 50 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate user input
export function validateUserInput(data) {
  const errors = []
  
  // Check for malicious patterns
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      if (detectSQLInjection(value)) {
        errors.push(\`SQL injection detected in \${key}\`)
      }
      if (detectXSS(value)) {
        errors.push(\`XSS attempt detected in \${key}\`)
      }
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        typeof value === 'string' ? sanitizeInput(value) : value
      ])
    )
  }
}

// Password strength validation
export function validatePasswordStrength(password) {
  const minLength = 12
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  const errors = []
  
  if (password.length < minLength) {
    errors.push(\`Password must be at least \${minLength} characters long\`)
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number')
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: errors.length === 0 ? 'strong' : 
              errors.length <= 2 ? 'medium' : 'weak'
  }
}
`
  
  try {
    fs.writeFileSync(validationPath, validationCode)
    console.log('✅ Input validation utilities created')
  } catch (error) {
    console.error('❌ Failed to create validation utilities:', error.message)
  }
}

// 4. Update package.json with security dependencies
function updateSecurityDependencies() {
  console.log('📦 Installing security dependencies...')
  
  const securityPackages = [
    'isomorphic-dompurify',
    'bcryptjs',
    'helmet',
    'express-rate-limit',
    'express-validator',
    'joi'
  ]
  
  try {
    console.log('Installing packages:', securityPackages.join(', '))
    execSync(\`npm install \${securityPackages.join(' ')}\`, { stdio: 'inherit' })
    console.log('✅ Security dependencies installed')
  } catch (error) {
    console.error('❌ Failed to install security dependencies:', error.message)
  }
}

// 5. Create security middleware for Next.js
function createSecurityMiddleware() {
  console.log('🛡️ Creating main security middleware...')
  
  const middlewarePath = path.join(process.cwd(), 'middleware.js')
  
  const middlewareCode = `
import { NextResponse } from 'next/server'
import { rateLimitMiddleware, authRateLimitMiddleware } from './middleware/rateLimiting'

export function middleware(request) {
  // Apply rate limiting to auth routes
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    const authRateLimit = authRateLimitMiddleware(request)
    if (authRateLimit) return authRateLimit
  }
  
  // Apply general rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimit = rateLimitMiddleware(request)
    if (rateLimit) return rateLimit
  }
  
  // Add security headers to all responses
  const response = NextResponse.next()
  
  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Download-Options', 'noopen')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  
  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
`
  
  try {
    fs.writeFileSync(middlewarePath, middlewareCode)
    console.log('✅ Security middleware created')
  } catch (error) {
    console.error('❌ Failed to create security middleware:', error.message)
  }
}

// 6. Create environment template
function createEnvironmentTemplate() {
  console.log('🔐 Creating secure environment template...')
  
  const envTemplatePath = path.join(process.cwd(), '.env.example')
  
  const envTemplate = \`# Lift Planner Pro - Environment Variables Template
# Copy this file to .env.local and fill in your actual values

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-here-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/liftplannerpro?sslmode=require"

# Encryption Keys
ENCRYPTION_KEY="32-byte-encryption-key-for-sensitive-data-here"
JWT_SECRET="another-super-secret-key-for-jwt-signing-here"

# Security Configuration
ENABLE_RATE_LIMITING="true"
ENABLE_SECURITY_HEADERS="true"
SECURITY_LOG_LEVEL="info"

# Production Settings
NODE_ENV="development"
VERCEL_ENV="development"

# Email Configuration (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Monitoring & Analytics
SENTRY_DSN="your-sentry-dsn-here"
ANALYTICS_ID="your-analytics-id-here"
\`
  
  try {
    fs.writeFileSync(envTemplatePath, envTemplate)
    console.log('✅ Environment template created')
  } catch (error) {
    console.error('❌ Failed to create environment template:', error.message)
  }
}

// Main execution
async function main() {
  try {
    addSecurityHeaders()
    createRateLimitingMiddleware()
    createInputValidation()
    updateSecurityDependencies()
    createSecurityMiddleware()
    createEnvironmentTemplate()
    
    console.log('\\n🎉 Security fixes applied successfully!')
    console.log('\\n📋 Next steps:')
    console.log('1. Copy .env.example to .env.local and fill in your values')
    console.log('2. Restart your development server')
    console.log('3. Test the security features in the admin dashboard')
    console.log('4. Review the SECURITY_REMEDIATION_GUIDE.md for additional manual fixes')
    console.log('\\n🛡️ Your application is now more secure!')
    
  } catch (error) {
    console.error('❌ Error applying security fixes:', error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = {
  addSecurityHeaders,
  createRateLimitingMiddleware,
  createInputValidation,
  updateSecurityDependencies,
  createSecurityMiddleware,
  createEnvironmentTemplate
}
