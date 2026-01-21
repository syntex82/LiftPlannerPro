import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin, SUBSCRIPTION_CONFIG } from '@/lib/subscription'

// Get base URL with fallback
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://liftplannerpro.org'
}

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)

    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_secret_key_here') {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please set up your Stripe keys in .env.local' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })

    const { priceId, planName } = await req.json()

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    const baseUrl = getBaseUrl()
    console.log('🛒 Checkout using base URL:', baseUrl)

    // Create Checkout Session with 7-day trial
    const checkoutConfig: Stripe.Checkout.SessionCreateParams = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
      metadata: {
        planName: planName,
      },
      // Add 7-day free trial for new subscribers
      subscription_data: {
        trial_period_days: SUBSCRIPTION_CONFIG.trialDays,
      },
    }

    // Add customer email if logged in
    if (session?.user?.email) {
      checkoutConfig.customer_email = session.user.email
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutConfig)

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
