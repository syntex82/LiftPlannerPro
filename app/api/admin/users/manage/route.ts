import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin, getTrialEndDate } from '@/lib/subscription'

// Admin user management actions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, action, ...data } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 })
    }

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent self-modification for critical actions
    if (targetUser.email === session.user.email && ['delete', 'suspend', 'removeAdmin'].includes(action)) {
      return NextResponse.json({ error: 'Cannot perform this action on yourself' }, { status: 400 })
    }

    let result

    switch (action) {
      case 'resetTrial':
        // Reset user's trial period to 7 days from now
        result = await prisma.user.update({
          where: { id: userId },
          data: {
            subscription: 'trial',
            trialEndsAt: getTrialEndDate()
          }
        })
        break

      case 'grantPro':
        // Grant professional subscription
        result = await prisma.user.update({
          where: { id: userId },
          data: {
            subscription: 'professional',
            trialEndsAt: null
          }
        })
        break

      case 'revokePro':
        // Revoke professional subscription, put back on trial
        result = await prisma.user.update({
          where: { id: userId },
          data: {
            subscription: 'trial',
            trialEndsAt: getTrialEndDate()
          }
        })
        break

      case 'makeAdmin':
        // Make user an admin
        result = await prisma.user.update({
          where: { id: userId },
          data: { role: 'admin' }
        })
        break

      case 'removeAdmin':
        // Remove admin privileges
        result = await prisma.user.update({
          where: { id: userId },
          data: { role: 'user' }
        })
        break

      case 'suspend':
        // Suspend user account
        result = await prisma.user.update({
          where: { id: userId },
          data: { isActive: false }
        })
        break

      case 'activate':
        // Activate suspended user
        result = await prisma.user.update({
          where: { id: userId },
          data: { 
            isActive: true,
            loginAttempts: 0
          }
        })
        break

      case 'delete':
        // Delete user and all related data
        // First delete related records
        await prisma.session.deleteMany({ where: { userId } })
        await prisma.account.deleteMany({ where: { userId } })
        
        // Then delete the user
        result = await prisma.user.delete({
          where: { id: userId }
        })
        break

      case 'updateEmail':
        if (!data.email) {
          return NextResponse.json({ error: 'Email required' }, { status: 400 })
        }
        result = await prisma.user.update({
          where: { id: userId },
          data: { email: data.email }
        })
        break

      case 'updateName':
        result = await prisma.user.update({
          where: { id: userId },
          data: { name: data.name || null }
        })
        break

      case 'updateCompany':
        result = await prisma.user.update({
          where: { id: userId },
          data: { company: data.company || null }
        })
        break

      case 'resetLoginAttempts':
        result = await prisma.user.update({
          where: { id: userId },
          data: { loginAttempts: 0 }
        })
        break

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    // Log the admin action
    console.log(`[ADMIN] ${session.user.email} performed ${action} on user ${targetUser.email}`)

    return NextResponse.json({ 
      success: true, 
      action,
      userId,
      message: `Action '${action}' completed successfully`
    })

  } catch (error) {
    console.error('User management error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

