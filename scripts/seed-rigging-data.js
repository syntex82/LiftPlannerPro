const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedRiggingData() {
  console.log('🏗️  Seeding Rigging Loft Management Data...')

  try {
    // Get any user (preferably admin)
    let adminUser = await prisma.user.findFirst({
      where: { email: 'mickyblenk@gmail.com' }
    })

    if (!adminUser) {
      // Try to find any user
      adminUser = await prisma.user.findFirst()

      if (!adminUser) {
        console.log('❌ No users found in database')
        return
      }
    }

    console.log('👤 Found admin user:', adminUser.email)

    // Sample rigging equipment
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
      },
      {
        equipmentNumber: 'WS-004',
        type: 'WEBBING_SLING',
        category: 'LIFTING_GEAR',
        manufacturer: 'SpanSet',
        model: 'Red-X',
        workingLoadLimit: 3.0,
        status: 'IN_SERVICE',
        location: 'Warehouse B',
        condition: 5,
        lastInspection: new Date('2024-08-01'),
        nextInspection: new Date('2025-02-01'),
        certificationExpiry: new Date('2025-08-01'),
        userId: adminUser.id,
        notes: 'Polyester webbing sling, 2m length'
      },
      {
        equipmentNumber: 'LB-005',
        type: 'LIFTING_BEAM',
        category: 'LIFTING_EQUIPMENT',
        manufacturer: 'Modulift',
        model: 'MOD-5T',
        workingLoadLimit: 5.0,
        status: 'IN_SERVICE',
        location: 'Yard',
        condition: 4,
        lastInspection: new Date('2024-04-10'),
        nextInspection: new Date('2024-10-10'),
        certificationExpiry: new Date('2025-04-10'),
        userId: adminUser.id,
        notes: 'Adjustable lifting beam, 2-5m span'
      }
    ]

    // Create equipment
    console.log('🔧 Creating rigging equipment...')
    const createdEquipment = []
    
    for (const equipment of equipmentData) {
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
    }

    // Sample certifications
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
      },
      {
        equipmentId: createdEquipment[1].id,
        certificateNumber: 'CERT-2024-002',
        certificateType: 'periodic',
        issuedDate: new Date('2024-06-15'),
        expiryDate: new Date('2025-06-15'),
        issuedBy: 'Marine Inspection Services',
        competentPerson: 'Sarah Jones (LEEA)',
        testLoad: 6.25,
        testResult: 'pass',
        notes: '12-month periodic inspection'
      },
      {
        equipmentId: createdEquipment[2].id,
        certificateNumber: 'CERT-2024-003',
        certificateType: 'periodic',
        issuedDate: new Date('2024-05-20'),
        expiryDate: new Date('2025-05-20'),
        issuedBy: 'Lifting Gear Inspection Ltd',
        competentPerson: 'Mike Wilson (LEEA)',
        testLoad: 2.5,
        testResult: 'pass',
        notes: 'Annual inspection and load test'
      }
    ]

    // Create certifications
    console.log('📋 Creating certifications...')
    for (const cert of certificationData) {
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
    }

    console.log('✅ Rigging loft data seeded successfully!')
    console.log(`📊 Equipment created: ${createdEquipment.length}`)
    console.log(`📋 Certifications created: ${certificationData.length}`)

  } catch (error) {
    console.error('❌ Error seeding rigging data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedRiggingData()
