import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all approved reviews
    const reviews = await prisma.review.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Calculate aggregate rating
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 5.0

    return NextResponse.json({
      reviews,
      aggregate: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution: {
          5: reviews.filter(r => r.rating === 5).length,
          4: reviews.filter(r => r.rating === 4).length,
          3: reviews.filter(r => r.rating === 3).length,
          2: reviews.filter(r => r.rating === 2).length,
          1: reviews.filter(r => r.rating === 1).length,
        }
      }
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rating, title, content } = await request.json()

    if (!rating || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already reviewed
    const existingReview = await prisma.review.findFirst({
      where: { userId: user.id }
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You have already submitted a review' }, { status: 400 })
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        rating,
        title: title.trim(),
        content: content.trim(),
        approved: true, // Auto-approve for now, add moderation later
        helpful: 0
      }
    })

    // Log the review submission
    await prisma.securityLog.create({
      data: {
        action: 'REVIEW_SUBMITTED',
        resource: 'review',
        details: JSON.stringify({
          reviewId: review.id,
          rating,
          title: title.substring(0, 50)
        }),
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Unknown',
        success: true,
        riskLevel: 'LOW'
      }
    })

    return NextResponse.json({ 
      success: true, 
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        createdAt: review.createdAt
      }
    })

  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
