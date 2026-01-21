import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Debug endpoint to check chat system status
export async function GET(request: NextRequest) {
  const debug: any = {
    timestamp: new Date().toISOString(),
    session: null,
    user: null,
    groups: [],
    expectedGroups: ['general', 'project-discussion', 'technical-support', 'live-video', 'announcements'],
    missingGroups: [],
    chatMessages: 0,
    groupMessages: 0,
    recentMessages: [],
    onlineUsers: [],
    errors: [],
    recommendations: []
  }

  try {
    // Check session
    const session = await getServerSession(authOptions)
    debug.session = {
      exists: !!session,
      email: session?.user?.email || null,
      name: session?.user?.name || null
    }

    if (!session) {
      debug.recommendations.push('⚠️ You are not logged in. Please log in to use chat.')
    }

    // Check user
    if (session?.user?.email) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, name: true, email: true, onlineStatus: true }
        })
        debug.user = user

        if (!user) {
          debug.recommendations.push('⚠️ Your user account was not found in the database.')
        }
      } catch (e: any) {
        debug.errors.push(`User lookup error: ${e.message}`)
      }
    }

    // Check groups
    try {
      const groups = await prisma.group.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { members: true, messages: true } }
        }
      })
      debug.groups = groups.map(g => ({
        id: g.id,
        name: g.name,
        slug: g.slug,
        members: g._count.members,
        messages: g._count.messages
      }))

      // Check for missing groups
      const existingSlugs = groups.map(g => g.slug)
      debug.missingGroups = debug.expectedGroups.filter((s: string) => !existingSlugs.includes(s))

      if (debug.missingGroups.length > 0) {
        debug.recommendations.push(`⚠️ Missing groups: ${debug.missingGroups.join(', ')}. Messages will auto-create groups when sent.`)
      }
    } catch (e: any) {
      debug.errors.push(`Groups lookup error: ${e.message}`)
    }

    // Check ChatMessage count
    try {
      const chatMessageCount = await prisma.chatMessage.count()
      debug.chatMessages = chatMessageCount
    } catch (e: any) {
      debug.errors.push(`ChatMessage count error: ${e.message}`)
    }

    // Check GroupMessage count
    try {
      const groupMessageCount = await prisma.groupMessage.count()
      debug.groupMessages = groupMessageCount

      // Get recent messages
      const recentMessages = await prisma.groupMessage.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          messageType: true,
          createdAt: true,
          sender: { select: { name: true, email: true } },
          group: { select: { name: true, slug: true } }
        }
      })
      debug.recentMessages = recentMessages.map(m => ({
        id: m.id,
        content: m.content.substring(0, 50) + (m.content.length > 50 ? '...' : ''),
        type: m.messageType,
        time: m.createdAt.toISOString(),
        sender: m.sender?.name || m.sender?.email,
        group: m.group?.name
      }))
    } catch (e: any) {
      debug.errors.push(`GroupMessage count error: ${e.message}`)
    }

    // Check online users
    try {
      const onlineUsers = await prisma.user.findMany({
        where: {
          OR: [
            { onlineStatus: 'online' },
            { onlineStatus: 'away' },
            { onlineStatus: 'busy' },
            { onlineStatus: 'dnd' }
          ]
        },
        select: { id: true, name: true, email: true, onlineStatus: true }
      })
      debug.onlineUsers = onlineUsers
    } catch (e: any) {
      debug.errors.push(`Online users error: ${e.message}`)
    }

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`
      debug.database = 'connected'
    } catch (e: any) {
      debug.database = 'error'
      debug.errors.push(`Database connection error: ${e.message}`)
    }

    // Summary recommendations
    if (debug.errors.length === 0 && debug.missingGroups.length === 0 && debug.session?.exists) {
      debug.recommendations.push('✅ Chat system appears healthy. If messages are not appearing, try refreshing the page.')
    }

    return NextResponse.json(debug)

  } catch (error: any) {
    debug.errors.push(`General error: ${error.message}`)
    return NextResponse.json(debug, { status: 500 })
  }
}

