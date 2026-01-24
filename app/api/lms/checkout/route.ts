import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

// POST - Create checkout session for course purchase
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { courseIds } = body // Array of course IDs to purchase

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json({ error: 'Course IDs are required' }, { status: 400 })
    }

    // Get courses
    const courses = await prisma.course.findMany({
      where: { 
        id: { in: courseIds },
        isPublished: true,
        price: { gt: 0 }
      },
      select: { id: true, title: true, price: true, currency: true, thumbnail: true }
    })

    if (courses.length === 0) {
      return NextResponse.json({ error: 'No valid courses found' }, { status: 404 })
    }

    // Check if user already owns any of these courses
    const existingEnrollments = await prisma.courseEnrollment.findMany({
      where: { userId: user.id, courseId: { in: courseIds } }
    })
    const enrolledIds = new Set(existingEnrollments.map(e => e.courseId))
    const coursesToPurchase = courses.filter(c => !enrolledIds.has(c.id))

    if (coursesToPurchase.length === 0) {
      return NextResponse.json({ error: 'Already enrolled in all selected courses' }, { status: 400 })
    }

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = coursesToPurchase.map(course => ({
      price_data: {
        currency: course.currency.toLowerCase(),
        product_data: {
          name: course.title,
          description: `LiftPlannerPro Course: ${course.title}`,
          images: course.thumbnail ? [course.thumbnail] : [],
        },
        unit_amount: Math.round(course.price * 100), // Convert to pence/cents
      },
      quantity: 1,
    }))

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        courseIds: coursesToPurchase.map(c => c.id).join(','),
        type: 'course_purchase'
      },
      success_url: `${process.env.NEXTAUTH_URL}/lms/courses?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/lms/courses?cancelled=true`,
    })

    // Create pending purchase records
    for (const course of coursesToPurchase) {
      await prisma.coursePurchase.create({
        data: {
          userId: user.id,
          courseId: course.id,
          amount: course.price,
          currency: course.currency,
          stripeSessionId: checkoutSession.id,
          status: 'pending'
        }
      })
    }

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}

// GET - Get cart items
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

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        // Note: CartItem doesn't have a direct relation to Course
        // We'll need to fetch courses separately
      }
    })

    // Get course IDs from cart and fetch course details
    // CartItem only stores userId and courseId, no course relation
    const courseIds = cartItems.map(item => item.courseId)
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, title: true, price: true, currency: true, thumbnail: true }
    })

    const total = courses.reduce((sum, c) => sum + c.price, 0)

    return NextResponse.json({
      items: courses,
      total,
      currency: 'GBP'
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

