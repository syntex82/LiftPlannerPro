import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// In-memory store for reactions (fallback if no database)
// Note: In production, reactions should be stored in the database
const messageReactions = new Map<string, { emoji: string, users: string[] }[]>()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - please log in' }, { status: 401 })
    }

    const username = session.user.name || session.user.email || 'Unknown'

    const body = await request.json()
    const { messageId, emoji } = body

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 })
    }

    // Get current reactions for message (use string key for compatibility)
    const messageKey = String(messageId)
    let reactions = messageReactions.get(messageKey) || []

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

    // Update reactions in memory
    messageReactions.set(messageKey, reactions)

    console.log(`✅ Reaction ${emoji} toggled for message ${messageId} by ${username}`)

    return NextResponse.json({
      success: true,
      messageId,
      reactions
    })

  } catch (error: any) {
    console.error('Reaction error:', error?.message || error)
    return NextResponse.json({
      error: 'Failed to add reaction',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
    }

    const reactions = messageReactions.get(messageId) || []

    return NextResponse.json({
      success: true,
      messageId,
      reactions
    })

  } catch (error: any) {
    console.error('Get reactions error:', error?.message || error)
    return NextResponse.json({
      error: 'Failed to get reactions',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}
