import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        subscription: true,
        company: true,
        createdAt: true,
        _count: {
          select: { projects: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Try to get extended profile data if exists
    let extendedProfile: any = null
    try {
      // Dynamic access to avoid type errors when model doesn't exist
      const prismaAny = prisma as any
      if (prismaAny.userProfile) {
        extendedProfile = await prismaAny.userProfile.findUnique({
          where: { userId: user.id }
        })
      }
    } catch {
      // UserProfile model may not exist yet - that's ok
    }

    return NextResponse.json({
      id: user.id,
      name: user.name || '',
      email: user.email,
      avatar: user.image || '',
      role: user.role || 'user',
      subscription: user.subscription || 'trial',
      company: user.company || '',
      joinedDate: user.createdAt.toISOString(),
      projectsCompleted: user._count.projects,
      hoursLogged: 0,
      // Extended profile fields
      phone: extendedProfile?.phone || '',
      location: extendedProfile?.location || '',
      bio: extendedProfile?.bio || '',
      jobTitle: extendedProfile?.jobTitle || '',
      department: extendedProfile?.department || '',
      skills: extendedProfile?.skills ? JSON.parse(extendedProfile.skills as string) : [],
      certifications: extendedProfile?.certifications ? JSON.parse(extendedProfile.certifications as string) : []
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, company, phone, location, bio, jobTitle, department, skills, certifications } = body

    // Update basic user info
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name || undefined,
        company: company || undefined
      }
    })

    // Try to update or create extended profile
    try {
      const prismaAny = prisma as any
      if (prismaAny.userProfile) {
        await prismaAny.userProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            phone: phone || '',
            location: location || '',
            bio: bio || '',
            jobTitle: jobTitle || '',
            department: department || '',
            skills: JSON.stringify(skills || []),
            certifications: JSON.stringify(certifications || [])
          },
          update: {
            phone: phone || '',
            location: location || '',
            bio: bio || '',
            jobTitle: jobTitle || '',
            department: department || '',
            skills: JSON.stringify(skills || []),
            certifications: JSON.stringify(certifications || [])
          }
        })
      }
    } catch {
      // UserProfile model may not exist, that's ok
      console.log('Extended profile not available, basic update done')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

