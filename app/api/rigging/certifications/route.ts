import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const equipmentId = searchParams.get('equipmentId')
    const status = searchParams.get('status') // 'valid', 'expiring', 'expired'
    const type = searchParams.get('type')

    // Build where clause
    const where: any = {
      equipment: {
        userId: session.user.id
      }
    }

    if (equipmentId) {
      where.equipmentId = equipmentId
    }

    if (type) {
      where.certificateType = type
    }

    // Add date filters for status
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    if (status) {
      switch (status) {
        case 'valid':
          where.expiryDate = { gt: thirtyDaysFromNow }
          break
        case 'expiring':
          where.expiryDate = {
            gt: now,
            lte: thirtyDaysFromNow
          }
          break
        case 'expired':
          where.expiryDate = { lt: now }
          break
      }
    }

    const certifications = await prisma.equipmentCertification.findMany({
      where,
      include: {
        equipment: {
          select: {
            equipmentNumber: true,
            type: true,
            category: true,
            manufacturer: true,
            model: true
          }
        }
      },
      orderBy: { expiryDate: 'asc' }
    })

    // Transform data and calculate status
    const transformedCertifications = certifications.map(cert => {
      const daysUntilExpiry = Math.ceil((cert.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      let certStatus = 'valid'

      if (cert.expiryDate < now) {
        certStatus = 'expired'
      } else if (cert.expiryDate <= thirtyDaysFromNow) {
        certStatus = 'expiring'
      }

      return {
        ...cert,
        status: certStatus,
        daysUntilExpiry,
        equipmentNumber: cert.equipment.equipmentNumber,
        equipmentType: cert.equipment.type,
        category: cert.equipment.category
      }
    })

    // Calculate summary statistics
    const stats = {
      total: certifications.length,
      valid: certifications.filter(c => c.expiryDate > thirtyDaysFromNow).length,
      expiring: certifications.filter(c => c.expiryDate > now && c.expiryDate <= thirtyDaysFromNow).length,
      expired: certifications.filter(c => c.expiryDate < now).length
    }

    return NextResponse.json({
      certifications: transformedCertifications,
      stats
    })
  } catch (error) {
    console.error('Error fetching certifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      equipmentId,
      certificateNumber,
      certificateType,
      issuedDate,
      expiryDate,
      issuedBy,
      competentPerson,
      testLoad,
      testResult,
      notes
    } = data

    // Check if equipment exists and belongs to user
    const equipment = await prisma.riggingEquipment.findFirst({
      where: {
        id: equipmentId,
        userId: session.user.id
      }
    })

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }

    // Check if certificate number already exists
    const existing = await prisma.equipmentCertification.findUnique({
      where: { certificateNumber }
    })

    if (existing) {
      return NextResponse.json({ error: 'Certificate number already exists' }, { status: 400 })
    }

    // Create new certification
    const newCertification = await prisma.equipmentCertification.create({
      data: {
        equipmentId,
        certificateNumber,
        certificateType,
        issuedDate: new Date(issuedDate),
        expiryDate: new Date(expiryDate),
        issuedBy,
        competentPerson,
        testLoad: testLoad ? parseFloat(testLoad) : null,
        testResult: testResult || 'pass',
        notes
      },
      include: {
        equipment: {
          select: {
            equipmentNumber: true,
            type: true,
            category: true
          }
        }
      }
    })

    // Update equipment status if it was out of service and test passed
    if (testResult === 'pass' && equipment.status === 'OUT_OF_SERVICE') {
      await prisma.riggingEquipment.update({
        where: { id: equipmentId },
        data: {
          status: 'IN_SERVICE',
          certificationExpiry: new Date(expiryDate)
        }
      })
    } else {
      // Just update certification expiry
      await prisma.riggingEquipment.update({
        where: { id: equipmentId },
        data: { certificationExpiry: new Date(expiryDate) }
      })
    }

    return NextResponse.json({
      success: true,
      certification: newCertification,
      message: 'Certification created successfully'
    })
  } catch (error) {
    console.error('Error creating certification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { id, ...updateData } = data

    // Check if certification exists and user owns the equipment
    const existing = await prisma.equipmentCertification.findFirst({
      where: {
        id,
        equipment: {
          userId: session.user.id
        }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 })
    }

    // Prepare update data
    const updateFields: any = {}

    if (updateData.certificateType) updateFields.certificateType = updateData.certificateType
    if (updateData.issuedDate) updateFields.issuedDate = new Date(updateData.issuedDate)
    if (updateData.expiryDate) updateFields.expiryDate = new Date(updateData.expiryDate)
    if (updateData.issuedBy) updateFields.issuedBy = updateData.issuedBy
    if (updateData.competentPerson) updateFields.competentPerson = updateData.competentPerson
    if (updateData.testLoad) updateFields.testLoad = parseFloat(updateData.testLoad)
    if (updateData.testResult) updateFields.testResult = updateData.testResult
    if (updateData.notes) updateFields.notes = updateData.notes

    // Update certification
    const updatedCertification = await prisma.equipmentCertification.update({
      where: { id },
      data: updateFields,
      include: {
        equipment: {
          select: {
            equipmentNumber: true,
            type: true,
            category: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      certification: updatedCertification,
      message: 'Certification updated successfully'
    })
  } catch (error) {
    console.error('Error updating certification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Certification ID required' }, { status: 400 })
    }

    // Check if certification exists and user owns the equipment
    const existing = await prisma.equipmentCertification.findFirst({
      where: {
        id,
        equipment: {
          userId: session.user.id
        }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 })
    }

    // Delete certification
    await prisma.equipmentCertification.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Certification deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting certification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
