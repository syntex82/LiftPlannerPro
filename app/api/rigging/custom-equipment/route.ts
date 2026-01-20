import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      name,
      category,
      type,
      manufacturer,
      model,
      swl,
      breakingLoad,
      weight,
      dimensions,
      specifications,
      description,
      safetyNotes,
      inspectionRequirements,
      applications,
      image,
      cadData,
      objectCount
    } = data

    // Validate required fields
    if (!name || !category || !type || !swl) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, type, swl' },
        { status: 400 }
      )
    }

    // Create new custom rigging equipment
    const newEquipment = await prisma.riggingEquipment.create({
      data: {
        equipmentNumber: `CUSTOM-${Date.now()}`,
        type,
        category,
        manufacturer: manufacturer || 'Custom',
        model: model || 'Custom',
        workingLoadLimit: parseFloat(swl),
        location: 'Library',
        notes: JSON.stringify({
          breakingLoad,
          weight,
          dimensions,
          specifications,
          description,
          safetyNotes: safetyNotes || [],
          inspectionRequirements: inspectionRequirements || [],
          applications: applications || [],
          image: image || '/api/placeholder/300/200',
          isCustom: true,
          cadData: cadData || null,
          objectCount: objectCount || 0
        }),
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
      message: 'Custom equipment added to library successfully'
    })
  } catch (error) {
    console.error('Error creating custom equipment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all custom equipment for the user
    const customEquipment = await prisma.riggingEquipment.findMany({
      where: {
        userId: session.user.id,
        notes: {
          contains: 'isCustom'
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      equipment: customEquipment
    })
  } catch (error) {
    console.error('Error fetching custom equipment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      id,
      name,
      category,
      type,
      manufacturer,
      model,
      swl,
      breakingLoad,
      weight,
      dimensions,
      specifications,
      description,
      safetyNotes,
      inspectionRequirements,
      applications,
      image,
      cadData,
      objectCount
    } = data

    if (!id) {
      return NextResponse.json(
        { error: 'Equipment ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingEquipment = await prisma.riggingEquipment.findUnique({
      where: { id }
    })

    if (!existingEquipment || existingEquipment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Parse existing notes
    let existingNotes: any = {}
    try {
      existingNotes = JSON.parse(existingEquipment.notes || '{}')
    } catch (e) {
      existingNotes = {}
    }

    // Update equipment
    const updatedEquipment = await prisma.riggingEquipment.update({
      where: { id },
      data: {
        type: type || existingEquipment.type,
        category: category || existingEquipment.category,
        manufacturer: manufacturer || existingEquipment.manufacturer,
        model: model || existingEquipment.model,
        workingLoadLimit: swl ? parseFloat(swl) : existingEquipment.workingLoadLimit,
        notes: JSON.stringify({
          ...existingNotes,
          breakingLoad: breakingLoad !== undefined ? breakingLoad : existingNotes?.breakingLoad,
          weight: weight !== undefined ? weight : existingNotes?.weight,
          dimensions: dimensions || existingNotes?.dimensions,
          specifications: specifications || existingNotes?.specifications,
          description: description || existingNotes?.description,
          safetyNotes: safetyNotes || existingNotes?.safetyNotes || [],
          inspectionRequirements: inspectionRequirements || existingNotes?.inspectionRequirements || [],
          applications: applications || existingNotes?.applications || [],
          image: image || existingNotes?.image || '/api/placeholder/300/200',
          isCustom: true,
          cadData: cadData || existingNotes?.cadData,
          objectCount: objectCount !== undefined ? objectCount : existingNotes?.objectCount
        })
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
      equipment: updatedEquipment,
      message: 'Equipment updated successfully'
    })
  } catch (error) {
    console.error('Error updating equipment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

