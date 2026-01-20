// API Route: POST /api/auth/login
// User login endpoint

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { queryOne } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await queryOne(
      'SELECT id, email, full_name, password_hash, role FROM users WHERE email = $1',
      [email]
    )

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Return user data (in production, would create JWT token)
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error logging in:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to login' },
      { status: 500 }
    )
  }
}

