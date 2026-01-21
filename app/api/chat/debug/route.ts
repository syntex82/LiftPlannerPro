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
    chatMessages: 0,
    groupMessages: 0,
    errors: []
  }

  try {
    // Check session
    const session = await getServerSession(authOptions)
    debug.session = {
      exists: !!session,
      email: session?.user?.email || null,
      name: session?.user?.name || null
    }

    // Check user
    if (session?.user?.email) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, name: true, email: true, onlineStatus: true }
        })
        debug.user = user
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
    } catch (e: any) {
      debug.errors.push(`GroupMessage count error: ${e.message}`)
    }

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`
      debug.database = 'connected'
    } catch (e: any) {
      debug.database = 'error'
      debug.errors.push(`Database connection error: ${e.message}`)
    }

    return NextResponse.json(debug)

  } catch (error: any) {
    debug.errors.push(`General error: ${error.message}`)
    return NextResponse.json(debug, { status: 500 })
  }
}

