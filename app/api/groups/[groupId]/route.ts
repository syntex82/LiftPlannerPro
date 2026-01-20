import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/groups/[groupId] - Get group details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { groupId } = await params

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        owner: { select: { id: true, name: true, image: true, onlineStatus: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true, onlineStatus: true, lastSeenAt: true } }
          },
          orderBy: { joinedAt: 'asc' }
        },
        _count: { select: { members: true, messages: true } }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check access for private groups
    if (group.type === 'PRIVATE') {
      const isMember = group.members.some(m => m.userId === session.user.id)
      if (!isMember) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    return NextResponse.json({
      ...group,
      isMember: group.members.some(m => m.userId === session.user.id),
      myRole: group.members.find(m => m.userId === session.user.id)?.role || null
    })
  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 })
  }
}

// POST /api/groups/[groupId] - Join a group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { groupId } = await params

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: { where: { userId: session.user.id } } }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (group.type === 'PRIVATE') {
      return NextResponse.json({ error: 'Cannot join private group' }, { status: 403 })
    }

    if (group.members.length > 0) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 })
    }

    // Join the group
    const membership = await prisma.groupMember.create({
      data: {
        groupId,
        userId: session.user.id,
        role: 'MEMBER'
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        group: { select: { id: true, name: true, slug: true } }
      }
    })

    return NextResponse.json(membership, { status: 201 })
  } catch (error) {
    console.error('Error joining group:', error)
    return NextResponse.json({ error: 'Failed to join group' }, { status: 500 })
  }
}

// DELETE /api/groups/[groupId] - Leave a group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { groupId } = await params

    // Can't leave if you're the owner
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { ownerId: true }
    })

    if (group?.ownerId === session.user.id) {
      return NextResponse.json({ error: 'Owner cannot leave group' }, { status: 400 })
    }

    await prisma.groupMember.deleteMany({
      where: { groupId, userId: session.user.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error leaving group:', error)
    return NextResponse.json({ error: 'Failed to leave group' }, { status: 500 })
  }
}

