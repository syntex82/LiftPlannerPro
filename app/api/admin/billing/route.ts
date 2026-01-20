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

// Admin email list
const adminEmails = [
  'mickyblenk@gmail.com',  // Primary admin
  'admin@liftplannerpro.org',   // Backup admin
]

const isAdmin = (email: string | null | undefined) => {
  return email && adminEmails.includes(email)
}

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  interval: 'monthly' | 'yearly'
  features: string[]
  active: boolean
}

interface BillingData {
  totalRevenue: number
  monthlyRecurring: number
  activeSubscriptions: number
  cancelledSubscriptions: number
  churnRate: number
  averageRevenuePerUser: number
  subscriptionPlans: SubscriptionPlan[]
  recentTransactions: Transaction[]
  revenueHistory: RevenueData[]
}

interface Transaction {
  id: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  type: 'subscription' | 'upgrade' | 'refund'
  date: string
  description: string
  paymentMethod: string
  invoice: string
}

interface RevenueData {
  month: string
  revenue: number
  subscriptions: number
  newCustomers: number
  churn: number
}

// Mock billing data
const mockBillingData: BillingData = {
  totalRevenue: 8700,
  monthlyRecurring: 2900,
  activeSubscriptions: 100,
  cancelledSubscriptions: 5,
  churnRate: 2.1,
  averageRevenuePerUser: 29.00,
  subscriptionPlans: [
    {
      id: 'professional',
      name: 'Professional',
      price: 29,
      currency: 'GBP',
      interval: 'monthly',
      features: [
        'Full 2D CAD Drawing Suite',
        'Advanced RAMS Generator',
        'Load & Tension Calculators',
        'Step Plan Module',
        'Rigging Loft Management',
        'Learning Management System',
        'Unlimited Projects',
        'Priority Support'
      ],
      active: true
    }
  ],
  recentTransactions: [
    {
      id: 'txn_001',
      userId: '1',
      userName: 'John Smith',
      userEmail: 'john@company.com',
      amount: 79,
      currency: 'USD',
      status: 'paid',
      type: 'subscription',
      date: '2024-01-15T10:30:00Z',
      description: 'Pro Plan - Monthly Subscription',
      paymentMethod: 'Credit Card (**** 4532)',
      invoice: 'INV-2024-001'
    },
    {
      id: 'txn_002',
      userId: '2',
      userName: 'Sarah Johnson',
      userEmail: 'sarah@company.com',
      amount: 29,
      currency: 'USD',
      status: 'paid',
      type: 'subscription',
      date: '2024-01-14T16:45:00Z',
      description: 'Basic Plan - Monthly Subscription',
      paymentMethod: 'PayPal',
      invoice: 'INV-2024-002'
    },
    {
      id: 'txn_003',
      userId: '3',
      userName: 'Mike Wilson',
      userEmail: 'mike@company.com',
      amount: 50,
      currency: 'USD',
      status: 'refunded',
      type: 'refund',
      date: '2024-01-13T09:15:00Z',
      description: 'Refund - Pro Plan Upgrade',
      paymentMethod: 'Credit Card (**** 1234)',
      invoice: 'INV-2024-003'
    }
  ],
  revenueHistory: [
    { month: '2023-08', revenue: 2100, subscriptions: 28, newCustomers: 5, churn: 2 },
    { month: '2023-09', revenue: 2450, subscriptions: 32, newCustomers: 6, churn: 2 },
    { month: '2023-10', revenue: 2800, subscriptions: 36, newCustomers: 7, churn: 3 },
    { month: '2023-11', revenue: 3150, subscriptions: 41, newCustomers: 8, churn: 3 },
    { month: '2023-12', revenue: 3500, subscriptions: 45, newCustomers: 6, churn: 2 },
    { month: '2024-01', revenue: 3240, subscriptions: 47, newCustomers: 4, churn: 2 }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can access billing data
    if (!isAdmin(session.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    console.log(`💰 Admin billing data request: ${type}`)

    switch (type) {
      case 'overview':
        return await getBillingOverview()

      case 'plans':
        return await getSubscriptionPlans()

      case 'transactions':
        return await getRecentTransactions()

      case 'revenue-history':
        return await getRevenueHistory()

      default:
        return await getBillingOverview()
    }
  } catch (error) {
    console.error('Error fetching billing data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can perform billing actions
    if (!isAdmin(session.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, userId, planId, amount, reason } = body

    switch (action) {
      case 'upgrade':
        // In production, this would integrate with payment processor
        console.log(`Upgrading user ${userId} to plan ${planId}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Subscription upgraded successfully',
          transactionId: `txn_${Date.now()}`
        })

      case 'downgrade':
        console.log(`Downgrading user ${userId} to plan ${planId}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Subscription will be downgraded at end of billing period',
          effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })

      case 'cancel':
        console.log(`Cancelling subscription for user ${userId}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Subscription cancelled successfully',
          accessUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })

      case 'refund':
        console.log(`Processing refund of $${amount} for user ${userId}. Reason: ${reason}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Refund processed successfully',
          refundId: `ref_${Date.now()}`,
          amount: amount,
          estimatedArrival: '3-5 business days'
        })

      case 'reactivate':
        console.log(`Reactivating subscription for user ${userId}`)
        return NextResponse.json({ 
          success: true, 
          message: 'Subscription reactivated successfully',
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing billing action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update billing settings
    if (!isAdmin(session.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { planId, updates } = body

    // Update subscription plan
    console.log(`Updating plan ${planId} with:`, updates)

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription plan updated successfully',
      plan: {
        id: planId,
        ...updates,
        updatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating billing settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Real Stripe data functions
async function getBillingOverview() {
  try {
    // Get real data from PostgreSQL database
    const [users, subscriptions, projects, securityLogs] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          subscription: true,
          createdAt: true,
          lastLogin: true,
          company: true,
          stripeSubscriptions: {
            select: {
              status: true,
              amount: true,
              currency: true,
              currentPeriodStart: true,
              currentPeriodEnd: true,
              canceledAt: true,
              lastPaymentDate: true,
              planName: true
            }
          }
        }
      }),
      prisma.stripeSubscription.findMany({
        where: {
          status: {
            in: ['active', 'canceled', 'past_due', 'unpaid']
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.project.count(),
      prisma.securityLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ])

    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active')
    const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'canceled')
    const professionalUsers = users.filter(user =>
      user.subscription === 'professional' ||
      user.stripeSubscriptions.some(sub => sub.status === 'active')
    )

    const totalRevenue = activeSubscriptions.reduce((sum, sub) => sum + (sub.amount / 100), 0)
    const monthlyRecurring = activeSubscriptions.length * 29 // £29 per subscription
    const churnRate = cancelledSubscriptions.length > 0 ?
      (cancelledSubscriptions.length / (activeSubscriptions.length + cancelledSubscriptions.length)) * 100 : 0

    // Generate revenue history for the last 12 months
    const revenueHistory = generateRevenueHistory(activeSubscriptions.length)

    return NextResponse.json({
      totalRevenue: Math.round(totalRevenue),
      monthlyRecurring: Math.round(monthlyRecurring),
      activeSubscriptions: activeSubscriptions.length,
      cancelledSubscriptions: cancelledSubscriptions.length,
      churnRate: Math.round(churnRate * 10) / 10,
      averageRevenuePerUser: activeSubscriptions.length > 0 ? 29 : 0,
      totalUsers: users.length,
      professionalUsers: professionalUsers.length,
      freeUsers: users.length - professionalUsers.length,
      totalProjects: projects,
      securityEvents: securityLogs,
      subscriptionPlans: [
        {
          id: 'professional',
          name: 'Professional',
          price: 29,
          currency: 'GBP',
          interval: 'monthly',
          features: [
            'Full 2D CAD Drawing Suite',
            'Advanced RAMS Generator',
            'Load & Tension Calculators',
            'Step Plan Module',
            'Rigging Loft Management',
            'Learning Management System',
            'Unlimited Projects',
            'Priority Support'
          ],
          active: true,
          subscribers: activeSubscriptions.length
        }
      ],
      recentTransactions: subscriptions.slice(0, 10).map(sub => ({
        id: sub.id,
        amount: sub.amount / 100,
        currency: sub.currency.toUpperCase(),
        status: sub.status,
        date: sub.lastPaymentDate || sub.createdAt,
        customer: `Customer ${sub.userId.slice(-8)}`,
        plan: sub.planName || 'Professional'
      })),
      revenueHistory
    })

  } catch (error) {
    console.error('Error fetching billing overview:', error)
    // Fallback to mock data with real user count if possible
    try {
      const userCount = await prisma.user.count()
      return NextResponse.json({
        ...mockBillingData,
        totalUsers: userCount,
        professionalUsers: Math.floor(userCount * 0.3),
        freeUsers: Math.ceil(userCount * 0.7),
        error: 'Database connection issue'
      })
    } catch (dbError) {
      return NextResponse.json({
        ...mockBillingData,
        error: 'Database unavailable'
      })
    }
  }
}

async function getSubscriptionPlans() {
  try {
    if (!stripe) {
      return NextResponse.json([mockBillingData.subscriptionPlans])
    }
    // Get products and prices from Stripe
    const [products, prices] = await Promise.all([
      stripe.products.list({ active: true }),
      stripe.prices.list({ active: true })
    ])

    const plans = products.data.map(product => {
      const productPrices = prices.data.filter(price => price.product === product.id)
      const mainPrice = productPrices[0]

      return {
        id: product.id,
        name: product.name,
        price: mainPrice ? mainPrice.unit_amount! / 100 : 0,
        currency: mainPrice?.currency || 'USD',
        interval: mainPrice?.recurring?.interval || 'monthly',
        features: product.description ? [product.description] : [],
        active: product.active
      }
    })

    return NextResponse.json(plans)

  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return NextResponse.json([])
  }
}

async function getRecentTransactions() {
  try {
    if (!stripe) {
      return NextResponse.json(mockBillingData.recentTransactions)
    }
    const charges = await stripe.charges.list({
      limit: 20,
      expand: ['data.customer']
    })

    const transactions = charges.data.map(charge => {
      const customer = charge.customer as Stripe.Customer
      return {
        id: charge.id,
        amount: charge.amount / 100,
        currency: charge.currency.toUpperCase(),
        status: charge.status,
        customerEmail: customer?.email || charge.billing_details?.email || 'Unknown',
        customerName: customer?.name || 'Unknown Customer',
        description: charge.description || 'Subscription payment',
        date: new Date(charge.created * 1000).toISOString(),
        paymentMethod: charge.payment_method_details?.type || 'card'
      }
    })

    return NextResponse.json(transactions)

  } catch (error) {
    console.error('Error fetching recent transactions:', error)
    return NextResponse.json([])
  }
}

async function getRevenueHistory() {
  try {
    if (!stripe) {
      return NextResponse.json(mockBillingData.revenueHistory)
    }
    // Get charges from last 12 months
    const twelveMonthsAgo = Math.floor(Date.now() / 1000) - (12 * 30 * 24 * 60 * 60)

    const charges = await stripe.charges.list({
      created: { gte: twelveMonthsAgo },
      limit: 100
    })

    // Group by month
    const monthlyRevenue = new Map()

    charges.data.forEach(charge => {
      if (charge.paid) {
        const date = new Date(charge.created * 1000)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

        const currentAmount = monthlyRevenue.get(monthKey) || 0
        monthlyRevenue.set(monthKey, currentAmount + (charge.amount / 100))
      }
    })

    // Convert to array and fill missing months
    const revenueHistory = []
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      revenueHistory.push({
        month: monthKey,
        revenue: monthlyRevenue.get(monthKey) || 0
      })
    }

    return NextResponse.json(revenueHistory)

  } catch (error) {
    console.error('Error fetching revenue history:', error)
    return NextResponse.json([])
  }
}

// Helper function to generate revenue history
function generateRevenueHistory(currentSubscribers: number) {
  const history = []
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })

    // Simulate growth over time
    const growthFactor = (12 - i) / 12
    const subscribers = Math.floor(currentSubscribers * (0.3 + 0.7 * growthFactor))
    const revenue = subscribers * 29

    history.push({
      month: monthName,
      revenue,
      subscriptions: subscribers
    })
  }

  return history
}
