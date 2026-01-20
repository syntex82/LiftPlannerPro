import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SecurityLogger, SecurityAction } from '@/lib/security-logger'

function isAdmin(email?: string | null): boolean {
  const adminEmails = [
    'mickyblenk@gmail.com',
    'admin@liftplannerpro.org'
  ]
  return adminEmails.includes(email || '')
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { issueIds } = body

    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return NextResponse.json({ error: 'Issue IDs array is required' }, { status: 400 })
    }

    // Validate that all IDs are strings
    if (!issueIds.every(id => typeof id === 'string')) {
      return NextResponse.json({ error: 'All issue IDs must be strings' }, { status: 400 })
    }

    // Get issues before deletion for logging
    const issuesToDelete = await prisma.issueReport.findMany({
      where: {
        id: {
          in: issueIds
        }
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

    if (issuesToDelete.length === 0) {
      return NextResponse.json({ error: 'No issues found with provided IDs' }, { status: 404 })
    }

    // Delete the issues
    const deleteResult = await prisma.issueReport.deleteMany({
      where: {
        id: {
          in: issueIds
        }
      }
    })

    // Log the bulk deletion
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' }
    })

    if (user) {
      await SecurityLogger.log({
        userId: user.id,
        action: SecurityAction.DATA_DELETE,
        resource: 'issue_report_bulk',
        ipAddress: SecurityLogger.getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'Unknown',
        success: true,
        details: {
          deletedCount: deleteResult.count,
          deletedIssues: issuesToDelete.map(issue => ({
            id: issue.id,
            title: issue.title,
            reportedBy: issue.user?.email
          }))
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${deleteResult.count} issue(s)`,
      deletedCount: deleteResult.count,
      deletedIssues: issuesToDelete.map(issue => ({
        id: issue.id,
        title: issue.title,
        reportedBy: issue.user?.email
      }))
    })

  } catch (error) {
    console.error('Error bulk deleting issues:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
