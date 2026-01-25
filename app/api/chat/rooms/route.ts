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

// Valid enum values
const validGroupTypes = ['PUBLIC', 'PRIVATE', 'SYSTEM']
const validGroupCategories = ['TEAM', 'PROJECT', 'SUPPORT', 'ANNOUNCEMENT', 'VIDEO']

// Create a new chat room
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - please log in' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, icon = 'hash' } = body

    // Validate and normalize type - convert 'channel' to 'PUBLIC' for backwards compatibility
    let type = body.type || 'PUBLIC'
    if (type === 'channel') type = 'PUBLIC'
    if (!validGroupTypes.includes(type)) {
      type = 'PUBLIC'
    }

    // Validate and normalize category
    let category = body.category || 'TEAM'
    if (!validGroupCategories.includes(category)) {
      category = 'TEAM'
    }

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Room name required' }, { status: 400 })
    }

    // Generate slug from name
    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Add timestamp to make slug unique
    const slug = `${baseSlug}-${Date.now()}`

    console.log(`📝 Creating channel: ${name} (slug: ${slug}, type: ${type}, category: ${category})`)

    // Create group in database
    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        icon,
        type: type as any,
        category: category as any,
        ownerId: session.user.id,
        members: {
          create: { userId: session.user.id, role: 'OWNER' }
        }
      }
    })

    console.log(`✅ Channel created: ${group.name} (id: ${group.id})`)

    return NextResponse.json({
      success: true,
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
    const errorMessage = error?.message || 'Failed to create room'

    // Check for unique constraint violation (slug already exists)
    if (errorMessage.includes('Unique constraint') || errorMessage.includes('unique')) {
      return NextResponse.json({
        error: 'A channel with this name already exists. Please choose a different name.'
      }, { status: 400 })
    }

    // Check for database table not found
    const isDbError = errorMessage.includes('does not exist') || errorMessage.includes('relation')
    if (isDbError) {
      return NextResponse.json({
        error: 'Database tables not found. Please run: npx prisma db push on your server'
      }, { status: 500 })
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}


