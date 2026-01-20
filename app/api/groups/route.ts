import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/groups - Get all groups user has access to
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get public/system groups + groups user is a member of
    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { type: 'PUBLIC' },
          { type: 'SYSTEM' },
          { members: { some: { userId: session.user.id } } }
        ]
      },
      include: {
        owner: { select: { id: true, name: true, image: true } },
        members: { select: { userId: true, role: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { content: true, createdAt: true, senderId: true }
        },
        _count: { select: { members: true, messages: true } }
      },
      orderBy: { createdAt: 'asc' }
    })

    const formattedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      slug: group.slug,
      description: group.description,
      icon: group.icon,
      type: group.type,
      category: group.category,
      owner: group.owner,
      memberCount: group._count.members,
      messageCount: group._count.messages,
      lastMessage: group.messages[0] || null,
      isMember: group.members.some(m => m.userId === session.user.id),
      myRole: group.members.find(m => m.userId === session.user.id)?.role || null,
      createdAt: group.createdAt
    }))

    return NextResponse.json(formattedGroups)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}

// POST /api/groups - Create a new group
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, icon, type = 'PUBLIC', category = 'TEAM' } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Group name required' }, { status: 400 })
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug exists
    const existing = await prisma.group.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Group name already taken' }, { status: 400 })
    }

    // Create group with owner as first member
    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        icon: icon || 'users',
        type,
        category,
        ownerId: session.user.id,
        members: {
          create: { userId: session.user.id, role: 'OWNER' }
        }
      },
      include: {
        owner: { select: { id: true, name: true, image: true } },
        _count: { select: { members: true } }
      }
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}

