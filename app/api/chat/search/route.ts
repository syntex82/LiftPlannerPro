import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Room ID to slug mapping
const roomIdToSlug: Record<number, string> = {
  1: 'general',
  2: 'project-discussion',
  3: 'technical-support',
  4: 'live-video',
  5: 'announcements'
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - please log in' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Search query required' }, { status: 400 })
    }

    const searchTerm = query.toLowerCase().trim()
    let messages: any[] = []

    // If roomId is provided, search in that room only
    if (roomId) {
      const slug = roomIdToSlug[parseInt(roomId)]

      if (slug) {
        try {
          const group = await prisma.group.findUnique({
            where: { slug },
            select: { id: true }
          })

          if (group) {
            const dbMessages = await prisma.groupMessage.findMany({
              where: {
                groupId: group.id,
                isDeleted: false,
                content: { contains: searchTerm, mode: 'insensitive' }
              },
              orderBy: { createdAt: 'desc' },
              take: limit,
              include: {
                sender: { select: { name: true, email: true, image: true } }
              }
            })

            messages = dbMessages.map(msg => ({
              id: msg.id,
              content: msg.content,
              username: msg.sender?.name || msg.sender?.email || 'Unknown',
              created_at: msg.createdAt.toISOString(),
              messageType: msg.messageType,
              avatar: msg.sender?.image
            }))
          }
        } catch (e: any) {
          console.log('Group search error:', e.message)
        }
      }

      // Fallback to ChatMessage table
      if (messages.length === 0) {
        try {
          const dbMessages = await prisma.chatMessage.findMany({
            where: {
              roomId: parseInt(roomId),
              content: { contains: searchTerm, mode: 'insensitive' }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
              user: { select: { name: true, email: true } }
            }
          })

          messages = dbMessages.map(msg => ({
            id: msg.id,
            content: msg.content,
            username: msg.user?.name || msg.user?.email || 'Unknown',
            created_at: msg.createdAt.toISOString(),
            messageType: msg.messageType
          }))
        } catch (e: any) {
          console.log('ChatMessage search error:', e.message)
        }
      }
    } else {
      // Search across all messages (no room filter)
      try {
        const dbMessages = await prisma.groupMessage.findMany({
          where: {
            isDeleted: false,
            content: { contains: searchTerm, mode: 'insensitive' }
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: {
            sender: { select: { name: true, email: true, image: true } },
            group: { select: { name: true, slug: true } }
          }
        })

        messages = dbMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          username: msg.sender?.name || msg.sender?.email || 'Unknown',
          created_at: msg.createdAt.toISOString(),
          messageType: msg.messageType,
          avatar: msg.sender?.image,
          channel: msg.group?.name
        }))
      } catch (e: any) {
        console.log('Global search error:', e.message)
      }
    }

    return NextResponse.json({
      success: true,
      messages,
      query,
      total: messages.length
    })

  } catch (error: any) {
    console.error('Message search error:', error?.message || error)
    return NextResponse.json({
      error: 'Search failed',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}
