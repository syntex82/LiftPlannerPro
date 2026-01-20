import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Admin email list
const adminEmails = [
  'mickyblenk@gmail.com',
  'admin@liftplannerpro.org'
]

const isAdmin = (email: string | null | undefined) => {
  return email && adminEmails.includes(email)
}

// GET - Fetch system statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get various statistics
    const [
      totalUsers,
      activeUsers,
      totalProjects,
      totalIssues,
      openIssues,
      totalSecurityLogs,
      recentSecurityLogs,
      totalEquipment,
      totalCertificates,
      recentLogins
    ] = await Promise.all([
      // User statistics
      prisma.user.count(),
      prisma.user.count({
        where: {
          isActive: true,
          lastLogin: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      
      // Project statistics
      prisma.project.count(),
      
      // Issue statistics
      prisma.issueReport.count(),
      prisma.issueReport.count({
        where: { status: 'OPEN' }
      }),
      
      // Security statistics
      prisma.securityLog.count(),
      prisma.securityLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),
      
      // Equipment statistics
      prisma.riggingEquipment.count(),
      
      // Certificate statistics
      prisma.certificate.count(),
      
      // Recent login attempts
      prisma.securityLog.count({
        where: {
          action: { in: ['LOGIN_SUCCESS', 'LOGIN_FAILED'] },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ])

    // Get recent activity
    const recentActivity = await prisma.securityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Get user growth data (last 7 days)
    const userGrowth = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)
        
        const count = await prisma.user.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        })
        
        return {
          date: date.toISOString().split('T')[0],
          users: count
        }
      })
    )

    // Get security events by risk level
    const securityByRisk = await Promise.all([
      prisma.securityLog.count({ where: { riskLevel: 'LOW' } }),
      prisma.securityLog.count({ where: { riskLevel: 'MEDIUM' } }),
      prisma.securityLog.count({ where: { riskLevel: 'HIGH' } }),
      prisma.securityLog.count({ where: { riskLevel: 'CRITICAL' } })
    ])

    // System health metrics (mock data for now)
    const systemHealth = {
      cpu: Math.floor(Math.random() * 30) + 20, // 20-50%
      memory: Math.floor(Math.random() * 40) + 30, // 30-70%
      disk: Math.floor(Math.random() * 20) + 10, // 10-30%
      network: Math.floor(Math.random() * 50) + 25, // 25-75%
      uptime: Math.floor(Date.now() / 1000 / 60 / 60 / 24) + ' days',
      lastBackup: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      activeConnections: Math.floor(Math.random() * 50) + 10,
      errorRate: Math.random() * 2, // 0-2%
      responseTime: Math.floor(Math.random() * 100) + 50 // 50-150ms
    }

    const stats = {
      overview: {
        totalUsers,
        activeUsers,
        totalProjects,
        totalIssues,
        openIssues,
        totalSecurityLogs,
        recentSecurityLogs,
        totalEquipment,
        totalCertificates,
        recentLogins
      },
      userGrowth: userGrowth.reverse(), // Oldest first
      securityByRisk: {
        low: securityByRisk[0],
        medium: securityByRisk[1],
        high: securityByRisk[2],
        critical: securityByRisk[3]
      },
      recentActivity: recentActivity.map(log => ({
        id: log.id,
        type: log.action || 'UNKNOWN_ACTION',
        action: log.action,
        user: log.user?.name || 'System',
        ipAddress: log.ipAddress,
        success: log.success,
        riskLevel: log.riskLevel,
        createdAt: log.createdAt,
        details: `${log.action || 'Unknown action'} by ${log.user?.name || 'System'}`
      })),
      systemHealth
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
