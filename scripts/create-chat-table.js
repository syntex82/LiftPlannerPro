const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createChatTable() {
  try {
    console.log('🔧 Creating chat_messages table manually...')

    // Create the table using raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "chat_messages" (
        "id" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "messageType" TEXT NOT NULL DEFAULT 'text',
        "roomId" INTEGER NOT NULL DEFAULT 1,
        "replyTo" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "userId" TEXT NOT NULL,
        
        CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
      );
    `

    console.log('✅ chat_messages table created successfully!')

    // Add foreign key constraint
    await prisma.$executeRaw`
      ALTER TABLE "chat_messages" 
      ADD CONSTRAINT "chat_messages_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `

    console.log('✅ Foreign key constraint added!')

    // Check if table exists and has data
    const count = await prisma.chatMessage.count()
    console.log(`📊 Current message count: ${count}`)

    if (count === 0) {
      console.log('🌱 Adding initial messages...')
      
      // Find or create system user
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

      // Add welcome messages
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

      console.log('✅ Initial messages added!')
    }

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Table already exists, checking data...')
      const count = await prisma.chatMessage.count()
      console.log(`📊 Current message count: ${count}`)
    } else {
      console.error('❌ Error creating chat table:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createChatTable()
