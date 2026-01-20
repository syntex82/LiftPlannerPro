import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Admin email list
const adminEmails = [
  'mickyblenk@gmail.com',  // Primary admin
  'admin@liftplannerpro.org',   // Backup admin
]

const isAdmin = (email: string | null | undefined) => {
  return email && adminEmails.includes(email)
}

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'viewer'
  subscription: string
  status: 'active' | 'inactive' | 'suspended'
  lastLogin: string | null
  createdAt: string
  company: string | null
  projects: number
  isActive: boolean
  loginAttempts: number
}

// Using PostgreSQL database for user data

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can access user management
    if (!isAdmin(session.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch real users from database
    const realUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscription: true,
        isActive: true,
        lastLogin: true,
        loginAttempts: true,
        lockedUntil: true,
        createdAt: true,
        updatedAt: true,
        company: true,
        _count: {
          select: {
            projects: true,
            issueReports: true,
            securityLogs: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform to match expected format
    const transformedUsers = realUsers.map(user => {
      // Get subscription data for new single plan model
      const getSubscriptionData = (subscription: string) => {
        const plan = subscription?.toLowerCase() || 'free'
        const isActive = user.isActive && !user.lockedUntil

        const planData = {
          free: { amount: 0, name: 'Free Trial' },
          professional: { amount: 29, name: 'Professional' }
        }

        const currentPlan = planData[plan as keyof typeof planData] || planData.free

        return {
          plan: currentPlan.name,
          status: isActive ? 'active' : 'inactive',
          amount: currentPlan.amount,
          currency: 'GBP',
          nextPayment: isActive && currentPlan.amount > 0 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
          endDate: isActive && currentPlan.amount > 0 ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
          paymentMethod: currentPlan.amount > 0 ? 'Credit Card' : 'N/A',
          autoRenew: isActive && currentPlan.amount > 0
        }
      }

      const getBillingData = (subscription: string, createdAt: Date) => {
        const monthsSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000))

        switch (subscription?.toLowerCase()) {
          case 'professional':
            return {
              totalPaid: monthsSinceCreation * 29, // £29 per month
              invoiceCount: monthsSinceCreation,
              currency: 'GBP',
              paymentHistory: []
            }
          default:
            return {
              totalPaid: 0,
              invoiceCount: 0,
              currency: 'GBP',
              paymentHistory: []
            }
        }
      }

      return {
        id: user.id,
        name: user.name || 'Unknown',
        email: user.email,
        role: user.role || 'user',
        status: user.isActive && !user.lockedUntil ? 'active' : 'inactive',
        lastLogin: user.lastLogin?.toISOString() || 'Never',
        createdAt: user.createdAt.toISOString(),
        company: user.company || 'Not specified',
        projects: user._count.projects,
        issueReports: user._count.issueReports,
        securityLogs: user._count.securityLogs,
        isActive: user.isActive,
        loginAttempts: user.loginAttempts,
        isLocked: user.lockedUntil ? new Date(user.lockedUntil) > new Date() : false,
        subscription: getSubscriptionData(user.subscription || 'free'),
        billing: getBillingData(user.subscription || 'free', user.createdAt)
      }
    })

    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can create users
    if (!isAdmin(session.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, role, department, password } = body

    // Validate required fields
    if (!name || !email || !role || !department || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash password
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user in database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        company: department || 'Unknown',
        subscription: 'free',
        isActive: true,
        loginAttempts: 0
      }
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    console.log('🔐 PATCH Session check:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      isAdmin: session?.user?.email ? isAdmin(session.user.email) : false
    })

    if (!session) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update users
    if (!isAdmin(session.user?.email)) {
      console.log('❌ User is not admin:', session.user?.email)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, subscription, isActive, id, name, email, role, department, status } = body

    console.log('🔄 PATCH request body:', body)
    console.log('🔄 userId:', userId, 'subscription:', subscription, 'isActive:', isActive)

    // Handle subscription/status updates (new admin dashboard functionality)
    if (userId && (subscription !== undefined || isActive !== undefined)) {
      const updateData: any = {}
      if (subscription !== undefined) {
        updateData.subscription = subscription
        console.log('📝 Setting subscription to:', subscription)
      }
      if (isActive !== undefined) {
        updateData.isActive = isActive
        console.log('📝 Setting isActive to:', isActive)
      }

      console.log('📝 Update data:', updateData)
      console.log('📝 Updating user with ID:', userId)

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData
      })

      console.log('✅ User updated successfully:', {
        id: updatedUser.id,
        email: updatedUser.email,
        subscription: updatedUser.subscription,
        isActive: updatedUser.isActive
      })

      return NextResponse.json({
        success: true,
        message: 'User updated successfully',
        user: {
          id: updatedUser.id,
          subscription: updatedUser.subscription,
          isActive: updatedUser.isActive
        }
      })
    }

    // Handle user updates using database
    if (id) {
      const existingUser = await prisma.user.findUnique({
        where: { id }
      })

      if (!existingUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Check if email already exists (excluding current user)
      if (email) {
        const emailExists = await prisma.user.findFirst({
          where: {
            email,
            id: { not: id }
          }
        })
        if (emailExists) {
          return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
        }
      }

      // Update user in database
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          name: name || existingUser.name,
          email: email || existingUser.email,
          role: role || existingUser.role,
          company: department || existingUser.company,
          isActive: status === 'active' ? true : status === 'inactive' ? false : existingUser.isActive
        }
      })

      return NextResponse.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.isActive ? 'active' : 'inactive',
        company: updatedUser.company,
        subscription: updatedUser.subscription
      })
    }

    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete users
    if (!isAdmin(session.user?.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deleting admin users
    if (isAdmin(existingUser.email)) {
      return NextResponse.json({ error: 'Cannot delete admin user' }, { status: 400 })
    }

    // Delete user from database
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'User deleted successfully',
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email
      }
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


