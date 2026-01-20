const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedChat() {
  try {
    console.log('🌱 Seeding chat messages...')

    // Find or create a system user
    let systemUser = await prisma.user.findUnique({
      where: { email: 'system@liftplannerpro.org' }
    })

    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: 'system@liftplannerpro.org',
          name: 'System',
          role: 'system'
        }
      })
    }

    // Check if welcome messages already exist
    const existingMessages = await prisma.chatMessage.count()
    
    if (existingMessages === 0) {
      // Create welcome messages
      await prisma.chatMessage.createMany({
        data: [
          {
            content: 'Welcome to Lift Planner Pro chat! 🎉',
            messageType: 'text',
            roomId: 1,
            userId: systemUser.id,
            createdAt: new Date(Date.now() - 3600000) // 1 hour ago
          },
          {
            content: 'Click the video icon 📹 to start a video call with your team!',
            messageType: 'text',
            roomId: 1,
            userId: systemUser.id,
            createdAt: new Date(Date.now() - 1800000) // 30 minutes ago
          },
          {
            content: 'Chat messages are now persistent and will be saved across sessions. All team members can see and reply to messages in real-time! 💬',
            messageType: 'text',
            roomId: 1,
            userId: systemUser.id,
            createdAt: new Date(Date.now() - 900000) // 15 minutes ago
          }
        ]
      })

      console.log('✅ Chat messages seeded successfully!')
    } else {
      console.log('ℹ️ Chat messages already exist, skipping seed.')
    }

  } catch (error) {
    console.error('❌ Error seeding chat:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedChat()
