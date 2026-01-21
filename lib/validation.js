
/**
 * Input Validation and Security Utilities
 * Implements security best practices for Lift Planner Pro
 */

import Joi from 'joi'
import DOMPurify from 'isomorphic-dompurify'

// Sanitize user input
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  
  // Remove potentially dangerous content
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true // Keep text content
  })
}

// Detect SQL injection attempts
export function detectSQLInjection(input) {
  const sqlPatterns = [
    /('|(\-\-)|(;)|(\||\|)|(\*|\*))/i,
    /(union|select|insert|delete|drop|create|alter|exec|execute|script)/i,
    /(or|and)\s+(1=1|true|false)/i,
    /\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/i
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

// Detect XSS attempts - using safe patterns without catastrophic backtracking
export function detectXSS(input) {
  if (typeof input !== 'string') return false

  // Use simple, non-backtracking patterns to avoid ReDoS
  const lowerInput = input.toLowerCase()

  // Check for dangerous tags/patterns without complex regex
  const dangerousPatterns = [
    '<script',
    '</script',
    '<iframe',
    '</iframe',
    'javascript:',
    '<object',
    '</object',
    'onerror=',
    'onload=',
    'onclick=',
    'onmouseover='
  ]

  return dangerousPatterns.some(pattern => lowerInput.includes(pattern))
}

// Validate crane data with Joi
export const craneDataSchema = Joi.object({
  manufacturer: Joi.string().alphanum().max(50).required(),
  model: Joi.string().alphanum().max(50).required(),
  capacity: Joi.number().min(0).max(10000).required(),
  radius: Joi.number().min(0).max(100).required(),
  height: Joi.number().min(0).max(200).required(),
  counterweight: Joi.number().min(0).max(500).optional(),
  notes: Joi.string().max(500).optional()
})

// Validate user registration data
export const userRegistrationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(12).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required(),
  role: Joi.string().valid('admin', 'user', 'viewer').default('user')
})

// Comprehensive input validation
export function validateUserInput(data, schema = null) {
  const errors = []
  const sanitized = {}
  
  // Sanitize and validate each field
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Check for malicious patterns
      if (detectSQLInjection(value)) {
        errors.push(`SQL injection detected in ${key}`)
      }
      if (detectXSS(value)) {
        errors.push(`XSS attempt detected in ${key}`)
      }
      
      // Sanitize the input
      sanitized[key] = sanitizeInput(value)
    } else {
      sanitized[key] = value
    }
  })
  
  // Apply Joi schema validation if provided
  let schemaValidation = { error: null }
  if (schema) {
    schemaValidation = schema.validate(sanitized)
    if (schemaValidation.error) {
      errors.push(...schemaValidation.error.details.map(detail => detail.message))
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: schemaValidation.value || sanitized
  }
}

// Password strength validation
export function validatePasswordStrength(password) {
  const requirements = {
    minLength: password.length >= 12,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    noCommonPatterns: !/^(password|123456|qwerty|admin|user)/i.test(password)
  }
  
  const errors = []
  if (!requirements.minLength) errors.push('Password must be at least 12 characters long')
  if (!requirements.hasUpperCase) errors.push('Password must contain at least one uppercase letter')
  if (!requirements.hasLowerCase) errors.push('Password must contain at least one lowercase letter')
  if (!requirements.hasNumbers) errors.push('Password must contain at least one number')
  if (!requirements.hasSpecialChar) errors.push('Password must contain at least one special character')
  if (!requirements.noCommonPatterns) errors.push('Password cannot be a common pattern')
  
  const score = Object.values(requirements).filter(Boolean).length
  const strength = score >= 6 ? 'strong' : score >= 4 ? 'medium' : 'weak'
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: (score / 6) * 100
  }
}
