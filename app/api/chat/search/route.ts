import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!roomId || !query) {
      return NextResponse.json({ error: 'Room ID and query required' }, { status: 400 })
    }

    // TODO: Get user from session for authorization
    const userId = await getUserFromSession(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Search messages in your database
    // Example SQL query:
    // SELECT m.*, u.name as username 
    // FROM chat_messages m
    // JOIN users u ON m.user_id = u.id
    // WHERE m.room_id = ? 
    //   AND (m.content ILIKE ? OR u.name ILIKE ?)
    // ORDER BY m.created_at DESC
    // LIMIT ?

    const searchTerm = `%${query}%`
    const messages = await searchMessagesInDB(parseInt(roomId), query, limit)

    return NextResponse.json({ 
      messages,
      query,
      total: messages.length
    })

  } catch (error) {
    console.error('Message search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

async function searchMessagesInDB(roomId: number, query: string, limit: number) {
  // TODO: Implement with your actual database
  // This is a placeholder that returns mock search results
  
  const mockMessages = [
    {
      id: 1,
      content: `This message contains the search term: ${query}`,
      username: 'John Smith',
      created_at: new Date().toISOString(),
      messageType: 'text'
    },
    {
      id: 2,
      content: `Another message with ${query} in it`,
      username: 'Sarah Johnson',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      messageType: 'text'
    }
  ]

  // Filter messages that contain the query (case-insensitive)
  return mockMessages.filter(msg => 
    msg.content.toLowerCase().includes(query.toLowerCase()) ||
    msg.username.toLowerCase().includes(query.toLowerCase())
  ).slice(0, limit)
}

async function getUserFromSession(request: NextRequest) {
  // TODO: Implement with your auth system
  return 1 // placeholder
}
