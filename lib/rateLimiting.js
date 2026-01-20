
/**
 * Rate Limiting Middleware for Lift Planner Pro
 * Implements the security fixes from the manual guide
 */

import rateLimit from 'express-rate-limit'

// General API rate limiting
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    })
  }
})

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 20, // More lenient in development
  message: {
    error: 'Too many authentication attempts',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (process.env.NODE_ENV === 'development') {
      const ip = req.ip || req.connection.remoteAddress
      return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1'
    }
    return false
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Authentication rate limit exceeded',
      message: 'Too many authentication attempts from your IP address',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    })
  }
})

// Password reset rate limiting
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset attempts',
    retryAfter: '1 hour'
  }
})

// Admin panel rate limiting
export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit admin actions
  message: {
    error: 'Admin rate limit exceeded',
    retryAfter: '15 minutes'
  }
})

// File upload rate limiting
export const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit file uploads
  message: {
    error: 'Upload rate limit exceeded',
    retryAfter: '15 minutes'
  }
})
