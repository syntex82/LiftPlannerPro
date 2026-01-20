import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// In-memory rooms storage (replace with database later)
const roomsStore = [
  { id: 1, name: 'General Chat', type: 'general', unread_count: 0 },
  { id: 2, name: 'Project Discussion', type: 'project', unread_count: 0 },
  { id: 3, name: 'Technical Support', type: 'support', unread_count: 0 }
]

// Helper functions
async function getUserFromSession(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    return session?.user?.email || null
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

async function getUserChatRooms(userId: string) {
  // Return default rooms for now
  return roomsStore
}

async function createChatRoom({ name, type, projectId, createdBy }: any) {
  const newRoom = {
    id: roomsStore.length + 1,
    name,
    type,
    unread_count: 0,
    projectId,
    createdBy
  }
  roomsStore.push(newRoom)
  return newRoom
}

async function addRoomParticipant(roomId: number, userId: string) {
  // In a real implementation, this would add the user to the room participants table
  console.log(`Added user ${userId} to room ${roomId}`)
}

// Get user's chat rooms
export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const userId = await getUserFromSession(request)
    if (!userId) {
      // Return default rooms for anonymous users (array directly)
      return NextResponse.json(roomsStore)
    }

    // Get user's chat rooms
    const rooms = await getUserChatRooms(userId)

    // Return array directly for compatibility
    return NextResponse.json(rooms)

  } catch (error) {
    console.error('Get chat rooms error:', error)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

// Create a new chat room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type = 'general', projectId } = body

    const userId = await getUserFromSession(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create new chat room
    const newRoom = await createChatRoom({
      name,
      type,
      projectId,
      createdBy: userId
    })

    // Add creator as participant
    await addRoomParticipant(newRoom.id, userId)

    return NextResponse.json({ room: newRoom })

  } catch (error) {
    console.error('Create chat room error:', error)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}


