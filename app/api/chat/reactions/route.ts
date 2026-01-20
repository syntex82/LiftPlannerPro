import { NextRequest, NextResponse } from 'next/server'

// In-memory store for reactions (use your database in production)
const messageReactions = new Map<number, { emoji: string, users: string[] }[]>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, emoji } = body

    // TODO: Get user from session
    const userId = await getUserFromSession(request)
    const username = 'Current User' // TODO: Get from user data

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current reactions for message
    let reactions = messageReactions.get(messageId) || []

    // Find existing reaction with same emoji
    const existingReaction = reactions.find(r => r.emoji === emoji)

    if (existingReaction) {
      // Toggle user's reaction
      const userIndex = existingReaction.users.indexOf(username)
      if (userIndex > -1) {
        // Remove user's reaction
        existingReaction.users.splice(userIndex, 1)
        // Remove reaction if no users left
        if (existingReaction.users.length === 0) {
          reactions = reactions.filter(r => r.emoji !== emoji)
        }
      } else {
        // Add user's reaction
        existingReaction.users.push(username)
      }
    } else {
      // Add new reaction
      reactions.push({
        emoji,
        users: [username]
      })
    }

    // Update reactions
    messageReactions.set(messageId, reactions)

    // TODO: Update database
    // UPDATE chat_messages SET reactions = ? WHERE id = ?

    // Broadcast reaction update to all room subscribers
    // TODO: Implement SSE broadcast for reactions

    return NextResponse.json({ 
      messageId, 
      reactions 
    })

  } catch (error) {
    console.error('Reaction error:', error)
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = parseInt(searchParams.get('messageId') || '0')

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
    }

    const reactions = messageReactions.get(messageId) || []
    
    return NextResponse.json({ reactions })

  } catch (error) {
    console.error('Get reactions error:', error)
    return NextResponse.json({ error: 'Failed to get reactions' }, { status: 500 })
  }
}

async function getUserFromSession(request: NextRequest) {
  // TODO: Implement with your auth system
  return 1 // placeholder
}
