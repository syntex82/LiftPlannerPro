import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/subscription'

// POST - Enroll in a course (for free courses or admin enrollment)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
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

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, price: true, isPublished: true }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (!course.isPublished && !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Course not available' }, { status: 404 })
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } }
    })

    if (existingEnrollment) {
      return NextResponse.json({ 
        error: 'Already enrolled in this course',
        enrollment: existingEnrollment 
      }, { status: 400 })
    }

    // For paid courses, check if payment exists or user is admin
    if (course.price > 0 && !isAdmin(session.user.email)) {
      const purchase = await prisma.coursePurchase.findFirst({
        where: { userId: user.id, courseId, status: 'completed' }
      })
      if (!purchase) {
        return NextResponse.json({ 
          error: 'Payment required',
          price: course.price,
          requiresPayment: true
        }, { status: 402 })
      }
    }

    // Create enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: user.id,
        courseId,
        source: course.price === 0 ? 'free' : 'purchase'
      }
    })

    // Initialize progress
    const courseWithLessons = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: { select: { id: true } },
        quizzes: { where: { lessonId: null }, select: { id: true } }
      }
    })

    await prisma.lMSProgress.create({
      data: {
        userId: user.id,
        courseId,
        progress: 0,
        totalLessons: courseWithLessons?.lessons.length || 0,
        totalQuizzes: courseWithLessons?.quizzes.length || 0
      }
    })

    return NextResponse.json({ 
      success: true,
      enrollment,
      message: `Successfully enrolled in ${course.title}`
    }, { status: 201 })
  } catch (error) {
    console.error('Error enrolling in course:', error)
    return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 })
  }
}

// DELETE - Unenroll from a course (admin can unenroll anyone)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId')
    const userIsAdmin = isAdmin(session.user.email)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Determine which user to unenroll
    const enrollmentUserId = userIsAdmin && targetUserId ? targetUserId : user.id

    // Only admins can unenroll other users
    if (targetUserId && targetUserId !== user.id && !userIsAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await prisma.courseEnrollment.delete({
      where: { userId_courseId: { userId: enrollmentUserId, courseId } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unenrolling from course:', error)
    return NextResponse.json({ error: 'Failed to unenroll' }, { status: 500 })
  }
}

