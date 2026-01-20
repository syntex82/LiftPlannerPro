import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // First, list all existing users
    const existingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })

    console.log(`\nExisting users (${existingUsers.length}):`)
    existingUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - Active: ${user.isActive}`)
    })

    // Create or update admin account
    const adminEmail = 'michael.syntax@gmail.com'
    const adminPassword = 'Admin123!' // You should change this after first login
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: 'admin',
        isActive: true,
        loginAttempts: 0,
        lockedUntil: null,
        password: hashedPassword
      },
      create: {
        email: adminEmail,
        name: 'Michael Admin',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        subscription: 'pro',
        loginAttempts: 0
      }
    })

    console.log(`\n✅ Admin account ready:`)
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`\n⚠️  Please change this password after first login!`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()

