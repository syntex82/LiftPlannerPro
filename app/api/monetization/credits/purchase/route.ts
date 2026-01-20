import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

// Only initialize Stripe if API key is available
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })
  : null

// Smart affordable credit packages - like buying lunch!
const CREDIT_PACKAGES = {
  'coffee': {
    name: 'Coffee Pack',
    credits: 5,
    price: 3.99, // £3.99 for £5 worth of credits (£1 bonus)
    bonus: 1,
    description: 'Perfect for trying premium features'
  },
  'lunch': {
    name: 'Lunch Pack',
    credits: 12,
    price: 8.99, // £8.99 for £12 worth of credits (£3 bonus)
    bonus: 3,
    description: 'Great for occasional users'
  },
  'dinner': {
    name: 'Dinner Pack',
    credits: 25,
    price: 17.99, // £17.99 for £25 worth of credits (£7 bonus)
    bonus: 7,
    description: 'Best value for regular users'
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current credits
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { credits: true }
    })

    return NextResponse.json({
      packages: CREDIT_PACKAGES,
      currentCredits: user?.credits || 0
    })

  } catch (error) {
    console.error('Credits API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { packageType, paymentMethod = 'stripe' } = await request.json()

    if (!CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES]) {
      return NextResponse.json({ error: 'Invalid package type' }, { status: 400 })
    }

    const creditPackage = CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES]

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create pending transaction
    const transaction = await prisma.creditPurchase.create({
      data: {
        userId: user.id,
        packageType,
        packageName: creditPackage.name,
        creditsAmount: creditPackage.credits,
        price: creditPackage.price,
        paymentMethod,
        status: 'PENDING'
      }
    })

    // In a real implementation, you would:
    // 1. Create Stripe payment intent
    // 2. Return payment URL/client secret
    // 3. Handle webhook to complete transaction

    // For demo purposes, simulate successful payment
    if (paymentMethod === 'demo') {
      // Complete the transaction immediately
      await prisma.creditPurchase.update({
        where: { id: transaction.id },
        data: {
          status: 'COMPLETED',
          paymentId: `demo_${Date.now()}`
        }
      })

      // Add credits to user account
      const currentCredits = user.credits || 0
      await prisma.user.update({
        where: { id: user.id },
        data: {
          credits: currentCredits + creditPackage.credits
        }
      })

      // Log the purchase
      await prisma.securityLog.create({
        data: {
          action: 'CREDITS_PURCHASED',
          resource: 'credits',
          details: JSON.stringify({
            transactionId: transaction.id,
            packageType,
            creditsAdded: creditPackage.credits,
            amountPaid: creditPackage.price,
            newBalance: currentCredits + creditPackage.credits
          }),
          ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
          userAgent: request.headers.get('user-agent') || 'Unknown',
          success: true,
          riskLevel: 'LOW'
        }
      })

      return NextResponse.json({
        success: true,
        transaction,
        creditsAdded: creditPackage.credits,
        newBalance: currentCredits + creditPackage.credits,
        message: `Successfully purchased ${creditPackage.name}!`
      })
    }

    // Create Stripe Checkout Session for real payments
    try {
      if (!stripe) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
      }
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: creditPackage.name,
                description: `${creditPackage.credits} credits + £${creditPackage.bonus} bonus`,
                images: ['https://liftplannerpro.org/images/credits-icon.png'],
              },
              unit_amount: Math.round(creditPackage.price * 100), // Convert to pence
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&type=credits`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/monetization?cancelled=true`,
        metadata: {
          transactionId: transaction.id,
          userId: user.id,
          packageType,
          creditsAmount: creditPackage.credits.toString(),
        },
        customer_email: user.email,
      })

      // Update transaction with Stripe session ID
      await prisma.creditPurchase.update({
        where: { id: transaction.id },
        data: {
          paymentId: session.id,
          status: 'PENDING_PAYMENT'
        }
      })

      return NextResponse.json({
        success: true,
        transaction,
        checkoutUrl: session.url,
        sessionId: session.id,
        message: 'Redirecting to Stripe checkout...'
      })

    } catch (stripeError) {
      console.error('Stripe checkout error:', stripeError)
      return NextResponse.json({
        error: 'Payment processing failed. Please try again.'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Credit purchase error:', error)
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 })
  }
}
