const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixChatNow() {
  try {
    console.log('🔧 FIXING CHAT TABLE NOW...')

    // Drop and recreate table to ensure it exists
    await prisma.$executeRaw`DROP TABLE IF EXISTS "chat_messages";`
    
    await prisma.$executeRaw`
      CREATE TABLE "chat_messages" (
        "id" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "messageType" TEXT NOT NULL DEFAULT 'text',
        "roomId" INTEGER NOT NULL DEFAULT 1,
        "replyTo" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "userId" TEXT NOT NULL,
        
        CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `

    console.log('✅ TABLE CREATED!')

    // Test the table works
    const testUser = await prisma.user.findFirst()
    if (testUser) {
      await prisma.$executeRaw`
        INSERT INTO "chat_messages" ("id", "content", "messageType", "roomId", "userId", "createdAt", "updatedAt")
        VALUES ('test-1', 'Welcome to Lift Planner Pro chat! 🎉', 'text', 1, ${testUser.id}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
      `
      
      await prisma.$executeRaw`
        INSERT INTO "chat_messages" ("id", "content", "messageType", "roomId", "userId", "createdAt", "updatedAt")
        VALUES ('test-2', 'Chat is now working! Send a message to test.', 'text', 1, ${testUser.id}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
      `
      
      console.log('✅ TEST MESSAGES ADDED!')
    }

    // Verify it works
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "chat_messages";`
    console.log('📊 Message count:', count)

    console.log('🎉 CHAT IS FIXED!')

  } catch (error) {
    console.error('❌ ERROR:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixChatNow()
