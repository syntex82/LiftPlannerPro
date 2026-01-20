import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { SecurityLogger, SecurityAction } from '@/lib/security-logger'

const prisma = new PrismaClient()

// Admin email list
const adminEmails = [
  'mickyblenk@gmail.com',  // Primary admin
  'admin@liftplannerpro.org',   // Backup admin
]

const isAdmin = (email: string | null | undefined) => {
  return email && adminEmails.includes(email)
}

// GET - Fetch security threats (admin only)
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Security threats API called')

    const session = await getServerSession(authOptions)
    console.log('📋 Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email,
      email: session?.user?.email
    })

    if (!session?.user?.email) {
      console.log('❌ No session or email found')
      return NextResponse.json({ error: 'Unauthorized - No valid session' }, { status: 401 })
    }

    const isUserAdmin = isAdmin(session.user.email)
    console.log('🔐 Admin check:', {
      email: session.user.email,
      isAdmin: isUserAdmin,
      adminEmails
    })

    if (!isUserAdmin) {
      console.log('❌ User is not admin')
      return NextResponse.json({ error: 'Admin access required - User not in admin list' }, { status: 403 })
    }

    console.log('🔍 Looking up user in database...')
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    console.log('👤 User lookup result:', {
      found: !!user,
      userId: user?.id,
      email: user?.email,
      role: user?.role
    })

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    // Log the security threats access
    await SecurityLogger.log({
      action: SecurityAction.DATA_ACCESS,
      userId: user.id,
      resource: 'security_threats',
      details: 'Admin accessed security threats data',
      ipAddress: request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true
    })

    // TODO: Implement real security threat detection
    // This would typically involve:
    // 1. Analyzing security logs for suspicious patterns
    // 2. Checking failed login attempts
    // 3. Monitoring for SQL injection attempts
    // 4. Detecting brute force attacks
    // 5. Analyzing network traffic anomalies
    // 6. Checking against threat intelligence feeds

    // For now, return empty array until real threat detection is implemented
    const threats: any[] = []

    // Example of what real threats data might look like:
    // const threats = await prisma.securityThreat.findMany({
    //   where: {
    //     status: { in: ['active', 'investigating'] }
    //   },
    //   orderBy: {
    //     createdAt: 'desc'
    //   },
    //   take: 100 // Limit to recent threats
    // })

    const responseData = {
      threats,
      total: threats.length,
      active: threats.filter((t: any) => t.status === 'active').length,
      mitigated: threats.filter((t: any) => t.status === 'mitigated').length,
      lastUpdated: new Date().toISOString()
    }

    console.log('✅ Returning security threats data:', responseData)
    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Security threats API error:', error)
    
    // Log the error
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email }
        })
        
        if (user) {
          await SecurityLogger.log({
            action: SecurityAction.SUSPICIOUS_ACTIVITY,
            userId: user.id,
            resource: 'security_threats_api',
            details: `Security threats API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            ipAddress: request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            success: false
          })
        }
      }
    } catch (logError) {
      console.error('Failed to log security threats API error:', logError)
    }

    return NextResponse.json(
      { error: 'Failed to fetch security threats' },
      { status: 500 }
    )
  }
}

// POST - Create or update security threat (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      type, 
      severity, 
      source, 
      target, 
      description, 
      status = 'active',
      countryCode,
      blocked = false 
    } = body

    if (!type || !severity || !source || !description) {
      return NextResponse.json(
        { error: 'Type, severity, source, and description are required' },
        { status: 400 }
      )
    }

    // Log the threat creation
    await SecurityLogger.log({
      action: SecurityAction.DATA_MODIFICATION,
      userId: user.id,
      resource: 'security_threat',
      details: `Admin created security threat: ${type} from ${source}`,
      ipAddress: request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true
    })

    // TODO: Implement real security threat storage
    // const threat = await prisma.securityThreat.create({
    //   data: {
    //     type,
    //     severity,
    //     source,
    //     target,
    //     description,
    //     status,
    //     countryCode,
    //     blocked,
    //     detectedAt: new Date(),
    //     createdBy: user.id
    //   }
    // })

    // For now, return a mock response
    const threat = {
      id: `threat_${Date.now()}`,
      type,
      severity,
      source,
      target,
      description,
      status,
      countryCode,
      blocked,
      timestamp: new Date().toISOString(),
      createdBy: user.id
    }

    return NextResponse.json({ threat }, { status: 201 })

  } catch (error) {
    console.error('Create security threat error:', error)
    return NextResponse.json(
      { error: 'Failed to create security threat' },
      { status: 500 }
    )
  }
}

// PATCH - Update security threat status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { threatId, status, notes } = body

    if (!threatId || !status) {
      return NextResponse.json(
        { error: 'Threat ID and status are required' },
        { status: 400 }
      )
    }

    // Log the threat status update
    await SecurityLogger.log({
      action: SecurityAction.DATA_MODIFICATION,
      userId: user.id,
      resource: 'security_threat',
      details: `Admin updated threat ${threatId} status to ${status}`,
      ipAddress: request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true
    })

    // TODO: Implement real threat status update
    // const updatedThreat = await prisma.securityThreat.update({
    //   where: { id: threatId },
    //   data: {
    //     status,
    //     notes,
    //     updatedAt: new Date(),
    //     updatedBy: user.id
    //   }
    // })

    // For now, return a mock response
    const updatedThreat = {
      id: threatId,
      status,
      notes,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    }

    return NextResponse.json({ threat: updatedThreat })

  } catch (error) {
    console.error('Update security threat error:', error)
    return NextResponse.json(
      { error: 'Failed to update security threat' },
      { status: 500 }
    )
  }
}
