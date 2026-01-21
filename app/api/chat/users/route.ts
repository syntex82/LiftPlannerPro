import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// In-memory store for user status (use your database in production)
const userStatus = new Map<number, {
  isOnline: boolean
  lastSeen: Date
  currentRoom?: number
  username: string
  email: string
}>()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    // Get users from database with professional profile data
    try {
      const dbUsers = await prisma.user.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          onlineStatus: true,
          lastSeenAt: true,
          jobTitle: true,
          location: true,
          phone: true,
          about: true,
          skills: true,
          createdAt: true,
          role: true
        },
        orderBy: { name: 'asc' },
        take: 50
      })

      if (dbUsers.length > 0) {
        const users = dbUsers.map((user, index) => ({
          id: index + 1,
          dbId: user.id,
          name: user.name || 'Unknown User',
          email: user.email,
          avatar: user.image,
          isOnline: user.onlineStatus === 'ONLINE',
          status: user.onlineStatus?.toLowerCase() || 'offline',
          statusMessage: user.role === 'ADMIN' ? 'Administrator' : undefined,
          lastSeen: user.lastSeenAt?.toISOString(),
          jobTitle: user.jobTitle || (user.role === 'ADMIN' ? 'Administrator' : 'Team Member'),
          department: user.role === 'ADMIN' ? 'Management' : 'Engineering',
          company: 'Lift Planner Pro',
          location: user.location,
          phone: user.phone,
          bio: user.about,
          skills: user.skills || [],
          joinedAt: user.createdAt?.toISOString()
        }))

        return NextResponse.json(users)
      }
    } catch (dbError) {
      console.log('Database query failed, using fallback users:', dbError)
    }

    // Fallback mock users if database fails
    const users = [
      {
        id: 1,
        name: session?.user?.name || 'Current User',
        email: session?.user?.email || 'user@company.com',
        isOnline: true
      }
    ]

    return NextResponse.json(users)

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Failed to get users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    // Update user online status in database
    try {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          onlineStatus: status === 'online' ? 'ONLINE' : 'OFFLINE',
          lastSeenAt: new Date()
        }
      })
    } catch (dbError) {
      console.error('Failed to update status in database:', dbError)
    }

    return NextResponse.json({
      success: true,
      status: status
    })

  } catch (error) {
    console.error('Update user status error:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
