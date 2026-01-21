import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Room ID to slug mapping (same as in messages/route.ts)
const roomIdToSlug: { [key: number]: string } = {
  1: 'general',
  2: 'project-discussion',
  3: 'technical-support',
  4: 'live-video',
  5: 'announcements'
}

// Delete a chat room
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const roomId = parseInt(id)

    if (isNaN(roomId)) {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 })
    }

    // Check if this is a default room (can't delete those)
    const slug = roomIdToSlug[roomId]
    if (slug) {
      return NextResponse.json({ error: 'Cannot delete default channels' }, { status: 403 })
    }

    // For custom rooms, we need to find the group by some identifier
    // Since custom rooms have id > 5, try to find a group
    try {
      // Get all groups to find the one to delete
      const groups = await prisma.group.findMany({
        orderBy: { createdAt: 'asc' }
      })

      // Calculate which group this maps to (roomId = index + 1)
      // For custom rooms added after the 5 defaults
      const groupIndex = roomId - 1
      
      if (groupIndex >= 0 && groupIndex < groups.length) {
        const groupToDelete = groups[groupIndex]
        
        // Check if user is owner or admin
        const membership = await prisma.groupMember.findFirst({
          where: {
            groupId: groupToDelete.id,
            userId: session.user.id,
            role: { in: ['OWNER', 'ADMIN'] }
          }
        })

        // Also check if user is site admin
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { role: true }
        })

        if (!membership && user?.role !== 'admin') {
          return NextResponse.json({ error: 'Only channel owners or admins can delete channels' }, { status: 403 })
        }

        // Delete all messages in the group first
        await prisma.groupMessage.deleteMany({
          where: { groupId: groupToDelete.id }
        })

        // Delete all memberships
        await prisma.groupMember.deleteMany({
          where: { groupId: groupToDelete.id }
        })

        // Delete the group
        await prisma.group.delete({
          where: { id: groupToDelete.id }
        })

        return NextResponse.json({ success: true, deletedId: roomId })
      }

      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })

    } catch (dbError) {
      console.error('Database error deleting channel:', dbError)
      return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 })
    }

  } catch (error) {
    console.error('Delete chat room error:', error)
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
  }
}

