import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// In-memory rooms storage (replace with database later)
const roomsStore = [
  { id: 1, name: 'General', type: 'channel', icon: 'hash', unread_count: 0, description: 'General discussion for all team members' },
  { id: 2, name: 'Project Discussion', type: 'channel', icon: 'folder', unread_count: 0, description: 'Discuss lift plans and CAD projects' },
  { id: 3, name: 'Technical Support', type: 'channel', icon: 'help-circle', unread_count: 0, description: 'Get help with technical issues' },
  { id: 4, name: 'Live Video', type: 'channel', icon: 'video', unread_count: 0, description: 'Join video calls and screen sharing sessions' },
  { id: 5, name: 'Announcements', type: 'channel', icon: 'megaphone', unread_count: 0, description: 'Important announcements and updates' }
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
    type: type || 'channel',
    icon: 'hash',
    unread_count: 0,
    description: `Chat room created by ${createdBy}`,
    projectId,
    createdBy
  }
  roomsStore.push(newRoom as any)
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


