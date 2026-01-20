const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:syntex82@localhost:5432/liftplannerpro_prod'
    }
  }
})

async function testRiggingAPI() {
  console.log('🧪 Testing Rigging Loft Management API...')

  try {
    // Get the admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: 'mickyblenk@gmail.com' }
    })

    if (!adminUser) {
      console.log('❌ Admin user not found')
      return
    }

    console.log('👤 Found admin user:', adminUser.email)

    // Test creating rigging equipment directly with Prisma
    const equipmentData = [
      {
        equipmentNumber: 'SL-001',
        type: 'SLING',
        category: 'LIFTING_GEAR',
        manufacturer: 'Lift-All',
        model: 'WR-10T',
        workingLoadLimit: 10.0,
        status: 'IN_SERVICE',
        location: 'Warehouse A',
        condition: 5,
        lastInspection: new Date('2024-07-01'),
        nextInspection: new Date('2025-01-01'),
        certificationExpiry: new Date('2025-12-31'),
        userId: adminUser.id,
        notes: 'Wire rope sling in excellent condition'
      },
      {
        equipmentNumber: 'SH-002',
        type: 'SHACKLE',
        category: 'LIFTING_GEAR',
        manufacturer: 'Crosby',
        model: 'G-209',
        workingLoadLimit: 5.0,
        status: 'IN_SERVICE',
        location: 'Warehouse A',
        condition: 5,
        lastInspection: new Date('2024-06-15'),
        nextInspection: new Date('2024-12-15'),
        certificationExpiry: new Date('2025-06-15'),
        userId: adminUser.id,
        notes: 'Bow shackle with safety pin'
      },
      {
        equipmentNumber: 'CB-003',
        type: 'CHAIN_BLOCK',
        category: 'LIFTING_EQUIPMENT',
        manufacturer: 'Yale',
        model: 'VS3-2T',
        workingLoadLimit: 2.0,
        status: 'IN_SERVICE',
        location: 'Workshop',
        condition: 4,
        lastInspection: new Date('2024-05-20'),
        nextInspection: new Date('2024-11-20'),
        certificationExpiry: new Date('2025-05-20'),
        userId: adminUser.id,
        notes: 'Manual chain hoist, 3m lift height'
      }
    ]

    console.log('🔧 Creating rigging equipment...')
    const createdEquipment = []
    
    for (const equipment of equipmentData) {
      try {
        const existing = await prisma.riggingEquipment.findUnique({
          where: { equipmentNumber: equipment.equipmentNumber }
        })
        
        if (!existing) {
          const created = await prisma.riggingEquipment.create({
            data: equipment
          })
          createdEquipment.push(created)
          console.log(`   ✅ Created equipment: ${equipment.equipmentNumber}`)
        } else {
          console.log(`   ⚠️  Equipment already exists: ${equipment.equipmentNumber}`)
          createdEquipment.push(existing)
        }
      } catch (error) {
        console.log(`   ❌ Error creating ${equipment.equipmentNumber}:`, error.message)
      }
    }

    // Test fetching equipment
    console.log('\n📋 Fetching all equipment...')
    const allEquipment = await prisma.riggingEquipment.findMany({
      where: { userId: adminUser.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`   ✅ Found ${allEquipment.length} equipment items`)
    allEquipment.forEach(item => {
      console.log(`   - ${item.equipmentNumber}: ${item.type} (${item.status})`)
    })

    // Test creating certifications
    if (createdEquipment.length > 0) {
      console.log('\n📋 Creating sample certifications...')
      
      const certificationData = [
        {
          equipmentId: createdEquipment[0].id,
          certificateNumber: 'CERT-2024-001',
          certificateType: 'initial',
          issuedDate: new Date('2024-01-15'),
          expiryDate: new Date('2024-12-15'),
          issuedBy: 'Lifting Gear Inspection Ltd',
          competentPerson: 'John Smith (LEEA)',
          testLoad: 12.5,
          testResult: 'pass',
          notes: 'Initial certification after purchase'
        }
      ]

      for (const cert of certificationData) {
        try {
          const existing = await prisma.equipmentCertification.findUnique({
            where: { certificateNumber: cert.certificateNumber }
          })
          
          if (!existing) {
            await prisma.equipmentCertification.create({
              data: cert
            })
            console.log(`   ✅ Created certification: ${cert.certificateNumber}`)
          } else {
            console.log(`   ⚠️  Certification already exists: ${cert.certificateNumber}`)
          }
        } catch (error) {
          console.log(`   ❌ Error creating certification:`, error.message)
        }
      }
    }

    console.log('\n✅ Rigging loft data test completed successfully!')
    console.log(`📊 Equipment created/found: ${createdEquipment.length}`)

  } catch (error) {
    console.error('❌ Error testing rigging API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRiggingAPI()
