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

// GET - Fetch user's issues or all issues (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Log data access
    await SecurityLogger.logDataAccess(
      user.id,
      'issue_reports',
      request,
      { action: 'fetch_issues' }
    )

    // Check if user is admin
    const userIsAdmin = isAdmin(session.user.email)
    
    const issues = await prisma.issueReport.findMany({
      where: userIsAdmin ? {} : { userId: user.id },
      orderBy: { createdAt: 'desc' },
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

    return NextResponse.json({ issues })
  } catch (error) {
    console.error('Error fetching issues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    )
  }
}

// POST - Create new issue report
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const {
      title,
      description,
      category,
      priority = 'MEDIUM',
      browserInfo,
      url,
      screenshot
    } = body

    // Validate required fields
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      )
    }

    // Get user info if logged in
    let userId = null
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      userId = user?.id
    }

    // Collect system information
    const systemInfo = {
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      timestamp: new Date().toISOString(),
      browserInfo,
      url: url || request.headers.get('referer')
    }

    // Create issue report
    const issue = await prisma.issueReport.create({
      data: {
        title,
        description,
        category,
        priority,
        status: 'OPEN',
        browserInfo: JSON.stringify(systemInfo),
        url: systemInfo.url,
        screenshot,
        userId,
        logs: JSON.stringify({
          headers: Object.fromEntries(request.headers.entries()),
          systemInfo
        })
      }
    })

    // Log security event
    await SecurityLogger.log({
      userId: userId || undefined,
      action: SecurityAction.DATA_MODIFICATION,
      resource: 'issue_reports',
      ipAddress: SecurityLogger.getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      success: true,
      details: {
        issueId: issue.id,
        category,
        priority
      }
    })

    // Send notification for high priority issues
    if (priority === 'HIGH' || priority === 'CRITICAL') {
      console.log('HIGH PRIORITY ISSUE ALERT:', {
        id: issue.id,
        title: issue.title,
        category: issue.category,
        priority: issue.priority,
        timestamp: issue.createdAt
      })
    }

    return NextResponse.json({
      success: true,
      issue: {
        id: issue.id,
        title: issue.title,
        category: issue.category,
        priority: issue.priority,
        status: issue.status,
        createdAt: issue.createdAt
      }
    })
  } catch (error) {
    console.error('Error creating issue:', error)
    return NextResponse.json(
      { error: 'Failed to create issue report' },
      { status: 500 }
    )
  }
}

// PATCH - Update issue status (admin only)
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

    const body = await request.json()
    const { issueId, status, resolution, assignedTo } = body

    if (!issueId || !status) {
      return NextResponse.json(
        { error: 'Issue ID and status are required' },
        { status: 400 }
      )
    }

    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    if (resolution) {
      updateData.resolution = resolution
    }

    if (assignedTo) {
      updateData.assignedTo = assignedTo
    }

    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.resolvedAt = new Date()
    }

    const issue = await prisma.issueReport.update({
      where: { id: issueId },
      data: updateData
    })

    // Log security event
    await SecurityLogger.log({
      userId: user?.id,
      action: SecurityAction.DATA_MODIFICATION,
      resource: 'issue_reports',
      ipAddress: SecurityLogger.getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      success: true,
      details: {
        issueId,
        newStatus: status,
        resolution
      }
    })

    return NextResponse.json({
      success: true,
      issue
    })
  } catch (error) {
    console.error('Error updating issue:', error)
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    )
  }
}
