import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users - List users (for DMs, mentions, etc.)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // 'all' | 'followers' | 'following'

    let whereClause: any = {
      id: { not: session.user.id } // Exclude self
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (type === 'followers') {
      const followers = await prisma.userFollow.findMany({
        where: { followingId: session.user.id },
        select: { followerId: true }
      })
      whereClause.id = { in: followers.map(f => f.followerId) }
    } else if (type === 'following') {
      const following = await prisma.userFollow.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true }
      })
      whereClause.id = { in: following.map(f => f.followingId) }
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        username: true,
        headline: true,
        jobTitle: true,
        onlineStatus: true,
        lastSeenAt: true
      },
      take: limit,
      orderBy: { name: 'asc' }
    })

    // Add isFollowing status
    const following = await prisma.userFollow.findMany({
      where: {
        followerId: session.user.id,
        followingId: { in: users.map(u => u.id) }
      },
      select: { followingId: true }
    })
    const followingIds = new Set(following.map(f => f.followingId))

    const usersWithStatus = users.map(user => ({
      ...user,
      isFollowing: followingIds.has(user.id),
      isOnline: user.onlineStatus === 'online'
    }))

    return NextResponse.json(usersWithStatus)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

