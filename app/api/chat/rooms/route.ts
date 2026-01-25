import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Default rooms (fallback if database groups don't exist)
const defaultRooms = [
  { id: 1, name: 'General', type: 'channel', icon: 'hash', unread_count: 0, description: 'General discussion for all team members', category: 'TEAM' },
  { id: 2, name: 'Project Discussion', type: 'channel', icon: 'folder', unread_count: 0, description: 'Discuss lift plans and CAD projects', category: 'PROJECT' },
  { id: 3, name: 'Technical Support', type: 'channel', icon: 'help-circle', unread_count: 0, description: 'Get help with technical issues', category: 'SUPPORT' },
  { id: 4, name: 'Live Video', type: 'channel', icon: 'video', unread_count: 0, description: 'Join video calls and screen sharing sessions', category: 'VIDEO' },
  { id: 5, name: 'Announcements', type: 'channel', icon: 'megaphone', unread_count: 0, description: 'Important announcements and updates', category: 'ANNOUNCEMENT' }
]

// Get user's chat rooms (from database groups)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Try to fetch from database
    try {
      const groups = await prisma.group.findMany({
        where: {
          OR: [
            { type: 'PUBLIC' },
            { type: 'SYSTEM' },
            ...(session?.user?.id ? [{ members: { some: { userId: session.user.id } } }] : [])
          ]
        },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { content: true, createdAt: true }
          },
          _count: { select: { members: true, messages: true } }
        },
        orderBy: { createdAt: 'asc' }
      })

      if (groups.length > 0) {
        // Map database groups to room format
        const rooms = groups.map((group, index) => ({
          id: index + 1,
          dbId: group.id,
          name: group.name,
          type: 'channel',
          icon: group.icon || 'hash',
          unread_count: 0,
          description: group.description,
          category: group.category,
          memberCount: group._count.members,
          messageCount: group._count.messages,
          lastMessage: group.messages[0]?.content || null,
          lastMessageTime: group.messages[0]?.createdAt?.toISOString() || null
        }))
        return NextResponse.json(rooms)
      }
    } catch (dbError) {
      // Database might not have the Group table yet, continue with fallback
      console.log('Groups table not found, using fallback rooms')
    }

    // Fallback to default rooms
    return NextResponse.json(defaultRooms)

  } catch (error) {
    console.error('Get chat rooms error:', error)
    return NextResponse.json(defaultRooms)
  }
}

// Create a new chat room
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, icon = 'hash', type = 'PUBLIC', category = 'TEAM' } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Room name required' }, { status: 400 })
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Create group in database
    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        icon,
        type,
        category,
        ownerId: session.user.id,
        members: {
          create: { userId: session.user.id, role: 'OWNER' }
        }
      }
    })

    return NextResponse.json({
      id: 999, // Placeholder ID for frontend
      dbId: group.id,
      name: group.name,
      type: 'channel',
      icon: group.icon,
      unread_count: 0,
      description: group.description,
      category: group.category
    })

  } catch (error: any) {
    console.error('Create chat room error:', error)
    // Return more specific error message
    const errorMessage = error?.message || 'Failed to create room'
    const isDbError = errorMessage.includes('does not exist') || errorMessage.includes('relation')
    if (isDbError) {
      return NextResponse.json({
        error: 'Database table not found. Please run: npx prisma db push'
      }, { status: 500 })
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}


