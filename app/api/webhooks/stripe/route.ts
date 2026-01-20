import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

// Only initialize Stripe if API key is available
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`🔔 Stripe webhook received: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('💳 Checkout completed:', session.id)

  try {
    // Check if this is a subscription or one-time payment
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string
    const metadata = session.metadata || {}

    // Handle subscription payments (existing logic)
    if (subscriptionId) {
      await handleSubscriptionCheckout(session, customerId, subscriptionId)
      return
    }

    // Handle one-time payments (new monetization features)
    if (metadata.type === 'pay-per-use' || metadata.type === 'credits') {
      await handleMonetizationCheckout(session, metadata)
      return
    }

    console.log('⚠️ Unhandled checkout session type:', session.id)

  } catch (error) {
    console.error('Error handling checkout completed:', error)
  }
}

async function handleSubscriptionCheckout(session: Stripe.Checkout.Session, customerId: string, subscriptionId: string) {
  try {

    // Get customer details from Stripe
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { email: customer.email! }
    })

    if (!user) {
      // Create new user if they don't exist
      user = await prisma.user.create({
        data: {
          email: customer.email!,
          name: customer.name || 'New Customer',
          subscription: getSubscriptionTier(subscription),
          isActive: true,
          company: customer.metadata?.company || null,
        }
      })
      console.log('👤 Created new user:', user.email)
    } else {
      // Update existing user's subscription
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          subscription: getSubscriptionTier(subscription),
          isActive: true,
        }
      })
      console.log('🔄 Updated user subscription:', user.email)
    }

    // Create subscription record
    await prisma.stripeSubscription.create({
      data: {
        userId: user.id,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        planId: subscription.items.data[0]?.price.id || '',
        planName: getSubscriptionTier(subscription),
        amount: subscription.items.data[0]?.price.unit_amount || 0,
        currency: subscription.currency,
      }
    })

    console.log('✅ Subscription record created for user:', user.email)

  } catch (error) {
    console.error('Error handling checkout completed:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('🆕 Subscription created:', subscription.id)
  await updateUserSubscription(subscription)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id)
  await updateUserSubscription(subscription)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', subscription.id)

  try {
    // Update subscription record
    await prisma.stripeSubscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      }
    })

    // Update user subscription to free
    const stripeSubscription = await prisma.stripeSubscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      include: { user: true }
    })

    if (stripeSubscription) {
      await prisma.user.update({
        where: { id: stripeSubscription.userId },
        data: { subscription: 'free' }
      })
      console.log('🔄 User downgraded to free plan:', stripeSubscription.user.email)
    }

  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Payment succeeded:', invoice.id)

  try {
    const subscriptionId = (invoice as any).subscription as string
    if (!subscriptionId) return

    // Update subscription record with payment info
    await prisma.stripeSubscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        lastPaymentDate: new Date(),
        status: 'active',
      }
    })

    console.log('✅ Payment recorded for subscription:', subscriptionId)

  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Payment failed:', invoice.id)

  try {
    const subscriptionId = (invoice as any).subscription as string
    if (!subscriptionId) return

    // Update subscription status
    await prisma.stripeSubscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        status: 'past_due',
      }
    })

    console.log('⚠️ Subscription marked as past due:', subscriptionId)

  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log('👤 Customer created:', customer.id)
  // Customer creation is handled in checkout.session.completed
}

async function updateUserSubscription(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: customer.email! }
    })

    if (!user) {
      console.error('User not found for subscription update:', customer.email)
      return
    }

    // Update subscription record
    await prisma.stripeSubscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        planId: subscription.items.data[0]?.price.id || '',
        planName: getSubscriptionTier(subscription),
        amount: subscription.items.data[0]?.price.unit_amount || 0,
      }
    })

    // Update user subscription tier
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscription: getSubscriptionTier(subscription),
        isActive: subscription.status === 'active',
      }
    })

    console.log('✅ User subscription updated:', user.email)

  } catch (error) {
    console.error('Error updating user subscription:', error)
  }
}

async function handleMonetizationCheckout(session: Stripe.Checkout.Session, metadata: any) {
  console.log('💰 Processing monetization payment:', session.id)

  try {
    const userId = metadata.userId
    if (!userId) {
      console.error('Missing userId in metadata')
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      console.error('User not found:', userId)
      return
    }

    if (metadata.type === 'pay-per-use') {
      // Handle pay-per-use purchase
      await prisma.payPerUseTransaction.updateMany({
        where: {
          paymentId: session.id,
          status: 'PENDING_PAYMENT'
        },
        data: {
          status: 'COMPLETED'
        }
      })

      console.log(`✅ Pay-per-use transaction completed: ${metadata.serviceName} for ${user.email}`)

    } else if (metadata.type === 'credits') {
      // Handle credit purchase
      const creditsAmount = parseFloat(metadata.creditsAmount) + parseFloat(metadata.bonusAmount || 0)

      // Update credit purchase record
      await prisma.creditPurchase.updateMany({
        where: {
          paymentId: session.id,
          status: 'PENDING_PAYMENT'
        },
        data: {
          status: 'COMPLETED'
        }
      })

      // Add credits to user account
      const currentCredits = user.credits || 0
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: currentCredits + creditsAmount
        }
      })

      console.log(`✅ Credits added: £${creditsAmount} to ${user.email} (total: £${currentCredits + creditsAmount})`)
    }

    // Log the successful payment
    await prisma.securityLog.create({
      data: {
        action: 'MONETIZATION_PAYMENT_SUCCESS',
        resource: 'stripe_payment',
        details: JSON.stringify({
          sessionId: session.id,
          type: metadata.type,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency,
          metadata
        }),
        ipAddress: '127.0.0.1', // Webhook IP
        userAgent: 'Stripe Webhook',
        success: true,
        riskLevel: 'LOW'
      }
    })

  } catch (error) {
    console.error('Error handling monetization checkout:', error)
  }
}

function getSubscriptionTier(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price.id
  const amount = subscription.items.data[0]?.price.unit_amount || 0

  // Map price amounts to subscription tiers
  if (amount === 0) return 'free'
  if (amount <= 3000) return 'basic'  // $30 or less
  if (amount <= 8000) return 'pro'    // $80 or less
  return 'enterprise'                  // Above $80
}
