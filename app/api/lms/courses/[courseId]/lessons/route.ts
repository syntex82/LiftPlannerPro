import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/subscription'

// GET - List lessons for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const session = await getServerSession(authOptions)
    const userIsAdmin = isAdmin(session?.user?.email)

    // Check if course exists and user has access
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, isPublished: true }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (!course.isPublished && !userIsAdmin) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const lessons = await prisma.courseLesson.findMany({
      where: { courseId, isPublished: userIsAdmin ? undefined : true },
      orderBy: { order: 'asc' },
      include: {
        videos: { orderBy: { order: 'asc' } },
        quizzes: { select: { id: true, title: true, passingScore: true } },
        _count: { select: { videos: true } }
      }
    })

    // Get progress for logged-in users
    let lessonsWithProgress = lessons
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })
      if (user) {
        const progress = await prisma.lessonProgress.findMany({
          where: { userId: user.id, lessonId: { in: lessons.map(l => l.id) } }
        })
        const progressMap = new Map(progress.map(p => [p.lessonId, p]))
        lessonsWithProgress = lessons.map(l => ({
          ...l,
          progress: progressMap.get(l.id) || null
        }))
      }
    }

    return NextResponse.json({ lessons: lessonsWithProgress })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
  }
}

// POST - Create lesson (admin only)
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

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, content, duration, isFree, isPublished } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Get the next order number
    const lastLesson = await prisma.courseLesson.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const lesson = await prisma.courseLesson.create({
      data: {
        courseId,
        title,
        description,
        content,
        duration,
        isFree: isFree || false,
        isPublished: isPublished !== false,
        order: (lastLesson?.order || 0) + 1
      }
    })

    // Update course duration
    await updateCourseDuration(courseId)

    return NextResponse.json({ lesson }, { status: 201 })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 })
  }
}

// Helper to update total course duration
async function updateCourseDuration(courseId: string) {
  const lessons = await prisma.courseLesson.findMany({
    where: { courseId },
    select: { duration: true }
  })
  const totalDuration = lessons.reduce((sum, l) => sum + (l.duration || 0), 0)
  await prisma.course.update({
    where: { id: courseId },
    data: { duration: totalDuration }
  })
}

