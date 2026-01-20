import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

// Helper function to check if user is admin
function isAdmin(email: string): boolean {
  const adminEmails = ['mickyblenk@gmail.com', 'admin@liftplannerpro.org']
  return adminEmails.includes(email)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    console.log(`🔍 Admin Stripe data request: ${type}`)

    switch (type) {
      case 'customers':
        return await getStripeCustomers()
      
      case 'subscriptions':
        return await getStripeSubscriptions()
      
      case 'revenue':
        return await getRevenueData()
      
      case 'overview':
        return await getStripeOverview()
      
      default:
        return await getStripeOverview()
    }

  } catch (error) {
    console.error('Error fetching Stripe data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getStripeCustomers() {
  try {
    // Get customers from Stripe
    const customers = await stripe.customers.list({
      limit: 100,
      expand: ['data.subscriptions']
    })

    // Get users from database with subscription info
    const dbUsers = await prisma.user.findMany({
      // Temporarily disabled Stripe subscriptions until table is created
      // include: {
      //   stripeSubscriptions: {
      //     orderBy: { createdAt: 'desc' },
      //     take: 1
      //   }
      // }
    })

    // Combine Stripe and database data
    const combinedData = await Promise.all(customers.data.map(async (customer) => {
      const dbUser = dbUsers.find(user => user.email === customer.email)
      const subscription = customer.subscriptions?.data[0]
      const dbSubscription = null // dbUser?.stripeSubscriptions[0] - temporarily disabled

      return {
        id: customer.id,
        email: customer.email,
        name: customer.name || dbUser?.name || 'Unknown',
        created: new Date(customer.created * 1000),
        subscription: subscription ? {
          id: subscription.id,
          status: subscription.status,
          planName: (dbSubscription as any)?.planName || getSubscriptionTier(subscription),
          amount: subscription.items.data[0]?.price.unit_amount || 0,
          currency: subscription.currency,
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          cancelAtPeriodEnd: (subscription as any).cancel_at_period_end
        } : null,
        totalSpent: await getCustomerTotalSpent(customer.id),
        isActive: dbUser?.isActive || false,
        lastLogin: dbUser?.lastLogin,
        company: dbUser?.company || customer.metadata?.company
      }
    }))

    return NextResponse.json({
      customers: combinedData,
      total: customers.data.length,
      hasMore: customers.has_more
    })

  } catch (error) {
    console.error('Error fetching Stripe customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

async function getStripeSubscriptions() {
  try {
    // Get active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      status: 'all',
      limit: 100,
      expand: ['data.customer']
    })

    const subscriptionData = subscriptions.data.map(sub => {
      const customer = sub.customer as Stripe.Customer
      return {
        id: sub.id,
        customerId: customer.id,
        customerEmail: customer.email,
        customerName: customer.name,
        status: sub.status,
        planName: getSubscriptionTier(sub),
        amount: sub.items.data[0]?.price.unit_amount || 0,
        currency: sub.currency,
        interval: sub.items.data[0]?.price.recurring?.interval,
        currentPeriodStart: new Date((sub as any).current_period_start * 1000),
        currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
        cancelAtPeriodEnd: (sub as any).cancel_at_period_end,
        created: new Date((sub as any).created * 1000),
        trialEnd: (sub as any).trial_end ? new Date((sub as any).trial_end * 1000) : null
      }
    })

    return NextResponse.json({
      subscriptions: subscriptionData,
      total: subscriptions.data.length
    })

  } catch (error) {
    console.error('Error fetching Stripe subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

async function getRevenueData() {
  try {
    // Get charges from last 12 months
    const twelveMonthsAgo = Math.floor(Date.now() / 1000) - (12 * 30 * 24 * 60 * 60)
    
    const charges = await stripe.charges.list({
      created: { gte: twelveMonthsAgo },
      limit: 100
    })

    // Calculate monthly revenue
    const monthlyRevenue = new Map()
    let totalRevenue = 0

    charges.data.forEach(charge => {
      if (charge.paid) {
        const date = new Date(charge.created * 1000)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        const currentAmount = monthlyRevenue.get(monthKey) || 0
        monthlyRevenue.set(monthKey, currentAmount + (charge.amount / 100))
        totalRevenue += charge.amount / 100
      }
    })

    // Convert to array format
    const revenueHistory = Array.from(monthlyRevenue.entries()).map(([month, amount]) => ({
      month,
      amount
    })).sort((a, b) => a.month.localeCompare(b.month))

    return NextResponse.json({
      totalRevenue,
      monthlyRevenue: revenueHistory,
      totalCharges: charges.data.length,
      successfulCharges: charges.data.filter(c => c.paid).length
    })

  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 })
  }
}

async function getStripeOverview() {
  try {
    // Get basic Stripe metrics
    const [customers, subscriptions, charges] = await Promise.all([
      stripe.customers.list({ limit: 1 }),
      stripe.subscriptions.list({ status: 'active', limit: 1 }),
      stripe.charges.list({ limit: 100 })
    ])

    // Calculate metrics
    const totalCustomers = customers.data.length > 0 ? await getTotalCount('customers') : 0
    const activeSubscriptions = subscriptions.data.length > 0 ? await getTotalCount('subscriptions', 'active') : 0
    
    const paidCharges = charges.data.filter(c => c.paid)
    const totalRevenue = paidCharges.reduce((sum, charge) => sum + (charge.amount / 100), 0)
    const averageOrderValue = paidCharges.length > 0 ? totalRevenue / paidCharges.length : 0

    // Get subscription breakdown
    const allSubscriptions = await stripe.subscriptions.list({ status: 'all', limit: 100 })
    const subscriptionBreakdown = {
      active: allSubscriptions.data.filter(s => s.status === 'active').length,
      canceled: allSubscriptions.data.filter(s => s.status === 'canceled').length,
      pastDue: allSubscriptions.data.filter(s => s.status === 'past_due').length,
      trialing: allSubscriptions.data.filter(s => s.status === 'trialing').length
    }

    return NextResponse.json({
      totalCustomers,
      activeSubscriptions,
      totalRevenue,
      averageOrderValue,
      subscriptionBreakdown,
      recentCharges: charges.data.slice(0, 10).map(charge => ({
        id: charge.id,
        amount: charge.amount / 100,
        currency: charge.currency,
        status: charge.status,
        created: new Date(charge.created * 1000),
        customerEmail: charge.billing_details?.email
      }))
    })

  } catch (error) {
    console.error('Error fetching Stripe overview:', error)
    return NextResponse.json({ error: 'Failed to fetch overview' }, { status: 500 })
  }
}

async function getTotalCount(resource: string, status?: string): Promise<number> {
  try {
    let params: any = { limit: 1 }
    if (status && resource === 'subscriptions') {
      params.status = status
    }

    const result = resource === 'customers' 
      ? await stripe.customers.list(params)
      : await stripe.subscriptions.list(params)

    return (result as any).total_count || 0
  } catch (error) {
    console.error(`Error getting total count for ${resource}:`, error)
    return 0
  }
}

async function getCustomerTotalSpent(customerId: string): Promise<number> {
  try {
    const charges = await stripe.charges.list({
      customer: customerId,
      limit: 100
    })

    return charges.data
      .filter(charge => charge.paid)
      .reduce((total, charge) => total + (charge.amount / 100), 0)
  } catch (error) {
    console.error('Error calculating customer total spent:', error)
    return 0
  }
}

function getSubscriptionTier(subscription: Stripe.Subscription): string {
  const amount = subscription.items.data[0]?.price.unit_amount || 0
  
  if (amount === 0) return 'free'
  if (amount <= 3000) return 'basic'  // $30 or less
  if (amount <= 8000) return 'pro'    // $80 or less
  return 'enterprise'                  // Above $80
}
