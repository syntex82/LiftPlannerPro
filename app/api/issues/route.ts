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

interface Issue {
  id: string
  title: string
  description: string
  category: 'bug' | 'feature' | 'support' | 'security'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  reportedBy: string
  reportedAt: string
  assignedTo?: string
  resolvedAt?: string
  module: string
  stepsToReproduce?: string
  expectedBehavior?: string
  actualBehavior?: string
  response?: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userOnly = searchParams.get('userOnly') === 'true'
    const userIsAdmin = isAdmin(session.user?.email)

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build where clause for filtering
    let whereClause: any = {}

    // If not admin and userOnly is requested, filter by user
    if (userOnly && !userIsAdmin) {
      whereClause.userId = user.id
    }

    // If not admin, don't show all issues
    if (!userIsAdmin && !userOnly) {
      whereClause.userId = user.id
    }

    // Fetch issues from database
    const issueReports = await prisma.issueReport.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // resolvedAt: true, // Column doesn't exist in current database
        // url: true, // Column doesn't exist in current database
        // screenshot: true, // Column doesn't exist in current database
        // logs: true, // Column doesn't exist in current database
        // resolution: true, // Column doesn't exist in current database
        userId: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform to match the expected format
    const issues = issueReports.map(issue => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      category: issue.category.toLowerCase(),
      priority: issue.priority.toLowerCase(),
      status: issue.status.toLowerCase().replace('_', '_'),
      reportedBy: issue.user?.email || 'Unknown',
      reportedAt: issue.createdAt.toISOString(),
      // assignedTo: issue.assignedTo, // Column doesn't exist in current database
      // resolvedAt: issue.resolvedAt?.toISOString(), // Column doesn't exist in current database
      module: 'general', // Simplified since url column doesn't exist
      // browserInfo: issue.browserInfo, // Temporarily disabled - column doesn't exist
      // url: issue.url, // Temporarily disabled - column doesn't exist
      // screenshot: issue.screenshot, // Temporarily disabled - column doesn't exist
      // logs: issue.logs, // Temporarily disabled - column doesn't exist
      // resolution: issue.resolution // Temporarily disabled - column doesn't exist
    }))

    return NextResponse.json({ issues, total: issues.length })
  } catch (error) {
    console.error('Error fetching issues:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      priority,
      module,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior
    } = body

    // Validate required fields
    if (!title || !description || !category || !priority || !module) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create issue in database
    const newIssue = await prisma.issueReport.create({
      data: {
        title,
        description,
        category: category.toUpperCase(),
        priority: priority.toUpperCase(),
        status: 'OPEN',
        userId: user.id,
        url: module === 'cad' ? '/cad' :
             module === 'calculator' ? '/calculator' :
             module === 'rams' ? '/rams' :
             module === 'dashboard' ? '/dashboard' : '/',
        // browserInfo: `${module} module` // Temporarily disabled - column doesn't exist
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Log the issue creation
    await SecurityLogger.log({
      userId: user.id,
      action: SecurityAction.DATA_MODIFICATION,
      resource: 'issue_report',
      ipAddress: SecurityLogger.getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      success: true,
      details: {
        issueId: newIssue.id,
        category: newIssue.category,
        priority: newIssue.priority
      }
    })

    // Transform to match expected format
    const issueResponse = {
      id: newIssue.id,
      title: newIssue.title,
      description: newIssue.description,
      category: newIssue.category.toLowerCase(),
      priority: newIssue.priority.toLowerCase(),
      status: newIssue.status.toLowerCase(),
      reportedBy: newIssue.user?.email || 'Unknown',
      reportedAt: newIssue.createdAt.toISOString(),
      module: newIssue.url?.includes('/cad') ? 'cad' :
              newIssue.url?.includes('/calculator') ? 'calculator' :
              newIssue.url?.includes('/rams') ? 'rams' :
              newIssue.url?.includes('/dashboard') ? 'dashboard' : 'general',
      // browserInfo: newIssue.browserInfo, // Temporarily disabled - column doesn't exist
      url: newIssue.url
    }

    return NextResponse.json(issueResponse, { status: 201 })
  } catch (error) {
    console.error('Error creating issue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update issues
    if (!isAdmin(session.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, status, assignedTo, response } = body

    // Find the issue in database
    const existingIssue = await prisma.issueReport.findUnique({
      where: { id }
    })

    if (!existingIssue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Find assigned user if provided
    let assignedUser = null
    if (assignedTo) {
      assignedUser = await prisma.user.findUnique({
        where: { email: assignedTo }
      })
    }

    // Update issue in database
    const updatedIssue = await prisma.issueReport.update({
      where: { id },
      data: {
        status: status?.toUpperCase(),
        assignedTo: assignedUser?.id,
        resolution: response,
        resolvedAt: status === 'resolved' ? new Date() : null
      }
    })

    // Log the update
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' }
    })

    if (user) {
      await SecurityLogger.log({
        userId: user.id,
        action: SecurityAction.DATA_MODIFICATION,
        resource: 'issue_report',
        ipAddress: SecurityLogger.getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'Unknown',
        success: true,
        details: {
          issueId: updatedIssue.id,
          status: updatedIssue.status,
          assignedTo: updatedIssue.assignedTo
        }
      })
    }

    // Transform to match expected format
    const issueResponse = {
      id: updatedIssue.id,
      title: updatedIssue.title,
      description: updatedIssue.description,
      category: updatedIssue.category.toLowerCase(),
      priority: updatedIssue.priority.toLowerCase(),
      status: updatedIssue.status.toLowerCase(),
      userId: updatedIssue.userId,
      reportedAt: updatedIssue.createdAt.toISOString(),
      assignedTo: updatedIssue.assignedTo,
      resolution: updatedIssue.resolution
    }

    return NextResponse.json(issueResponse)
  } catch (error) {
    console.error('Error updating issue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
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
    const issueId = searchParams.get('id')

    if (!issueId) {
      return NextResponse.json({ error: 'Issue ID is required' }, { status: 400 })
    }

    // Check if issue exists
    const existingIssue = await prisma.issueReport.findUnique({
      where: { id: issueId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!existingIssue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // Delete the issue
    await prisma.issueReport.delete({
      where: { id: issueId }
    })

    // Log the deletion
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' }
    })

    if (user) {
      await SecurityLogger.log({
        userId: user.id,
        action: SecurityAction.DATA_DELETE,
        resource: 'issue_report',
        ipAddress: SecurityLogger.getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'Unknown',
        success: true,
        details: {
          deletedIssueId: issueId,
          deletedIssueTitle: existingIssue.title,
          reportedBy: existingIssue.user?.email
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Issue deleted successfully',
      deletedIssue: {
        id: existingIssue.id,
        title: existingIssue.title,
        reportedBy: existingIssue.user?.email
      }
    })

  } catch (error) {
    console.error('Error deleting issue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


