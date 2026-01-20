import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/groups/[groupId]/messages - Get messages in a group
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
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const cursor = searchParams.get('cursor')

    // Check group access
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: { where: { userId: session.user.id } } }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // For private groups, must be a member
    if (group.type === 'PRIVATE' && group.members.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const messages = await prisma.groupMessage.findMany({
      where: { groupId, isDeleted: false },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true, onlineStatus: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 })
    })

    return NextResponse.json(messages.reverse())
  } catch (error) {
    console.error('Error fetching group messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST /api/groups/[groupId]/messages - Send a message to group
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
    const { content, messageType = 'text', media = [], replyToId } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 })
    }

    // Check group access and auto-join if public/system
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: { where: { userId: session.user.id } } }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // For private groups, must be a member
    if (group.type === 'PRIVATE' && group.members.length === 0) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Auto-join public/system groups when sending first message
    if (group.members.length === 0 && (group.type === 'PUBLIC' || group.type === 'SYSTEM')) {
      await prisma.groupMember.create({
        data: {
          groupId,
          userId: session.user.id,
          role: 'MEMBER'
        }
      })
    }

    // For announcement groups, only admins/owners can post
    if (group.category === 'ANNOUNCEMENT') {
      const member = group.members[0]
      if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
        return NextResponse.json({ error: 'Only admins can post in announcements' }, { status: 403 })
      }
    }

    const message = await prisma.groupMessage.create({
      data: {
        groupId,
        senderId: session.user.id,
        content: content.trim(),
        messageType,
        media,
        replyToId
      },
      include: {
        sender: { select: { id: true, name: true, email: true, image: true, onlineStatus: true } }
      }
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending group message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

