import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetPassword() {
  try {
    const email = 'mickyblenk@gmail.com'
    const newPassword = 'Admin123!'
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const user = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        loginAttempts: 0,
        lockedUntil: null
      }
    })

    console.log(`\n✅ Password reset successful!`)
    console.log(`   Email: ${email}`)
    console.log(`   New Password: ${newPassword}`)
    console.log(`\n⚠️  Please change this password after logging in!`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()

