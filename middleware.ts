import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Local IP ranges that should be excluded from security scanning
const LOCAL_IP_RANGES = [
  // Private IPv4 ranges (RFC 1918)
  /^10\./,                    // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12
  /^192\.168\./,              // 192.168.0.0/16
  
  // Loopback and localhost
  /^127\./,                   // 127.0.0.0/8 (loopback)
  /^::1$/,                    // IPv6 loopback
  /^localhost$/i,
  
  // Link-local addresses
  /^169\.254\./,              // 169.254.0.0/16 (APIPA)
  /^fe80:/i,                  // IPv6 link-local
  
  // Other special ranges
  /^0\.0\.0\.0$/,             // Unspecified
  /^255\.255\.255\.255$/,     // Broadcast
]

// Rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clear rate limit store in development mode on startup
if (process.env.NODE_ENV === 'development') {
  rateLimitStore.clear()
  console.log('🧹 Rate limit store cleared for development')
}

function isLocalIP(ip: string): boolean {
  if (!ip || ip === 'unknown') return true // Treat unknown as local for safety

  // In development, treat all IPs as local to avoid rate limiting issues
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  return LOCAL_IP_RANGES.some(pattern => pattern.test(ip))
}

function getClientIP(request: NextRequest): string {
  // Try various headers to get the real client IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  // Parse x-forwarded-for (can contain multiple IPs)
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim())
    // Return the first non-local IP, or the first IP if all are local
    for (const ip of ips) {
      if (!isLocalIP(ip)) {
        return ip
      }
    }
    return ips[0] // Return first IP if all are local
  }
  
  return realIP || cfConnectingIP || 'unknown'
}

function rateLimit(ip: string, limit: number = 1000, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  
  // Clean old entries
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key)
    }
  }
  
  // Get or create rate limit data for this IP
  let rateLimitData = rateLimitStore.get(ip)
  if (!rateLimitData || now > rateLimitData.resetTime) {
    rateLimitData = {
      count: 0,
      resetTime: now + windowMs
    }
    rateLimitStore.set(ip, rateLimitData)
  }
  
  // Check if limit exceeded
  if (rateLimitData.count >= limit) {
    return false
  }
  
  // Increment counter
  rateLimitData.count++
  rateLimitStore.set(ip, rateLimitData)
  
  return true
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ============================================
  // RATE LIMITING DISABLED - User request
  // ============================================
  // Just add basic security headers and pass through
  const response = NextResponse.next()

  // Basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Check for obvious attack patterns (still block these)
  const suspiciousPatterns = [
    /\/cgi-bin\//i,            // CGI exploitation attempts
    /luci/i,                   // OpenWrt router attacks
    /;stok=/i,                 // Router token exploitation
    /\.\./,                    // Path traversal
    /\/etc\/passwd/,           // System file access
    /\/wp-admin/i,             // WordPress admin attempts
    /\/phpmyadmin/i,           // Database admin attempts
    /\.php$/i,                 // PHP file access on non-PHP site
    /\/shell/i,                // Shell access attempts
    /<script/i,                // XSS attempts
  ]

  const isSuspicious = suspiciousPatterns.some(pattern =>
    pattern.test(pathname) || pattern.test(request.url)
  )

  if (isSuspicious) {
    // Return 404 for suspicious requests to not reveal information
    return new NextResponse('Not Found', { status: 404 })
  }

  return response
}

// Old rate limiting code - DISABLED
function _oldMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const clientIP = getClientIP(request)
  const isLocal = isLocalIP(clientIP)

  // Skip security scanning for local IPs
  if (isLocal) {
    console.log(`🏠 Local IP detected (${clientIP}), skipping security scan`)

    // Still add basic security headers but no rate limiting
    const response = NextResponse.next()

    // Basic security headers (safe for local development)
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')

    return response
  }

  // Apply full security scanning for remote IPs only
  console.log(`🌐 Remote IP detected (${clientIP}), applying security scan`)

  // Check for suspicious patterns in URL
  const suspiciousPatterns = [
    /\/cgi-bin\//i,            // CGI exploitation attempts
    /luci/i,                   // OpenWrt router attacks
    /;stok=/i,                 // Router token exploitation
    /\.\./,                    // Path traversal
    /\/etc\/passwd/,           // System file access
    /\/wp-admin/i,             // WordPress admin attempts
    /\/phpmyadmin/i,           // Database admin attempts
    /\.php$/i,                 // PHP file access on non-PHP site
    /\/shell/i,                // Shell access attempts
    /<script/i,                // XSS attempts
  ]

  const isSuspicious = suspiciousPatterns.some(pattern =>
    pattern.test(pathname) || pattern.test(request.url)
  )

  if (isSuspicious) {
    console.log(`🚨 SUSPICIOUS REQUEST DETECTED from ${clientIP}: ${pathname}`)

    // Log suspicious activity (you can implement this)
    // await logSuspiciousActivity(clientIP, pathname, request)

    // Return 404 for suspicious requests to not reveal information
    return new NextResponse('Not Found', { status: 404 })
  }

  // Apply stricter rate limiting to auth routes for remote IPs
  if (pathname.startsWith('/api/auth/')) {
    if (!rateLimit(clientIP, 200, 15 * 60 * 1000)) { // 200 requests per 15 minutes (was 50)
      console.log(`🚫 Rate limit exceeded for remote IP: ${clientIP}`)
      return new NextResponse(
        JSON.stringify({
          error: 'Authentication rate limit exceeded',
          message: 'Too many authentication attempts from your IP address'
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900' // 15 minutes
          }
        }
      )
    }
  }

  // Apply general rate limiting to API routes for remote IPs
  if (pathname.startsWith('/api/')) {
    if (!rateLimit(clientIP, 500, 15 * 60 * 1000)) { // 500 requests per 15 minutes (was 100)
      console.log(`🚫 API rate limit exceeded for remote IP: ${clientIP}`)
      return new NextResponse(
        JSON.stringify({ 
          error: 'API rate limit exceeded',
          message: 'Too many requests from your IP address'
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900'
          }
        }
      )
    }
  }
  
  // Add comprehensive security headers for remote IPs
  const response = NextResponse.next()
  
  // Security headers for remote access
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Download-Options', 'noopen')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  
  // Add IP info to response headers for debugging (development only)
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('X-Client-IP', clientIP)
    response.headers.set('X-Is-Local', isLocal.toString())
  }
  
  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
