import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/[userId] - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { userId } = await params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        username: true,
        headline: true,
        about: true,
        jobTitle: true,
        location: true,
        website: true,
        coverImage: true,
        skills: true,
        interests: true,
        socialLinks: true,
        isPublic: true,
        followersCount: true,
        followingCount: true,
        onlineStatus: true,
        lastSeenAt: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if profile is private
    if (!user.isPublic && session?.user?.id !== userId) {
      return NextResponse.json({
        id: user.id,
        name: user.name,
        image: user.image,
        isPublic: false,
        followersCount: user.followersCount,
        followingCount: user.followingCount
      })
    }

    // Check if current user is following
    let isFollowing = false
    if (session?.user?.id && session.user.id !== userId) {
      const follow = await prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: userId
          }
        }
      })
      isFollowing = !!follow
    }

    return NextResponse.json({
      ...user,
      isFollowing,
      isOwnProfile: session?.user?.id === userId
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

// PATCH /api/users/[userId] - Update user profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Can only update own profile
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name, username, headline, about, jobTitle, location,
      website, phone, coverImage, skills, interests, socialLinks, isPublic
    } = body

    // Check username uniqueness if changing
    if (username) {
      const existing = await prisma.user.findFirst({
        where: { username, id: { not: userId } }
      })
      if (existing) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(username !== undefined && { username }),
        ...(headline !== undefined && { headline }),
        ...(about !== undefined && { about }),
        ...(jobTitle !== undefined && { jobTitle }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(phone !== undefined && { phone }),
        ...(coverImage !== undefined && { coverImage }),
        ...(skills !== undefined && { skills }),
        ...(interests !== undefined && { interests }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(isPublic !== undefined && { isPublic })
      },
      select: {
        id: true, name: true, email: true, image: true, username: true,
        headline: true, about: true, jobTitle: true, location: true,
        website: true, coverImage: true, skills: true, interests: true,
        socialLinks: true, isPublic: true, followersCount: true, followingCount: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

