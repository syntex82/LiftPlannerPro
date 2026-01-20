import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('NextAuth test route called')
    
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      success: true,
      message: 'NextAuth is working',
      session: session ? {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role
        }
      } : null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('NextAuth test error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'NextAuth test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
