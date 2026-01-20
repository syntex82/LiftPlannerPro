import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      page,
      url,
      referrer,
      userAgent,
      timestamp,
      isAuthenticated,
      userId,
      sessionId,
      viewport,
      screen
    } = data

    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1'

    // Create a visitor log entry
    const visitorLog = await prisma.securityLog.create({
      data: {
        action: 'PAGE_VIEW',
        resource: page || 'unknown',
        details: JSON.stringify({
          url,
          referrer,
          viewport,
          screen,
          sessionId,
          isAuthenticated
        }),
        ipAddress,
        userAgent: userAgent || 'Unknown',
        userId: isAuthenticated ? userId : null,
        success: true,
        riskLevel: 'LOW'
      }
    })

    // Track unique visitors (by IP + User Agent combination)
    const visitorFingerprint = `${ipAddress}_${userAgent?.slice(0, 100) || 'unknown'}`
    
    // Store visitor session data only for authenticated users
    if (isAuthenticated && userId) {
      try {
        const sessionToken = sessionId || `session_${Date.now()}_${userId}`

        await prisma.userSession.upsert({
          where: {
            sessionToken: sessionToken
          },
          update: {
            lastActivity: new Date(),
            isActive: true
          },
          create: {
            sessionToken: sessionToken,
            userId: userId,
            ipAddress,
            userAgent: userAgent || 'Unknown',
            isActive: true,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            lastActivity: new Date()
          }
        })
      } catch (sessionError) {
        // If session tracking fails, continue without it
        console.debug('Session tracking failed:', sessionError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      logId: visitorLog.id 
    })

  } catch (error) {
    console.error('Visitor tracking error:', error)
    
    // Return success even if tracking fails to not break user experience
    return NextResponse.json({ 
      success: true, 
      error: 'Tracking failed silently' 
    })
  }
}

// GET endpoint to retrieve visitor analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (range) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      default:
        startDate.setDate(startDate.getDate() - 7)
    }

    // Get page view logs
    const pageViews = await prisma.securityLog.findMany({
      where: {
        action: 'PAGE_VIEW',
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      select: {
        ipAddress: true,
        resource: true,
        details: true,
        createdAt: true,
        userId: true
      }
    })

    // Get unique visitors
    const uniqueIPs = new Set(pageViews.map(pv => pv.ipAddress))
    const authenticatedViews = pageViews.filter(pv => pv.userId)
    const anonymousViews = pageViews.filter(pv => !pv.userId)

    // Get session data
    const sessions = await prisma.userSession.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      select: {
        sessionToken: true,
        userId: true,
        createdAt: true,
        lastActivity: true
      }
    })

    // Calculate metrics
    const totalVisitors = uniqueIPs.size
    const totalPageViews = pageViews.length
    const totalSessions = sessions.length
    const authenticatedUsers = new Set(authenticatedViews.map(av => av.userId)).size
    const anonymousVisitors = totalVisitors - authenticatedUsers

    // Page popularity
    const pageStats = pageViews.reduce((acc, pv) => {
      const page = pv.resource || 'unknown'
      if (!acc[page]) {
        acc[page] = { views: 0, uniqueVisitors: new Set() }
      }
      acc[page].views++
      acc[page].uniqueVisitors.add(pv.ipAddress)
      return acc
    }, {} as Record<string, { views: number; uniqueVisitors: Set<string> }>)

    const topPages = Object.entries(pageStats)
      .map(([page, stats]) => ({
        page,
        views: stats.views,
        uniqueVisitors: stats.uniqueVisitors.size
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    const analytics = {
      totalVisitors,
      totalPageViews,
      totalSessions,
      authenticatedUsers,
      anonymousVisitors,
      conversionRate: totalVisitors > 0 ? (authenticatedUsers / totalVisitors) * 100 : 0,
      topPages,
      timeRange: range
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Analytics retrieval error:', error)
    return NextResponse.json({ 
      error: 'Failed to retrieve analytics' 
    }, { status: 500 })
  }
}
