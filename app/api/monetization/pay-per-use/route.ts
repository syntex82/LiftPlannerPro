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

// Smart affordable pricing - like buying a coffee!
const PAY_PER_USE_PRICES = {
  'extra_calculation': {
    name: 'Extra Calculation',
    price: 0.99, // 99p per calculation (coffee price!)
    description: 'One additional load calculation beyond your free limit'
  },
  'cad_export_pdf': {
    name: 'PDF Export',
    price: 1.49, // £1.49 per export (less than a coffee)
    description: 'Export your drawings to professional PDF'
  },
  'cad_export_dwg': {
    name: 'DWG Export',
    price: 2.99, // £2.99 per export (sandwich price)
    description: 'Export to professional DWG format'
  },
  'remove_watermark': {
    name: 'Remove Watermark',
    price: 0.49, // 49p to remove watermark
    description: 'Remove "Free Version" watermark from exports'
  },
  'extra_project': {
    name: 'Extra Project Slot',
    price: 1.99, // £1.99 for one more project
    description: 'Add one more project beyond your 3 free projects'
  },
  'basic_consultation': {
    name: '15-min Quick Help',
    price: 9.99, // £9.99 for quick help (reasonable)
    description: 'Quick consultation for specific questions'
  },
  'priority_support': {
    name: 'Fast Support',
    price: 4.99, // £4.99 for priority support
    description: 'Get help within 2 hours instead of 24 hours'
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current credits and usage
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        payPerUseTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      services: PAY_PER_USE_PRICES,
      userCredits: user.credits || 0,
      recentTransactions: user.payPerUseTransactions
    })

  } catch (error) {
    console.error('Pay-per-use API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { serviceType, quantity = 1 } = await request.json()

    if (!PAY_PER_USE_PRICES[serviceType as keyof typeof PAY_PER_USE_PRICES]) {
      return NextResponse.json({ error: 'Invalid service type' }, { status: 400 })
    }

    const service = PAY_PER_USE_PRICES[serviceType as keyof typeof PAY_PER_USE_PRICES]
    const totalAmount = service.price * quantity

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has enough credits
    const userCredits = user.credits || 0
    if (userCredits < totalAmount) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: totalAmount,
        available: userCredits,
        shortfall: totalAmount - userCredits
      }, { status: 402 })
    }

    // Process the transaction
    const transaction = await prisma.payPerUseTransaction.create({
      data: {
        userId: user.id,
        serviceType,
        serviceName: service.name,
        quantity,
        unitPrice: service.price,
        totalAmount,
        status: 'COMPLETED'
      }
    })

    // Deduct credits from user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        credits: userCredits - totalAmount
      }
    })

    // Log the transaction
    await prisma.securityLog.create({
      data: {
        action: 'PAY_PER_USE_PURCHASE',
        resource: 'pay_per_use',
        details: JSON.stringify({
          transactionId: transaction.id,
          serviceType,
          amount: totalAmount,
          creditsRemaining: userCredits - totalAmount
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
      creditsRemaining: userCredits - totalAmount,
      message: `Successfully purchased ${service.name}`
    })

  } catch (error) {
    console.error('Pay-per-use purchase error:', error)
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 })
  }
}
