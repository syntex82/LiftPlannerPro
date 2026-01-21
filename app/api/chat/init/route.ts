import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Default chat groups that should exist
const defaultGroups = [
  { name: 'General', slug: 'general', description: 'General discussion for all team members', icon: 'hash', type: 'PUBLIC', category: 'TEAM' },
  { name: 'Project Discussion', slug: 'project-discussion', description: 'Discuss lift plans and CAD projects', icon: 'folder', type: 'PUBLIC', category: 'PROJECT' },
  { name: 'Technical Support', slug: 'technical-support', description: 'Get help with technical issues', icon: 'help-circle', type: 'PUBLIC', category: 'SUPPORT' },
  { name: 'Live Video', slug: 'live-video', description: 'Join video calls and screen sharing sessions', icon: 'video', type: 'PUBLIC', category: 'VIDEO' },
  { name: 'Announcements', slug: 'announcements', description: 'Important announcements and updates', icon: 'megaphone', type: 'SYSTEM', category: 'ANNOUNCEMENT' }
] as const

// Initialize chat groups - creates default groups if they don't exist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user to use as owner for groups
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('🏗️ Initializing chat groups...')
    
    const results = []
    
    for (const groupData of defaultGroups) {
      try {
        // Check if group already exists
        const existing = await prisma.group.findUnique({
          where: { slug: groupData.slug }
        })

        if (existing) {
          console.log(`✅ Group "${groupData.name}" already exists`)
          results.push({ slug: groupData.slug, status: 'exists', id: existing.id })
        } else {
          // Create the group
          const group = await prisma.group.create({
            data: {
              name: groupData.name,
              slug: groupData.slug,
              description: groupData.description,
              icon: groupData.icon,
              type: groupData.type as any,
              category: groupData.category as any,
              ownerId: user.id,
              members: {
                create: { userId: user.id, role: 'OWNER' }
              }
            }
          })
          console.log(`🆕 Created group "${groupData.name}"`)
          results.push({ slug: groupData.slug, status: 'created', id: group.id })
        }
      } catch (error: any) {
        console.error(`❌ Error creating group "${groupData.name}":`, error.message)
        results.push({ slug: groupData.slug, status: 'error', error: error.message })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Chat groups initialized',
      results
    })

  } catch (error: any) {
    console.error('💥 Chat init error:', error)
    return NextResponse.json({ 
      error: 'Failed to initialize chat', 
      details: error.message 
    }, { status: 500 })
  }
}

// GET endpoint to check current group status
export async function GET(request: NextRequest) {
  try {
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        category: true,
        _count: { select: { members: true, messages: true } }
      }
    })

    const expectedSlugs = defaultGroups.map(g => g.slug)
    const existingSlugs = groups.map(g => g.slug)
    const missingSlugs = expectedSlugs.filter(s => !existingSlugs.includes(s))

    return NextResponse.json({
      initialized: missingSlugs.length === 0,
      groups,
      expectedSlugs,
      missingSlugs,
      message: missingSlugs.length === 0 
        ? 'All chat groups are initialized' 
        : `Missing groups: ${missingSlugs.join(', ')}. Call POST to initialize.`
    })
  } catch (error: any) {
    console.error('💥 Chat status check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check chat status',
      details: error.message,
      initialized: false
    }, { status: 500 })
  }
}

