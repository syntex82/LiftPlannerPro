import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/messages/conversations - Get all conversations for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: session.user.id },
          { participant2Id: session.user.id }
        ]
      },
      include: {
        participant1: {
          select: { id: true, name: true, email: true, image: true, onlineStatus: true, lastSeenAt: true }
        },
        participant2: {
          select: { id: true, name: true, email: true, image: true, onlineStatus: true, lastSeenAt: true }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { content: true, createdAt: true, isRead: true, senderId: true }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    })

    // Transform to show the "other" participant
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participant1Id === session.user.id 
        ? conv.participant2 
        : conv.participant1
      const lastMessage = conv.messages[0]
      const unreadCount = conv.messages.filter(m => !m.isRead && m.senderId !== session.user.id).length

      return {
        id: conv.id,
        participant: otherParticipant,
        lastMessage: lastMessage?.content || null,
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
        createdAt: conv.createdAt
      }
    })

    return NextResponse.json(formattedConversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

// POST /api/messages/conversations - Create or get conversation with a user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { participantId } = await request.json()
    if (!participantId) {
      return NextResponse.json({ error: 'Participant ID required' }, { status: 400 })
    }

    // Check if conversation exists (in either direction)
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: session.user.id, participant2Id: participantId },
          { participant1Id: participantId, participant2Id: session.user.id }
        ]
      },
      include: {
        participant1: { select: { id: true, name: true, email: true, image: true, onlineStatus: true } },
        participant2: { select: { id: true, name: true, email: true, image: true, onlineStatus: true } }
      }
    })

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: session.user.id,
          participant2Id: participantId
        },
        include: {
          participant1: { select: { id: true, name: true, email: true, image: true, onlineStatus: true } },
          participant2: { select: { id: true, name: true, email: true, image: true, onlineStatus: true } }
        }
      })
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}

