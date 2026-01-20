#!/usr/bin/env node

/**
 * 🔍 Security Validation Script
 * Validates that all security fixes have been properly implemented
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

console.log('🔍 Validating Security Implementation...\n')

// Check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath)
}

// Check if string contains pattern
function containsPattern(content, pattern) {
  return pattern.test(content)
}

// Validation results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
}

function addResult(test, status, message) {
  results.details.push({ test, status, message })
  if (status === 'PASS') results.passed++
  else if (status === 'FAIL') results.failed++
  else results.warnings++
}

// 1. Validate Security Headers in next.config.js
function validateSecurityHeaders() {
  console.log('📋 Checking Security Headers...')
  
  const configPath = path.join(process.cwd(), 'next.config.js')
  
  if (!fileExists(configPath)) {
    addResult('Security Headers', 'FAIL', 'next.config.js not found')
    return
  }
  
  const configContent = fs.readFileSync(configPath, 'utf8')
  
  const requiredHeaders = [
    { name: 'Content-Security-Policy', pattern: /Content-Security-Policy/ },
    { name: 'X-Frame-Options', pattern: /X-Frame-Options/ },
    { name: 'X-Content-Type-Options', pattern: /X-Content-Type-Options/ },
    { name: 'Referrer-Policy', pattern: /Referrer-Policy/ },
    { name: 'Strict-Transport-Security', pattern: /Strict-Transport-Security/ }
  ]
  
  let headersPassed = 0
  requiredHeaders.forEach(header => {
    if (containsPattern(configContent, header.pattern)) {
      addResult(`Header: ${header.name}`, 'PASS', 'Security header configured')
      headersPassed++
    } else {
      addResult(`Header: ${header.name}`, 'FAIL', 'Security header missing')
    }
  })
  
  if (headersPassed === requiredHeaders.length) {
    addResult('Security Headers', 'PASS', 'All security headers configured')
  } else {
    addResult('Security Headers', 'FAIL', `${headersPassed}/${requiredHeaders.length} headers configured`)
  }
}

// 2. Validate Rate Limiting Implementation
function validateRateLimiting() {
  console.log('⏱️ Checking Rate Limiting...')
  
  const rateLimitPath = path.join(process.cwd(), 'lib', 'rateLimiting.js')
  const middlewarePath = path.join(process.cwd(), 'middleware.js')
  
  if (fileExists(rateLimitPath)) {
    const content = fs.readFileSync(rateLimitPath, 'utf8')
    if (containsPattern(content, /express-rate-limit/)) {
      addResult('Rate Limiting Library', 'PASS', 'Rate limiting middleware created')
    } else {
      addResult('Rate Limiting Library', 'FAIL', 'Rate limiting not properly configured')
    }
  } else {
    addResult('Rate Limiting Library', 'FAIL', 'Rate limiting middleware not found')
  }
  
  if (fileExists(middlewarePath)) {
    const content = fs.readFileSync(middlewarePath, 'utf8')
    if (containsPattern(content, /rateLimit/)) {
      addResult('Middleware Rate Limiting', 'PASS', 'Rate limiting in middleware')
    } else {
      addResult('Middleware Rate Limiting', 'WARN', 'Rate limiting not found in middleware')
    }
  } else {
    addResult('Middleware Rate Limiting', 'FAIL', 'Security middleware not found')
  }
}

// 3. Validate Environment Security
function validateEnvironmentSecurity() {
  console.log('🔐 Checking Environment Security...')
  
  const envExamplePath = path.join(process.cwd(), '.env.example')
  const envLocalPath = path.join(process.cwd(), '.env.local')
  
  if (fileExists(envExamplePath)) {
    const content = fs.readFileSync(envExamplePath, 'utf8')
    const requiredVars = [
      'NEXTAUTH_SECRET',
      'JWT_SECRET',
      'ENCRYPTION_KEY',
      'DATABASE_URL'
    ]
    
    let varsFound = 0
    requiredVars.forEach(varName => {
      if (content.includes(varName)) {
        varsFound++
      }
    })
    
    if (varsFound === requiredVars.length) {
      addResult('Environment Template', 'PASS', 'All required environment variables documented')
    } else {
      addResult('Environment Template', 'FAIL', `${varsFound}/${requiredVars.length} environment variables documented`)
    }
  } else {
    addResult('Environment Template', 'FAIL', '.env.example not found')
  }
  
  if (fileExists(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf8')
    
    // Check for weak default values
    const weakPatterns = [
      /NEXTAUTH_SECRET="dev-secret/,
      /JWT_SECRET="dev-jwt/,
      /password@localhost/,
      /your-secret-key/
    ]
    
    let weakFound = 0
    weakPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        weakFound++
      }
    })
    
    if (weakFound > 0) {
      addResult('Environment Security', 'WARN', `${weakFound} weak default values found - update for production`)
    } else {
      addResult('Environment Security', 'PASS', 'No weak default values detected')
    }
  } else {
    addResult('Environment Security', 'WARN', '.env.local not found - create for local development')
  }
}

// 4. Validate Input Validation
function validateInputValidation() {
  console.log('🔍 Checking Input Validation...')
  
  const validationPath = path.join(process.cwd(), 'lib', 'validation.js')
  
  if (fileExists(validationPath)) {
    const content = fs.readFileSync(validationPath, 'utf8')
    
    const validationFeatures = [
      { name: 'SQL Injection Detection', pattern: /detectSQLInjection/ },
      { name: 'XSS Detection', pattern: /detectXSS/ },
      { name: 'Input Sanitization', pattern: /sanitizeInput/ },
      { name: 'Schema Validation', pattern: /Joi/ }
    ]
    
    let featuresFound = 0
    validationFeatures.forEach(feature => {
      if (containsPattern(content, feature.pattern)) {
        addResult(`Validation: ${feature.name}`, 'PASS', 'Feature implemented')
        featuresFound++
      } else {
        addResult(`Validation: ${feature.name}`, 'FAIL', 'Feature missing')
      }
    })
    
    if (featuresFound === validationFeatures.length) {
      addResult('Input Validation', 'PASS', 'All validation features implemented')
    } else {
      addResult('Input Validation', 'FAIL', `${featuresFound}/${validationFeatures.length} validation features implemented`)
    }
  } else {
    addResult('Input Validation', 'FAIL', 'Input validation utilities not found')
  }
}

// 5. Check Package Dependencies
function validateDependencies() {
  console.log('📦 Checking Security Dependencies...')
  
  const packagePath = path.join(process.cwd(), 'package.json')
  
  if (fileExists(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    const dependencies = { ...packageContent.dependencies, ...packageContent.devDependencies }
    
    const securityPackages = [
      'express-rate-limit',
      'helmet',
      'bcryptjs',
      'joi',
      'isomorphic-dompurify'
    ]
    
    let packagesFound = 0
    securityPackages.forEach(pkg => {
      if (dependencies[pkg]) {
        addResult(`Package: ${pkg}`, 'PASS', `Version ${dependencies[pkg]}`)
        packagesFound++
      } else {
        addResult(`Package: ${pkg}`, 'FAIL', 'Security package not installed')
      }
    })
    
    if (packagesFound === securityPackages.length) {
      addResult('Security Dependencies', 'PASS', 'All security packages installed')
    } else {
      addResult('Security Dependencies', 'FAIL', `${packagesFound}/${securityPackages.length} security packages installed`)
    }
  } else {
    addResult('Security Dependencies', 'FAIL', 'package.json not found')
  }
}

// 6. Generate Security Report
function generateSecurityReport() {
  console.log('\n📊 Security Validation Report')
  console.log('=' .repeat(50))
  
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`⚠️  Warnings: ${results.warnings}`)
  console.log(`📋 Total Tests: ${results.details.length}`)
  
  const score = Math.round((results.passed / results.details.length) * 100)
  console.log(`🎯 Security Score: ${score}%`)
  
  console.log('\n📋 Detailed Results:')
  console.log('-'.repeat(50))
  
  results.details.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${icon} ${result.test}: ${result.message}`)
  })
  
  console.log('\n🔧 Recommendations:')
  console.log('-'.repeat(50))
  
  if (results.failed > 0) {
    console.log('❌ Critical Issues Found:')
    console.log('   1. Run: node scripts/implement-security-fixes.js')
    console.log('   2. Update .env.local with secure values')
    console.log('   3. Restart your development server')
  }
  
  if (results.warnings > 0) {
    console.log('⚠️  Warnings to Address:')
    console.log('   1. Update weak default values in .env.local')
    console.log('   2. Configure production environment variables')
    console.log('   3. Set up SSL certificates for production')
  }
  
  if (score >= 90) {
    console.log('🎉 Excellent! Your security implementation is strong.')
  } else if (score >= 70) {
    console.log('👍 Good security implementation. Address remaining issues.')
  } else {
    console.log('⚠️  Security implementation needs improvement. Please address failed tests.')
  }
  
  console.log('\n🛡️ Security validation complete!')
}

// Main execution
async function main() {
  validateSecurityHeaders()
  validateRateLimiting()
  validateEnvironmentSecurity()
  validateInputValidation()
  validateDependencies()
  generateSecurityReport()
}

// Run validation
if (require.main === module) {
  main()
}

module.exports = {
  validateSecurityHeaders,
  validateRateLimiting,
  validateEnvironmentSecurity,
  validateInputValidation,
  validateDependencies,
  generateSecurityReport
}
