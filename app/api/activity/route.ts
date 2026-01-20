import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/activity - Get activity feed
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor')
    const type = searchParams.get('type') // 'own' | 'following' | 'all'

    let whereClause: any = {}

    if (type === 'own') {
      // Only user's own activity
      whereClause = { userId: session.user.id }
    } else if (type === 'following') {
      // Activity from users we follow
      const following = await prisma.userFollow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true }
      })
      const followingIds = following.map(f => f.followingId)
      whereClause = { userId: { in: followingIds } }
    } else {
      // All activity (own + following)
      const following = await prisma.userFollow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true }
      })
      const followingIds = following.map(f => f.followingId)
      whereClause = { userId: { in: [session.user.id, ...followingIds] } }
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 })
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}

// POST /api/activity - Create activity (internal use)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, title, description, targetType, targetId, link, imageUrl, metadata, isPublic = true } = await request.json()

    if (!type || !title) {
      return NextResponse.json({ error: 'Type and title required' }, { status: 400 })
    }

    const activity = await prisma.activity.create({
      data: {
        userId: session.user.id,
        type,
        title,
        description,
        targetType,
        targetId,
        link,
        imageUrl,
        metadata: metadata || {},
        isPublic
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}

