import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma' // Temporarily disabled for development

function isAdmin(email?: string | null): boolean {
  const adminEmails = [
    'mickyblenk@gmail.com',
    'admin@liftplannerpro.org'
  ]
  return adminEmails.includes(email || '')
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const userIsAdmin = isAdmin(session.user?.email)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // For development, return demo data directly
    // Database functionality will be re-enabled when Prisma is properly configured
    console.log('Using demo session data for development')
    const demoSessions = [
        {
          id: 'demo-session-1',
          user: {
            id: 'admin-user',
            name: 'Micky Blenk',
            email: 'mickyblenk@gmail.com',
            subscription: 'enterprise'
          },
          loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          sessionDuration: 2 * 60 * 60 * 1000, // 2 hours in ms
          ipAddress: '192.168.1.100',
          location: 'Local Network',
          device: 'Desktop (Windows)',
          browser: 'Chrome 139.0',
          status: 'active',
          riskLevel: 'LOW',
          lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
        },
        {
          id: 'demo-session-2',
          user: {
            id: 'demo-user',
            name: 'Demo User',
            email: 'demo@liftplanner.com',
            subscription: 'pro'
          },
          loginTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          sessionDuration: 1 * 60 * 60 * 1000, // 1 hour in ms
          ipAddress: '203.0.113.45',
          location: 'External Network',
          device: 'Mobile (iPhone)',
          browser: 'Safari 17.0',
          status: 'active',
          riskLevel: 'LOW',
          lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 minutes ago
        },
        {
          id: 'demo-session-3',
          user: {
            id: 'user-123',
            name: 'John Doe',
            email: 'john.doe@example.com',
            subscription: 'premium'
          },
          loginTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          sessionDuration: 30 * 60 * 1000, // 30 minutes in ms
          ipAddress: '198.51.100.25',
          location: 'External Network',
          device: 'Desktop (Mac)',
          browser: 'Chrome 139.0',
          status: 'active',
          riskLevel: 'LOW',
          lastActivity: new Date(Date.now() - 1 * 60 * 1000).toISOString() // 1 minute ago
        },
        {
          id: 'demo-session-4',
          user: {
            id: 'user-456',
            name: 'Jane Smith',
            email: 'jane.smith@company.com',
            subscription: 'pro'
          },
          loginTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
          sessionDuration: 15 * 60 * 1000, // 15 minutes in ms
          ipAddress: '172.16.0.50',
          location: 'External Network',
          device: 'Desktop (Linux)',
          browser: 'Chrome 139.0',
          status: 'active',
          riskLevel: 'MEDIUM',
          lastActivity: new Date().toISOString() // Just now
        }
      ]

    return NextResponse.json({
      sessions: demoSessions,
      totalActive: demoSessions.length,
      timestamp: new Date().toISOString(),
      note: 'Demo data - showing sample active sessions for development'
    })

  } catch (error) {
    console.error('Error fetching active sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to extract location from IP (simplified)
function extractLocationFromIP(ipAddress?: string): string {
  if (!ipAddress || ipAddress === 'Unknown') return 'Unknown'
  
  // For local IPs, return "Local Network"
  if (ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.') || ipAddress.startsWith('172.') || ipAddress === '127.0.0.1') {
    return 'Local Network'
  }
  
  // For external IPs, you would typically use a GeoIP service
  // For now, return a placeholder
  return 'External Network'
}

// Helper function to extract device info from user agent
function extractDeviceFromUserAgent(userAgent?: string): string {
  if (!userAgent) return 'Unknown'
  
  if (userAgent.includes('Mobile')) return 'Mobile'
  if (userAgent.includes('Tablet')) return 'Tablet'
  if (userAgent.includes('Windows')) return 'Desktop (Windows)'
  if (userAgent.includes('Mac')) return 'Desktop (Mac)'
  if (userAgent.includes('Linux')) return 'Desktop (Linux)'
  
  return 'Desktop'
}

// Helper function to extract browser from user agent
function extractBrowserFromUserAgent(userAgent?: string): string {
  if (!userAgent) return 'Unknown'
  
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  if (userAgent.includes('Opera')) return 'Opera'
  
  return 'Unknown Browser'
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const userIsAdmin = isAdmin(session.user?.email)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // For development, simulate session termination
    // Database functionality will be re-enabled when Prisma is properly configured
    console.log(`Admin ${session.user?.email} terminated session for user ${userId}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Session terminated successfully' 
    })

  } catch (error) {
    console.error('Error terminating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
