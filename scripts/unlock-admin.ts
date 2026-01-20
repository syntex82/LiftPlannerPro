import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function unlockAdmin() {
  try {
    // Find all admin users (case insensitive)
    const result = await prisma.user.updateMany({
      where: {
        OR: [
          { role: { equals: 'ADMIN', mode: 'insensitive' } },
          { role: { equals: 'admin', mode: 'insensitive' } },
          { email: 'mickyblenk@gmail.com' }
        ]
      },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        isActive: true
      }
    })

    console.log(`✅ Unlocked ${result.count} admin account(s)`)

    // List the admin accounts
    const admins = await prisma.user.findMany({
      where: {
        OR: [
          { role: { equals: 'ADMIN', mode: 'insensitive' } },
          { role: { equals: 'admin', mode: 'insensitive' } },
          { email: 'mickyblenk@gmail.com' }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        loginAttempts: true,
        lockedUntil: true,
        isActive: true
      }
    })

    console.log('\nAdmin accounts:')
    admins.forEach(admin => {
      console.log(`  - ${admin.email} (${admin.role}) - Active: ${admin.isActive}, Attempts: ${admin.loginAttempts}, Locked: ${admin.lockedUntil}`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

unlockAdmin()

