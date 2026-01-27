import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { SecurityLogger, SecurityAction } from '@/lib/security-logger'
import { addToBlocklist, removeFromBlocklist, getBlockedIPs as getMemoryBlockedIPs } from '@/middleware'

const prisma = new PrismaClient()

const ADMIN_EMAILS = ['mickyblenk@gmail.com', 'admin@liftplannerpro.org']

function isAdmin(email: string | null | undefined): boolean {
  return email ? ADMIN_EMAILS.includes(email) : false
}

// GET - List all blocked IPs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get from database
    const blockedIPs = await prisma.blockedIP.findMany({
      where: { isActive: true },
      orderBy: { blockedAt: 'desc' }
    })

    // Also get in-memory blocked IPs (for ones auto-blocked by middleware)
    const memoryBlockedIPs = getMemoryBlockedIPs()

    return NextResponse.json({
      blockedIPs,
      memoryBlockedIPs,
      total: blockedIPs.length
    })
  } catch (error) {
    console.error('Error fetching blocked IPs:', error)
    return NextResponse.json({ error: 'Failed to fetch blocked IPs' }, { status: 500 })
  }
}

// POST - Block a new IP
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { ipAddress, reason, duration } = body

    if (!ipAddress || !reason) {
      return NextResponse.json({ error: 'IP address and reason are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate expiry (null = permanent)
    const expiresAt = duration ? new Date(Date.now() + duration * 1000) : null

    // Block in database
    const blocked = await SecurityLogger.blockIP(ipAddress, reason, duration ? duration * 1000 : undefined, user.id)

    // Also add to in-memory blocklist for immediate effect
    addToBlocklist(ipAddress, reason, expiresAt ? expiresAt.getTime() : null)

    if (blocked) {
      return NextResponse.json({
        success: true,
        message: `IP ${ipAddress} has been blocked`,
        expiresAt
      })
    } else {
      return NextResponse.json({ error: 'Failed to block IP' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error blocking IP:', error)
    return NextResponse.json({ error: 'Failed to block IP' }, { status: 500 })
  }
}

// DELETE - Unblock an IP
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const url = new URL(request.url)
    const ipAddress = url.searchParams.get('ip')

    if (!ipAddress) {
      return NextResponse.json({ error: 'IP address is required' }, { status: 400 })
    }

    // Unblock in database
    await SecurityLogger.unblockIP(ipAddress, session.user.email)

    // Also remove from in-memory blocklist
    removeFromBlocklist(ipAddress)

    return NextResponse.json({
      success: true,
      message: `IP ${ipAddress} has been unblocked`
    })
  } catch (error) {
    console.error('Error unblocking IP:', error)
    return NextResponse.json({ error: 'Failed to unblock IP' }, { status: 500 })
  }
}

