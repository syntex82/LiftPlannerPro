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

// ==================== IN-MEMORY IP BLOCKLIST ====================
// This is synced from the database periodically via API
// Format: { ipAddress: { reason: string, expiresAt: number | null } }
const blockedIPCache = new Map<string, { reason: string; expiresAt: number | null }>()

// Track suspicious activity for auto-blocking
const suspiciousActivityTracker = new Map<string, { count: number; firstSeen: number }>()

// Rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clear stores in development mode on startup
if (process.env.NODE_ENV === 'development') {
  rateLimitStore.clear()
  blockedIPCache.clear()
  suspiciousActivityTracker.clear()
  console.log('🧹 Security stores cleared for development')
}

// ==================== IP BLOCKLIST FUNCTIONS ====================

export function addToBlocklist(ip: string, reason: string, expiresAt: number | null = null) {
  blockedIPCache.set(ip, { reason, expiresAt })
  console.log(`🚫 IP added to blocklist: ${ip} - ${reason}`)
}

export function removeFromBlocklist(ip: string) {
  blockedIPCache.delete(ip)
  console.log(`✅ IP removed from blocklist: ${ip}`)
}

export function isIPBlocked(ip: string): { blocked: boolean; reason?: string } {
  const entry = blockedIPCache.get(ip)
  if (!entry) return { blocked: false }

  // Check if block has expired
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    blockedIPCache.delete(ip)
    return { blocked: false }
  }

  return { blocked: true, reason: entry.reason }
}

export function getBlockedIPs(): string[] {
  return Array.from(blockedIPCache.keys())
}

// Track suspicious activity and auto-block repeat offenders
function trackSuspiciousActivity(ip: string, pathname: string): boolean {
  const now = Date.now()
  const windowMs = 5 * 60 * 1000 // 5 minute window
  const maxAttempts = 10 // Block after 10 suspicious requests in 5 minutes

  let tracker = suspiciousActivityTracker.get(ip)

  if (!tracker || now - tracker.firstSeen > windowMs) {
    tracker = { count: 1, firstSeen: now }
  } else {
    tracker.count++
  }

  suspiciousActivityTracker.set(ip, tracker)

  // Auto-block if threshold exceeded
  if (tracker.count >= maxAttempts) {
    addToBlocklist(ip, `Auto-blocked: ${tracker.count} suspicious requests in 5 minutes`, now + 24 * 60 * 60 * 1000) // 24 hour block
    suspiciousActivityTracker.delete(ip)
    return true // IP was auto-blocked
  }

  return false
}

// ==================== HELPER FUNCTIONS ====================

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

  // Clean old entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean on each request
    for (const [key, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) {
        rateLimitStore.delete(key)
      }
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

// ==================== MAIN MIDDLEWARE ====================

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const clientIP = getClientIP(request)
  const isLocal = isLocalIP(clientIP)

  // ==================== CHECK IP BLOCKLIST ====================
  if (!isLocal) {
    const blockStatus = isIPBlocked(clientIP)
    if (blockStatus.blocked) {
      console.log(`🚫 BLOCKED REQUEST from ${clientIP}: ${blockStatus.reason}`)
      return new NextResponse(
        JSON.stringify({
          error: 'Access Denied',
          message: 'Your IP address has been blocked due to suspicious activity.',
          reason: blockStatus.reason,
          contact: 'If you believe this is an error, contact support.'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'X-Blocked-IP': clientIP,
            'X-Block-Reason': blockStatus.reason || 'Suspicious activity'
          }
        }
      )
    }
  }

  // ==================== SUSPICIOUS PATTERN DETECTION ====================
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
    /\/\.env/i,                // Environment file access
    /\/\.git/i,                // Git directory access
    /\/config\./i,             // Config file access
    /\/backup/i,               // Backup file access
    /\/admin\.php/i,           // Admin PHP access
    /\/xmlrpc/i,               // XML-RPC attacks
    /\/wp-content/i,           // WordPress content
    /\/wp-includes/i,          // WordPress includes
    /union.*select/i,          // SQL injection
    /select.*from/i,           // SQL injection
    /insert.*into/i,           // SQL injection
    /drop.*table/i,            // SQL injection
    /exec\(/i,                 // Command execution
    /eval\(/i,                 // Code evaluation
  ]

  const isSuspicious = suspiciousPatterns.some(pattern =>
    pattern.test(pathname) || pattern.test(request.url)
  )

  if (isSuspicious && !isLocal) {
    console.log(`🚨 SUSPICIOUS REQUEST from ${clientIP}: ${pathname}`)

    // Track and potentially auto-block
    const wasBlocked = trackSuspiciousActivity(clientIP, pathname)

    if (wasBlocked) {
      return new NextResponse(
        JSON.stringify({
          error: 'Access Denied',
          message: 'Your IP has been blocked due to repeated suspicious activity.',
          warning: 'Unauthorized security testing is illegal under the Computer Misuse Act 1990.'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Return 404 for suspicious requests to not reveal information
    return new NextResponse('Not Found', { status: 404 })
  }

  // ==================== RATE LIMITING FOR REMOTE IPS ====================
  if (!isLocal) {
    // Stricter rate limiting for auth routes
    if (pathname.startsWith('/api/auth/')) {
      if (!rateLimit(clientIP, 50, 15 * 60 * 1000)) { // 50 auth requests per 15 minutes
        console.log(`🚫 Auth rate limit exceeded for ${clientIP}`)

        // Auto-block after rate limit exceeded
        addToBlocklist(clientIP, 'Rate limit exceeded on auth endpoints', Date.now() + 60 * 60 * 1000) // 1 hour block

        return new NextResponse(
          JSON.stringify({
            error: 'Rate Limit Exceeded',
            message: 'Too many authentication attempts. Your IP has been temporarily blocked.',
            retryAfter: 3600
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '3600'
            }
          }
        )
      }
    }

    // General API rate limiting
    if (pathname.startsWith('/api/')) {
      if (!rateLimit(clientIP, 200, 15 * 60 * 1000)) { // 200 API requests per 15 minutes
        console.log(`🚫 API rate limit exceeded for ${clientIP}`)
        return new NextResponse(
          JSON.stringify({
            error: 'Rate Limit Exceeded',
            message: 'Too many requests from your IP address.'
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
  }

  // ==================== SECURITY HEADERS ====================
  const response = NextResponse.next()

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Download-Options', 'noopen')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  // Add client IP to headers for logging (production only)
  if (process.env.NODE_ENV === 'production' && !isLocal) {
    response.headers.set('X-Client-IP', clientIP)
  }

  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
