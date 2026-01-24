import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/subscription'

// GET - List courses (public: published courses, admin: all courses)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userIsAdmin = isAdmin(session?.user?.email)
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const featured = searchParams.get('featured') === 'true'
    const enrolled = searchParams.get('enrolled') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {}
    
    // Non-admins can only see published courses
    if (!userIsAdmin) {
      where.isPublished = true
    }
    
    if (category) where.category = category
    if (difficulty) where.difficulty = difficulty
    if (featured) where.isFeatured = true

    // If enrolled filter is set, get only courses user is enrolled in
    if (enrolled && session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })
      if (user) {
        where.enrollments = { some: { userId: user.id, status: 'active' } }
      }
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: { select: { id: true, name: true, image: true } },
          _count: { select: { lessons: true, enrollments: true } }
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset
      }),
      prisma.course.count({ where })
    ])

    // Add enrollment status for logged-in users
    let coursesWithEnrollment = courses
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })
      if (user) {
        const enrollments = await prisma.courseEnrollment.findMany({
          where: { userId: user.id, courseId: { in: courses.map(c => c.id) } },
          select: { courseId: true }
        })
        const enrolledIds = new Set(enrollments.map(e => e.courseId))
        coursesWithEnrollment = courses.map(c => ({
          ...c,
          isEnrolled: enrolledIds.has(c.id)
        }))
      }
    }

    return NextResponse.json({
      courses: coursesWithEnrollment,
      total,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

// POST - Create course (admin only)
export async function POST(request: NextRequest) {
  try {
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
      requirements, learningOutcomes, tags
    } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    // Check if slug exists
    const existingCourse = await prisma.course.findUnique({ where: { slug } })
    const finalSlug = existingCourse ? `${slug}-${Date.now()}` : slug

    const course = await prisma.course.create({
      data: {
        title,
        slug: finalSlug,
        description,
        shortDescription,
        category: category || 'general',
        difficulty: difficulty || 'beginner',
        price: price || 0,
        currency: currency || 'GBP',
        thumbnail,
        previewVideoUrl,
        requirements: requirements || [],
        learningOutcomes: learningOutcomes || [],
        tags: tags || [],
        instructorId: user.id
      },
      include: {
        instructor: { select: { id: true, name: true, image: true } }
      }
    })

    return NextResponse.json({ course }, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}

