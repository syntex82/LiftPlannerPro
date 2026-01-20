import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// In-memory store for real-time updates
const messageSubscribers = new Map<string, Set<(data: any) => void>>()

async function getMessagesFromDB(roomId: number) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        roomId: roomId
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 50,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return messages.map(message => ({
      id: message.id,
      content: message.content,
      username: message.user?.name || message.user?.email || 'Unknown',
      messageType: message.messageType,
      created_at: message.createdAt.toISOString(),
      replyTo: message.replyTo
    }))
  } catch (error) {
    console.error('Database error getting messages:', error)
    return []
  }
}

async function insertMessageToDB({ roomId, userId, content, messageType, replyTo }: any) {
  try {
    // Get user by email to get their ID
    const user = await prisma.user.findUnique({
      where: { email: userId },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const message = await prisma.chatMessage.create({
      data: {
        content,
        messageType: messageType || 'text',
        roomId,
        replyTo,
        userId: user.id
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

    return {
      id: message.id,
      content: message.content,
      username: message.user?.name || message.user?.email || 'Unknown',
      messageType: message.messageType,
      created_at: message.createdAt.toISOString(),
      replyTo: message.replyTo
    }
  } catch (error) {
    console.error('Database error inserting message:', error)
    throw error
  }
}

// Helper functions
async function getUserFromSession(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    return session?.user?.email || 'anonymous'
  } catch (error) {
    console.error('Session error:', error)
    return 'anonymous'
  }
}





// Get messages for a room
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const lastMessageId = searchParams.get('lastMessageId')
    const isSSE = searchParams.get('stream') === 'true'

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
    }

    // For SSE streaming
    if (isSSE) {
      const stream = new ReadableStream({
        start(controller) {
          const roomKey = `room-${roomId}`
          
          if (!messageSubscribers.has(roomKey)) {
            messageSubscribers.set(roomKey, new Set())
          }

          const subscriber = (data: any) => {
            const sseData = `data: ${JSON.stringify(data)}\n\n`
            controller.enqueue(new TextEncoder().encode(sseData))
          }

          messageSubscribers.get(roomKey)?.add(subscriber)

          // Send initial connection message
          subscriber({ type: 'connected', roomId })

          // Cleanup on close
          request.signal.addEventListener('abort', () => {
            messageSubscribers.get(roomKey)?.delete(subscriber)
            if (messageSubscribers.get(roomKey)?.size === 0) {
              messageSubscribers.delete(roomKey)
            }
            controller.close()
          })
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control'
        }
      })
    }

    // Regular message fetch
    const messages = await getMessagesFromDB(parseInt(roomId))
    
    return NextResponse.json({ messages })

  } catch (error) {
    console.error('Chat messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// Send a new message
export async function POST(request: NextRequest) {
  try {
    console.log('📨 Received POST request to send message')

    const body = await request.json()
    const { roomId, content, messageType = 'text', replyTo } = body

    console.log('📋 Message data:', { roomId, content, messageType, replyTo })

    // Validate required fields
    if (!roomId || !content) {
      console.error('❌ Missing required fields:', { roomId, content })
      return NextResponse.json({ error: 'Room ID and content are required' }, { status: 400 })
    }

    // Get user from session/auth
    const userId = await getUserFromSession(request)
    console.log('👤 User from session:', userId)

    if (!userId || userId === 'anonymous') {
      console.error('❌ Unauthorized user:', userId)
      return NextResponse.json({ error: 'Unauthorized - please log in' }, { status: 401 })
    }

    // Insert message to database
    console.log('💾 Inserting message to database...')
    const newMessage = await insertMessageToDB({
      roomId: parseInt(roomId),
      userId,
      content,
      messageType,
      replyTo
    })
    console.log('✅ Message inserted:', newMessage)

    // Broadcast to all subscribers in this room
    const roomKey = `room-${roomId}`
    const subscribers = messageSubscribers.get(roomKey)
    console.log(`📡 Broadcasting to ${subscribers?.size || 0} subscribers`)

    if (subscribers) {
      const messageData = {
        type: 'new_message',
        message: newMessage
      }

      subscribers.forEach(subscriber => {
        try {
          subscriber(messageData)
        } catch (error) {
          console.error('Error broadcasting message:', error)
        }
      })
    }

    return NextResponse.json({ message: newMessage })

  } catch (error: any) {
    console.error('💥 Send message error:', error)
    return NextResponse.json({
      error: 'Failed to send message',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}

// Delete a message
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Received DELETE request for message')

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')
    const roomId = searchParams.get('roomId')

    if (!messageId || !roomId) {
      return NextResponse.json({ error: 'Message ID and Room ID required' }, { status: 400 })
    }

    // Get user from session
    const userId = await getUserFromSession(request)
    if (!userId || userId === 'anonymous') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the message to verify ownership
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        user: {
          select: { email: true }
        }
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if user owns the message
    if (message.user.email !== userId) {
      return NextResponse.json({ error: 'Unauthorized - you can only delete your own messages' }, { status: 403 })
    }

    // Delete the message
    await prisma.chatMessage.delete({
      where: { id: messageId }
    })

    console.log('✅ Message deleted:', messageId)

    // Broadcast deletion to all subscribers
    const roomKey = `room-${roomId}`
    const subscribers = messageSubscribers.get(roomKey)

    if (subscribers) {
      const messageData = {
        type: 'message_deleted',
        messageId: messageId
      }

      subscribers.forEach(subscriber => {
        try {
          subscriber(messageData)
        } catch (error) {
          console.error('Error broadcasting deletion:', error)
        }
      })
    }

    return NextResponse.json({ success: true, messageId })

  } catch (error: any) {
    console.error('💥 Delete message error:', error)
    return NextResponse.json({
      error: 'Failed to delete message',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}


