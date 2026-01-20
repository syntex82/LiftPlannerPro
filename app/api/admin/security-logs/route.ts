import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { SecurityLogger, SecurityAction } from '@/lib/security-logger'

const prisma = new PrismaClient()

// Admin email list
const adminEmails = [
  'mickyblenk@gmail.com',
  'admin@liftplannerpro.org'
]

const isAdmin = (email: string | null | undefined) => {
  return email && adminEmails.includes(email)
}

// GET - Fetch security logs (admin only)
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const riskLevel = url.searchParams.get('riskLevel')
    const action = url.searchParams.get('action')

    // Build where clause
    const where: any = {}
    if (riskLevel) {
      where.riskLevel = riskLevel
    }
    if (action) {
      where.action = action
    }

    // Fetch security logs
    const logs = await prisma.securityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Get total count
    const totalCount = await prisma.securityLog.count({ where })

    // Log this admin access
    await SecurityLogger.log({
      userId: user.id,
      action: SecurityAction.DATA_ACCESS,
      resource: 'security_logs',
      ipAddress: SecurityLogger.getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      success: true,
      details: {
        logsAccessed: logs.length,
        filters: { riskLevel, action, limit, offset }
      }
    })

    return NextResponse.json({
      logs,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })
  } catch (error) {
    console.error('Error fetching security logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security logs' },
      { status: 500 }
    )
  }
}

// POST - Create manual security log entry (admin only)
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
    const { action, resource, details, riskLevel = 'MEDIUM' } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Create manual security log
    await SecurityLogger.log({
      userId: user.id,
      action: action as SecurityAction,
      resource,
      ipAddress: SecurityLogger.getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      success: true,
      details: {
        manualEntry: true,
        enteredBy: user.email,
        ...details
      },
      riskLevel: riskLevel as any
    })

    return NextResponse.json({
      success: true,
      message: 'Security log entry created'
    })
  } catch (error) {
    console.error('Error creating security log:', error)
    return NextResponse.json(
      { error: 'Failed to create security log' },
      { status: 500 }
    )
  }
}
