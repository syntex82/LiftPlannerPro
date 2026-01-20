import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { SecurityLogger, SecurityAction } from '@/lib/security-logger'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists (including inactive users)
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingUser) {
      if (existingUser.isActive) {
        // Active user exists
        console.log('Registration attempt for existing active user:', normalizedEmail)
        await SecurityLogger.log({
          userId: 'anonymous',
          action: SecurityAction.REGISTRATION_FAILED,
          resource: 'user_registration',
          details: `Registration attempt for existing active user: ${normalizedEmail}`,
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
          userAgent: req.headers.get('user-agent') || 'Unknown',
          success: false,
          riskLevel: 'MEDIUM' as any
        })

        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        )
      } else {
        // Inactive user exists - reactivate account
        console.log('Reactivating inactive user account:', normalizedEmail)

        const hashedPassword = await bcrypt.hash(password, 12)

        const reactivatedUser = await prisma.user.update({
          where: { email: normalizedEmail },
          data: {
            name,
            password: hashedPassword,
            isActive: true,
            loginAttempts: 0,
            lockedUntil: null,
            role: 'user',
            subscription: 'free'
          }
        })

        await SecurityLogger.log({
          userId: reactivatedUser.id,
          action: SecurityAction.USER_REACTIVATED,
          resource: 'user_registration',
          details: 'Inactive user account reactivated',
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
          userAgent: req.headers.get('user-agent') || 'Unknown',
          success: true,
          riskLevel: 'LOW' as any
        })

        const { password: _, ...userWithoutPassword } = reactivatedUser

        return NextResponse.json(
          { message: 'Account reactivated successfully', user: userWithoutPassword },
          { status: 201 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'user',
        subscription: 'free',
        isActive: true,
        loginAttempts: 0
      }
    })

    console.log('New user created successfully:', normalizedEmail)

    await SecurityLogger.log({
      userId: user.id,
      action: SecurityAction.USER_CREATED,
      resource: 'user_registration',
      details: 'New user account created',
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Unknown',
      success: true,
      riskLevel: 'LOW' as any
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)

    // Handle unique constraint violation
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
