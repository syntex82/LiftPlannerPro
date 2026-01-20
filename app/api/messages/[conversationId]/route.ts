import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/messages/[conversationId] - Get messages in a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const cursor = searchParams.get('cursor')

    // Verify user is participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: session.user.id },
          { participant2Id: session.user.id }
        ]
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const messages = await prisma.directMessage.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 })
    })

    // Mark messages as read
    await prisma.directMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: session.user.id },
        isRead: false
      },
      data: { isRead: true, readAt: new Date() }
    })

    return NextResponse.json(messages.reverse())
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST /api/messages/[conversationId] - Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId } = await params
    const { content, messageType = 'text', media = [] } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 })
    }

    // Verify user is participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: session.user.id },
          { participant2Id: session.user.id }
        ]
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Create message and update conversation
    const [message] = await prisma.$transaction([
      prisma.directMessage.create({
        data: {
          conversationId,
          senderId: session.user.id,
          content: content.trim(),
          messageType,
          media
        },
        include: {
          sender: { select: { id: true, name: true, email: true, image: true } }
        }
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
      })
    ])

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

