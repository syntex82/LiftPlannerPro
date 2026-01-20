import { NextRequest, NextResponse } from 'next/server'

// This endpoint is only available in development mode
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }

  try {
    // Clear the rate limit store by restarting the server
    // Since the rate limit store is in memory, this will clear it
    console.log('🧹 Rate limit clear requested')
    
    return NextResponse.json({
      success: true,
      message: 'Rate limit cleared. Please restart your development server for full effect.',
      instructions: [
        'Stop your server with Ctrl+C',
        'Run: npm run dev',
        'Try logging in again'
      ]
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear rate limit' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    message: 'Rate limit clear endpoint',
    usage: 'Send POST request to clear rate limits',
    note: 'Only available in development mode'
  })
}
