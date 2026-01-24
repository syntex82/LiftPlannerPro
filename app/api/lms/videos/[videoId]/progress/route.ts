import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Update video watch progress
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params
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

    const body = await request.json()
    const { watchedSeconds, totalSeconds } = body

    if (typeof watchedSeconds !== 'number' || typeof totalSeconds !== 'number') {
      return NextResponse.json({ error: 'Invalid progress data' }, { status: 400 })
    }

    // Check if video exists and get lesson info
    const video = await prisma.lessonVideo.findUnique({
      where: { id: videoId },
      include: { lesson: { select: { id: true, courseId: true } } }
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Determine if video is completed (watched 90%+)
    const completionThreshold = 0.9
    const completed = totalSeconds > 0 && (watchedSeconds / totalSeconds) >= completionThreshold

    // Update or create progress
    const progress = await prisma.videoProgress.upsert({
      where: { userId_videoId: { userId: user.id, videoId } },
      create: {
        userId: user.id,
        videoId,
        watchedSeconds,
        totalSeconds,
        completed,
        completedAt: completed ? new Date() : null
      },
      update: {
        watchedSeconds: Math.max(watchedSeconds, 0),
        totalSeconds,
        completed,
        completedAt: completed ? new Date() : undefined,
        lastWatchedAt: new Date()
      }
    })

    // If video completed, update lesson progress
    if (completed && video.lesson) {
      await updateLessonProgress(user.id, video.lesson.id, video.lesson.courseId)
    }

    return NextResponse.json({
      progress,
      completed,
      percentage: Math.round((watchedSeconds / totalSeconds) * 100)
    })
  } catch (error) {
    console.error('Error updating video progress:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}

// GET - Get video progress
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params
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

    const progress = await prisma.videoProgress.findUnique({
      where: { userId_videoId: { userId: user.id, videoId } }
    })

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Error fetching video progress:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

// Helper function to update lesson and course progress
async function updateLessonProgress(userId: string, lessonId: string, courseId: string) {
  // Check if all videos in lesson are completed
  const lesson = await prisma.courseLesson.findUnique({
    where: { id: lessonId },
    include: { videos: { select: { id: true } } }
  })

  if (!lesson) return

  const completedVideos = await prisma.videoProgress.count({
    where: {
      userId,
      videoId: { in: lesson.videos.map(v => v.id) },
      completed: true
    }
  })

  const lessonCompleted = completedVideos >= lesson.videos.length

  if (lessonCompleted) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, completed: true, completedAt: new Date() },
      update: { completed: true, completedAt: new Date() }
    })

    // Update overall course progress
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: { select: { id: true } } }
    })

    if (course) {
      const completedLessons = await prisma.lessonProgress.count({
        where: { userId, lessonId: { in: course.lessons.map(l => l.id) }, completed: true }
      })
      const progress = Math.round((completedLessons / course.lessons.length) * 100)

      await prisma.lMSProgress.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: { userId, courseId, progress, lessonsCompleted: completedLessons, totalLessons: course.lessons.length },
        update: { progress, lessonsCompleted: completedLessons, lastAccessedAt: new Date() }
      })
    }
  }
}

