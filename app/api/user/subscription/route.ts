import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSubscriptionStatus, isAdmin } from '@/lib/subscription'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin first
    if (isAdmin(session.user.email)) {
      return NextResponse.json({
        isAdmin: true,
        hasAccess: true,
        inTrial: false,
        trialDaysLeft: 0,
        subscriptionTier: 'admin',
        needsPayment: false,
      })
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        subscription: true,
        trialEndsAt: true,
        createdAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get subscription status
    const status = getSubscriptionStatus(
      session.user.email,
      user.subscription,
      user.trialEndsAt
    )

    // Add trial expired flag
    const trialExpired = user.subscription === 'trial' && 
      user.trialEndsAt && 
      new Date() > new Date(user.trialEndsAt)

    return NextResponse.json({
      ...status,
      trialExpired,
      trialEndsAt: user.trialEndsAt,
    })

  } catch (error) {
    console.error('Subscription check error:', error)
    return NextResponse.json({ error: 'Failed to check subscription' }, { status: 500 })
  }
}

