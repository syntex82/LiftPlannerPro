import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/subscription'

// GET - Get single course with lessons
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const session = await getServerSession(authOptions)
    const userIsAdmin = isAdmin(session?.user?.email)

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: { id: true, name: true, image: true, headline: true } },
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          include: {
            videos: { orderBy: { order: 'asc' } },
            quizzes: { select: { id: true, title: true } }
          }
        },
        quizzes: { where: { lessonId: null }, select: { id: true, title: true, passingScore: true } },
        _count: { select: { lessons: true, enrollments: true } }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if course is published or user is admin
    if (!course.isPublished && !userIsAdmin) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check enrollment and progress for logged-in users
    let enrollment = null
    let progress = null
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })
      if (user) {
        enrollment = await prisma.courseEnrollment.findUnique({
          where: { userId_courseId: { userId: user.id, courseId } }
        })
        progress = await prisma.lMSProgress.findUnique({
          where: { userId_courseId: { userId: user.id, courseId } }
        })
      }
    }

    return NextResponse.json({
      course,
      isEnrolled: !!enrollment,
      enrollment,
      progress
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}

// PUT - Update course (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title, description, shortDescription, category, difficulty,
      price, currency, thumbnail, previewVideoUrl,
      requirements, learningOutcomes, tags, isPublished, isFeatured
    } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription
    if (category !== undefined) updateData.category = category
    if (difficulty !== undefined) updateData.difficulty = difficulty
    if (price !== undefined) updateData.price = price
    if (currency !== undefined) updateData.currency = currency
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail
    if (previewVideoUrl !== undefined) updateData.previewVideoUrl = previewVideoUrl
    if (requirements !== undefined) updateData.requirements = requirements
    if (learningOutcomes !== undefined) updateData.learningOutcomes = learningOutcomes
    if (tags !== undefined) updateData.tags = tags
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured
    
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished
      if (isPublished) updateData.publishedAt = new Date()
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: {
        instructor: { select: { id: true, name: true, image: true } }
      }
    })

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

// DELETE - Delete course (admin only)
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

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await prisma.course.delete({ where: { id: courseId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}

