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
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // Build where clause for filtering
    const where: any = {
      userId: session.user.id
    }

    if (status) {
      where.status = status
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { equipmentNumber: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } }
      ]
    }

    const equipment = await prisma.riggingEquipment.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1
        }
      },
      orderBy: { equipmentNumber: 'asc' }
    })

    // Transform data to match expected format
    const transformedEquipment = equipment.map(item => ({
      id: item.id,
      equipmentNumber: item.equipmentNumber,
      type: item.type,
      category: item.category,
      manufacturer: item.manufacturer,
      model: item.model,
      workingLoadLimit: item.workingLoadLimit,
      status: item.status,
      location: item.location,
      condition: item.condition,
      lastInspection: item.lastInspection,
      nextInspection: item.nextInspection,
      certificationExpiry: item.certificationExpiry,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      lastMovement: item.movements[0] || null,
      lastInspectionRecord: item.inspections[0] || null,
      owner: item.user
    }))

    return NextResponse.json({ equipment: transformedEquipment })
  } catch (error) {
    console.error('Error fetching equipment:', error)
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
      equipmentNumber,
      type,
      category,
      manufacturer,
      model,
      workingLoadLimit,
      location,
      notes
    } = data

    // Check if equipment number already exists
    const existing = await prisma.riggingEquipment.findUnique({
      where: { equipmentNumber }
    })

    if (existing) {
      return NextResponse.json({ error: 'Equipment number already exists' }, { status: 400 })
    }

    // Create new equipment
    const newEquipment = await prisma.riggingEquipment.create({
      data: {
        equipmentNumber,
        type,
        category,
        manufacturer,
        model,
        workingLoadLimit: parseFloat(workingLoadLimit),
        location,
        notes,
        userId: session.user.id,
        status: 'IN_SERVICE',
        condition: 5
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      equipment: newEquipment,
      message: 'Equipment added successfully'
    })
  } catch (error) {
    console.error('Error creating equipment:', error)
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

    // Check if equipment exists and belongs to user
    const existing = await prisma.riggingEquipment.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }

    // Prepare update data
    const updateFields: any = {}

    if (updateData.type) updateFields.type = updateData.type
    if (updateData.category) updateFields.category = updateData.category
    if (updateData.manufacturer) updateFields.manufacturer = updateData.manufacturer
    if (updateData.model) updateFields.model = updateData.model
    if (updateData.workingLoadLimit) updateFields.workingLoadLimit = parseFloat(updateData.workingLoadLimit)
    if (updateData.status) updateFields.status = updateData.status
    if (updateData.location) updateFields.location = updateData.location
    if (updateData.condition) updateFields.condition = parseInt(updateData.condition)
    if (updateData.notes) updateFields.notes = updateData.notes
    if (updateData.lastInspection) updateFields.lastInspection = new Date(updateData.lastInspection)
    if (updateData.nextInspection) updateFields.nextInspection = new Date(updateData.nextInspection)
    if (updateData.certificationExpiry) updateFields.certificationExpiry = new Date(updateData.certificationExpiry)

    // Update equipment
    const updatedEquipment = await prisma.riggingEquipment.update({
      where: { id },
      data: updateFields,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      equipment: updatedEquipment,
      message: 'Equipment updated successfully'
    })
  } catch (error) {
    console.error('Error updating equipment:', error)
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
      return NextResponse.json({ error: 'Equipment ID required' }, { status: 400 })
    }

    // Check if equipment exists and belongs to user
    const existing = await prisma.riggingEquipment.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }

    // Soft delete by updating status to OUT_OF_SERVICE
    const updatedEquipment = await prisma.riggingEquipment.update({
      where: { id },
      data: {
        status: 'OUT_OF_SERVICE',
        notes: existing.notes ? `${existing.notes}\n\nMarked as out of service on ${new Date().toISOString()}` : `Marked as out of service on ${new Date().toISOString()}`
      }
    })

    return NextResponse.json({
      success: true,
      equipment: updatedEquipment,
      message: 'Equipment marked as out of service successfully'
    })
  } catch (error) {
    console.error('Error deleting equipment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
