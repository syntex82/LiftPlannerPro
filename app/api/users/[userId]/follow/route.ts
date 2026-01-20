import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/users/[userId]/follow - Follow a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    // Check if already following
    const existing = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Already following' }, { status: 400 })
    }

    // Create follow relationship
    await prisma.$transaction([
      prisma.userFollow.create({
        data: {
          followerId: session.user.id,
          followingId: userId
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { followersCount: { increment: 1 } }
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { followingCount: { increment: 1 } }
      })
    ])

    return NextResponse.json({ success: true, following: true })
  } catch (error) {
    console.error('Error following user:', error)
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 })
  }
}

// DELETE /api/users/[userId]/follow - Unfollow a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Check if following
    const existing = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId
        }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not following' }, { status: 400 })
    }

    // Remove follow relationship
    await prisma.$transaction([
      prisma.userFollow.delete({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: userId
          }
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { followersCount: { decrement: 1 } }
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { followingCount: { decrement: 1 } }
      })
    ])

    return NextResponse.json({ success: true, following: false })
  } catch (error) {
    console.error('Error unfollowing user:', error)
    return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 })
  }
}

// GET /api/users/[userId]/follow - Check if following
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ following: false })
    }

    const { userId } = await params

    const existing = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId
        }
      }
    })

    return NextResponse.json({ following: !!existing })
  } catch (error) {
    console.error('Error checking follow status:', error)
    return NextResponse.json({ following: false })
  }
}

