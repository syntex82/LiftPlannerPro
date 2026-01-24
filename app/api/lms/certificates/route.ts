import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/subscription'

// GET - List user's certificates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userIsAdmin = isAdmin(session.user.email)

    // Admin can view any user's certificates
    const targetUserId = userIsAdmin && userId ? userId : user.id

    const certificates = await prisma.certificate.findMany({
      where: { userId: targetUserId },
      include: {
        course: { select: { id: true, title: true, thumbnail: true } }
      },
      orderBy: { issuedAt: 'desc' }
    })

    return NextResponse.json({ certificates })
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
  }
}

// POST - Generate certificate for a completed course
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if user has completed the course
    const progress = await prisma.lMSProgress.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } }
    })

    if (!progress?.completed) {
      return NextResponse.json({ 
        error: 'Course not completed',
        progress: progress?.progress || 0
      }, { status: 400 })
    }

    // Check if certificate already exists
    const existingCert = await prisma.certificate.findFirst({
      where: { userId: user.id, courseId }
    })

    if (existingCert) {
      return NextResponse.json({ 
        certificate: existingCert,
        message: 'Certificate already exists'
      })
    }

    // Generate unique certificate number
    const certNumber = `LPP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        userId: user.id,
        courseId,
        certificateNumber: certNumber,
        studentName: user.name || 'Student',
        courseName: course.title,
        completionDate: progress.completedAt || new Date(),
        verificationUrl: `https://liftplannerpro.org/verify/${certNumber}`
      }
    })

    return NextResponse.json({ 
      certificate,
      message: 'Certificate generated successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error generating certificate:', error)
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 })
  }
}

