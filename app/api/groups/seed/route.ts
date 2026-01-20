import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Default groups to create
const defaultGroups = [
  {
    name: 'General',
    slug: 'general',
    description: 'General discussion for all team members. Share updates, ask questions, and connect with colleagues.',
    icon: 'hash',
    type: 'SYSTEM' as const,
    category: 'TEAM' as const
  },
  {
    name: 'Project Discussion',
    slug: 'project-discussion',
    description: 'Discuss lift plans, CAD projects, and collaborate on ongoing work.',
    icon: 'folder',
    type: 'SYSTEM' as const,
    category: 'PROJECT' as const
  },
  {
    name: 'Technical Support',
    slug: 'technical-support',
    description: 'Get help with technical issues, software questions, and troubleshooting.',
    icon: 'help-circle',
    type: 'SYSTEM' as const,
    category: 'SUPPORT' as const
  },
  {
    name: 'Live Video',
    slug: 'live-video',
    description: 'Join video calls, screen sharing sessions, and real-time collaboration.',
    icon: 'video',
    type: 'SYSTEM' as const,
    category: 'VIDEO' as const
  },
  {
    name: 'Announcements',
    slug: 'announcements',
    description: 'Important announcements and updates from the team. Admin posts only.',
    icon: 'megaphone',
    type: 'SYSTEM' as const,
    category: 'ANNOUNCEMENT' as const
  }
]

// POST /api/groups/seed - Create default groups (admin only)
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const results = []

    for (const groupData of defaultGroups) {
      // Check if group already exists
      const existing = await prisma.group.findUnique({
        where: { slug: groupData.slug }
      })

      if (existing) {
        results.push({ ...groupData, status: 'exists' })
        continue
      }

      // Create the group
      const group = await prisma.group.create({
        data: {
          ...groupData,
          ownerId: session.user.id,
          members: {
            create: { userId: session.user.id, role: 'OWNER' }
          }
        }
      })

      results.push({ ...group, status: 'created' })
    }

    return NextResponse.json({
      message: 'Default groups seeded',
      groups: results
    })
  } catch (error) {
    console.error('Error seeding groups:', error)
    return NextResponse.json({ error: 'Failed to seed groups' }, { status: 500 })
  }
}

// GET /api/groups/seed - Check if default groups exist
export async function GET() {
  try {
    const existingGroups = await prisma.group.findMany({
      where: { slug: { in: defaultGroups.map(g => g.slug) } },
      select: { slug: true, name: true }
    })

    return NextResponse.json({
      total: defaultGroups.length,
      existing: existingGroups.length,
      missing: defaultGroups.length - existingGroups.length,
      groups: existingGroups
    })
  } catch (error) {
    console.error('Error checking groups:', error)
    return NextResponse.json({ error: 'Failed to check groups' }, { status: 500 })
  }
}

