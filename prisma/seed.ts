import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive database seeding...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'mickyblenk@gmail.com' },
    update: {},
    create: {
      email: 'mickyblenk@gmail.com',
      name: 'Michael Blenkinsop',
      password: hashedPassword,
      role: 'ADMIN',
      subscription: 'enterprise',
      isActive: true,
      company: 'Lift Planner Pro',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create test users with different subscription levels
  const testUsers = [
    {
      email: 'john.doe@example.com',
      name: 'John Doe',
      subscription: 'pro',
      company: 'Construction Corp'
    },
    {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      subscription: 'basic',
      company: 'Rigging Solutions'
    },
    {
      email: 'mike.wilson@example.com',
      name: 'Mike Wilson',
      subscription: 'enterprise',
      company: 'Heavy Lift Inc'
    },
    {
      email: 'sarah.johnson@example.com',
      name: 'Sarah Johnson',
      subscription: 'free',
      company: 'Small Crane Co'
    },
    {
      email: 'david.brown@example.com',
      name: 'David Brown',
      subscription: 'pro',
      company: 'Mega Lifts Ltd'
    }
  ]

  const createdUsers = []
  for (const userData of testUsers) {
    const hashedTestPassword = await bcrypt.hash('password123', 12)
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedTestPassword,
        role: 'USER',
        isActive: true,
        emailVerified: new Date(),
      },
    })
    createdUsers.push(user)
  }

  console.log('✅ Test users created')

  // Create system configuration
  const systemConfigs = [
    { key: 'app_name', value: 'Lift Planner Pro' },
    { key: 'app_version', value: '2.0.0' },
    { key: 'maintenance_mode', value: 'false' },
    { key: 'max_file_size', value: '10485760' }, // 10MB
    { key: 'allowed_file_types', value: 'jpg,jpeg,png,pdf,dwg,dxf' },
    { key: 'session_timeout', value: '3600' }, // 1 hour
    { key: 'max_login_attempts', value: '5' },
    { key: 'backup_frequency', value: 'daily' },
    { key: 'email_notifications', value: 'true' },
    { key: 'default_subscription', value: 'free' }
  ]

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    })
  }

  console.log('✅ System configuration created')

  // Create sample projects
  const sampleProjects = [
    {
      name: 'Tower Crane Installation',
      description: 'Installation of 200-ton tower crane for high-rise construction',
      category: 'CAD' as any,
      status: 'ACTIVE' as any,
      userId: adminUser.id,
      data: JSON.stringify({
        elements: [
          { type: 'crane', x: 100, y: 100, capacity: 200 },
          { type: 'load', x: 150, y: 150, weight: 50 }
        ]
      })
    },
    {
      name: 'Bridge Beam Lift',
      description: 'Lifting precast concrete beams for bridge construction',
      category: 'LOAD_CALCULATION' as any,
      status: 'ACTIVE' as any,
      userId: createdUsers[0]?.id || adminUser.id,
      data: JSON.stringify({
        elements: [
          { type: 'beam', x: 200, y: 100, weight: 75 },
          { type: 'crane', x: 100, y: 200, capacity: 150 }
        ]
      })
    }
  ]

  for (const project of sampleProjects) {
    await prisma.project.create({
      data: project,
    })
  }

  console.log('✅ Sample projects created')

  // Create sample rigging equipment
  const riggingEquipment = [
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
      equipmentNumber: 'CB-002',
      type: 'HOIST',
      category: 'MECHANICAL',
      manufacturer: 'Yale',
      model: 'CB-5000',
      workingLoadLimit: 5.0,
      status: 'IN_SERVICE',
      location: 'Workshop B',
      condition: 4,
      lastInspection: new Date('2024-06-15'),
      nextInspection: new Date('2024-12-15'),
      certificationExpiry: new Date('2025-06-15'),
      userId: adminUser.id,
      notes: 'Chain block requires minor maintenance'
    }
  ]

  for (const equipment of riggingEquipment) {
    await prisma.riggingEquipment.create({
      data: equipment,
    })
  }

  console.log('✅ Sample rigging equipment created')

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
