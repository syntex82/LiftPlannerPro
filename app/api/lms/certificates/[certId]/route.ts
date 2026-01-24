import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/subscription'

// GET - Get certificate details or verify by ID/number
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certId: string }> }
) {
  try {
    const { certId } = await params
    
    // Try to find by ID first, then by certificate number
    let certificate = await prisma.certificate.findUnique({
      where: { id: certId },
      include: {
        user: { select: { name: true, image: true } },
        course: { select: { title: true, category: true, difficulty: true } }
      }
    })

    if (!certificate) {
      certificate = await prisma.certificate.findUnique({
        where: { certificateNumber: certId },
        include: {
          user: { select: { name: true, image: true } },
          course: { select: { title: true, category: true, difficulty: true } }
        }
      })
    }

    if (!certificate) {
      return NextResponse.json({ 
        error: 'Certificate not found',
        valid: false
      }, { status: 404 })
    }

    // Check if certificate is expired
    const isExpired = certificate.expiresAt && new Date(certificate.expiresAt) < new Date()

    return NextResponse.json({
      certificate: {
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        completionDate: certificate.completionDate,
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt,
        score: certificate.score,
        course: certificate.course
      },
      valid: !isExpired,
      expired: isExpired,
      verifiedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching certificate:', error)
    return NextResponse.json({ error: 'Failed to fetch certificate' }, { status: 500 })
  }
}

// DELETE - Revoke certificate (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ certId: string }> }
) {
  try {
    const { certId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await prisma.certificate.delete({ where: { id: certId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting certificate:', error)
    return NextResponse.json({ error: 'Failed to delete certificate' }, { status: 500 })
  }
}

