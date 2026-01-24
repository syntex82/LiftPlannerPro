import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/subscription'

// POST - Add a video to a lesson
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const { courseId, lessonId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { title, videoUrl, description, duration, thumbnailUrl } = body

    if (!title || !videoUrl) {
      return NextResponse.json({ error: 'Title and video URL are required' }, { status: 400 })
    }

    // Verify the lesson belongs to the course
    const lesson = await prisma.courseLesson.findFirst({
      where: { id: lessonId, courseId }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Get next order number
    const maxOrder = await prisma.lessonVideo.aggregate({
      where: { lessonId },
      _max: { order: true }
    })

    const video = await prisma.lessonVideo.create({
      data: {
        lessonId,
        title,
        videoUrl,
        description: description || null,
        duration: duration || null,
        thumbnail: thumbnailUrl || null,
        order: (maxOrder._max.order || 0) + 1
      }
    })

    // Update lesson duration
    const allVideos = await prisma.lessonVideo.findMany({
      where: { lessonId },
      select: { duration: true }
    })
    const totalDuration = allVideos.reduce((sum, v) => sum + (v.duration || 0), 0)
    await prisma.courseLesson.update({
      where: { id: lessonId },
      data: { duration: totalDuration }
    })

    // Update course duration
    const allLessons = await prisma.courseLesson.findMany({
      where: { courseId },
      select: { duration: true }
    })
    const courseDuration = allLessons.reduce((sum, l) => sum + (l.duration || 0), 0)
    await prisma.course.update({
      where: { id: courseId },
      data: { duration: courseDuration }
    })

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Error adding video:', error)
    return NextResponse.json({ error: 'Failed to add video' }, { status: 500 })
  }
}

// GET - List videos for a lesson
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; lessonId: string }> }
) {
  try {
    const { lessonId } = await params
    
    const videos = await prisma.lessonVideo.findMany({
      where: { lessonId },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error listing videos:', error)
    return NextResponse.json({ error: 'Failed to list videos' }, { status: 500 })
  }
}

