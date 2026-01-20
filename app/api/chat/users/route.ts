import { NextRequest, NextResponse } from 'next/server'

// In-memory store for user status (use your database in production)
const userStatus = new Map<number, {
  isOnline: boolean
  lastSeen: Date
  currentRoom?: number
  username: string
  email: string
}>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    // TODO: Get users from your database
    // For now, return mock users
    const users = [
      {
        id: 1,
        name: 'John Smith',
        email: 'john@company.com',
        isOnline: true
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        isOnline: false
      },
      {
        id: 3,
        name: 'Mike Wilson',
        email: 'mike@company.com',
        isOnline: true
      }
    ]

    // If roomId provided, filter users in that room
    if (roomId) {
      // TODO: Filter users who are participants in the room
      // SELECT u.* FROM users u 
      // JOIN chat_participants p ON u.id = p.user_id 
      // WHERE p.room_id = ?
    }

    // Return array directly for compatibility
    return NextResponse.json(users)

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Failed to get users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { status, roomId } = body

    const userId = await getUserFromSession(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update user status
    const currentStatus = userStatus.get(userId) || {
      isOnline: false,
      lastSeen: new Date(),
      username: 'Current User',
      email: 'user@company.com'
    }

    userStatus.set(userId, {
      ...currentStatus,
      isOnline: status === 'online',
      lastSeen: new Date(),
      currentRoom: roomId
    })

    // TODO: Update database
    // UPDATE user_status SET 
    //   is_online = ?, 
    //   last_seen = CURRENT_TIMESTAMP, 
    //   current_room_id = ?
    // WHERE user_id = ?

    // Broadcast status update to all connected users
    // TODO: Implement SSE broadcast for user status

    return NextResponse.json({ 
      success: true,
      status: userStatus.get(userId)
    })

  } catch (error) {
    console.error('Update user status error:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}

async function getUserFromSession(request: NextRequest) {
  // TODO: Implement with your auth system
  return 1 // placeholder
}
