import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple middleware - just add security headers, no blocking or rate limiting
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
