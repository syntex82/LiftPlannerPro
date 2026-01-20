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

// Pay-per-use pricing for Stripe checkout
const PAY_PER_USE_PRICES = {
  'extra_calculation': {
    name: 'Extra Calculation',
    price: 0.99,
    description: 'One additional load calculation beyond your free limit',
    emoji: '🧮'
  },
  'cad_export_pdf': {
    name: 'PDF Export',
    price: 1.49,
    description: 'Export your drawings to professional PDF',
    emoji: '📄'
  },
  'cad_export_dwg': {
    name: 'DWG Export',
    price: 2.99,
    description: 'Export to professional DWG format',
    emoji: '📐'
  },
  'remove_watermark': {
    name: 'Remove Watermark',
    price: 0.49,
    description: 'Remove "Free Version" watermark from exports',
    emoji: '✨'
  },
  'extra_project': {
    name: 'Extra Project Slot',
    price: 1.99,
    description: 'Add one more project beyond your 3 free projects',
    emoji: '📁'
  },
  'basic_consultation': {
    name: '15-min Quick Help',
    price: 9.99,
    description: 'Quick consultation for specific questions',
    emoji: '💬'
  },
  'priority_support': {
    name: 'Fast Support',
    price: 4.99,
    description: 'Get help within 2 hours instead of 24 hours',
    emoji: '⚡'
  }
}

// Credit packages for Stripe checkout
const CREDIT_PACKAGES = {
  'coffee': {
    name: 'Coffee Pack ☕',
    credits: 5,
    price: 3.99,
    bonus: 1,
    description: 'Perfect for trying premium features'
  },
  'lunch': {
    name: 'Lunch Pack 🥪',
    credits: 12,
    price: 8.99,
    bonus: 3,
    description: 'Great for occasional users'
  },
  'dinner': {
    name: 'Dinner Pack 🍽️',
    credits: 25,
    price: 17.99,
    bonus: 7,
    description: 'Best value for regular users'
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, item, quantity = 1 } = await request.json()

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    let metadata: any = {
      userId: user.id,
      type,
      item
    }

    if (type === 'pay-per-use') {
      const service = PAY_PER_USE_PRICES[item as keyof typeof PAY_PER_USE_PRICES]
      if (!service) {
        return NextResponse.json({ error: 'Invalid service type' }, { status: 400 })
      }

      lineItems = [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `${service.emoji} ${service.name}`,
            description: service.description,
            images: ['https://liftplannerpro.org/images/service-icon.png'],
          },
          unit_amount: Math.round(service.price * 100), // Convert to pence
        },
        quantity,
      }]

      metadata = {
        ...metadata,
        serviceType: item,
        serviceName: service.name,
        unitPrice: service.price,
        totalAmount: service.price * quantity,
        quantity
      }

    } else if (type === 'credits') {
      const creditPackage = CREDIT_PACKAGES[item as keyof typeof CREDIT_PACKAGES]
      if (!creditPackage) {
        return NextResponse.json({ error: 'Invalid package type' }, { status: 400 })
      }

      lineItems = [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: creditPackage.name,
            description: `${creditPackage.credits} credits + £${creditPackage.bonus} bonus! ${creditPackage.description}`,
            images: ['https://liftplannerpro.org/images/credits-icon.png'],
          },
          unit_amount: Math.round(creditPackage.price * 100), // Convert to pence
        },
        quantity: 1,
      }]

      metadata = {
        ...metadata,
        packageType: item,
        packageName: creditPackage.name,
        creditsAmount: creditPackage.credits,
        bonusAmount: creditPackage.bonus,
        price: creditPackage.price
      }
    } else {
      return NextResponse.json({ error: 'Invalid purchase type' }, { status: 400 })
    }

    // Create Stripe Checkout Session
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&type=${type}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/monetization?cancelled=true`,
      metadata,
      customer_email: user.email,
      billing_address_collection: 'auto',
      payment_intent_data: {
        description: type === 'pay-per-use' 
          ? `${PAY_PER_USE_PRICES[item as keyof typeof PAY_PER_USE_PRICES]?.name} - Lift Planner Pro`
          : `${CREDIT_PACKAGES[item as keyof typeof CREDIT_PACKAGES]?.name} - Lift Planner Pro`,
      },
    })

    // Create pending transaction record
    if (type === 'pay-per-use') {
      await prisma.payPerUseTransaction.create({
        data: {
          userId: user.id,
          serviceType: item,
          serviceName: PAY_PER_USE_PRICES[item as keyof typeof PAY_PER_USE_PRICES]?.name || item,
          quantity,
          unitPrice: PAY_PER_USE_PRICES[item as keyof typeof PAY_PER_USE_PRICES]?.price || 0,
          totalAmount: (PAY_PER_USE_PRICES[item as keyof typeof PAY_PER_USE_PRICES]?.price || 0) * quantity,
          status: 'PENDING_PAYMENT',
          paymentId: checkoutSession.id
        }
      })
    } else if (type === 'credits') {
      await prisma.creditPurchase.create({
        data: {
          userId: user.id,
          packageType: item,
          packageName: CREDIT_PACKAGES[item as keyof typeof CREDIT_PACKAGES]?.name || item,
          creditsAmount: CREDIT_PACKAGES[item as keyof typeof CREDIT_PACKAGES]?.credits || 0,
          price: CREDIT_PACKAGES[item as keyof typeof CREDIT_PACKAGES]?.price || 0,
          paymentMethod: 'stripe',
          paymentId: checkoutSession.id,
          status: 'PENDING_PAYMENT'
        }
      })
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ 
      error: 'Payment processing failed. Please try again.' 
    }, { status: 500 })
  }
}
