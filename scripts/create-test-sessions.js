const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestSessions() {
  console.log('🧪 Creating Test Active Sessions...\n')

  try {
    // Create some test login events to simulate active sessions
    const testSessions = [
      {
        userId: 'admin-user',
        action: 'LOGIN_SUCCESS',
        resource: 'email:mickyblenk@gmail.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        success: true,
        details: JSON.stringify({
          email: 'mickyblenk@gmail.com',
          userType: 'admin',
          name: 'Micky Blenk',
          subscription: 'enterprise',
          timestamp: new Date().toISOString()
        }),
        riskLevel: 'LOW',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        userId: 'demo-user',
        action: 'LOGIN_SUCCESS',
        resource: 'email:demo@liftplanner.com',
        ipAddress: '203.0.113.45',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        success: true,
        details: JSON.stringify({
          email: 'demo@liftplanner.com',
          userType: 'demo',
          name: 'Demo User',
          subscription: 'pro',
          timestamp: new Date().toISOString()
        }),
        riskLevel: 'LOW',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        userId: 'user-123',
        action: 'LOGIN_SUCCESS',
        resource: 'email:john.doe@example.com',
        ipAddress: '198.51.100.25',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        success: true,
        details: JSON.stringify({
          email: 'john.doe@example.com',
          userType: 'registered',
          name: 'John Doe',
          subscription: 'premium',
          timestamp: new Date().toISOString()
        }),
        riskLevel: 'LOW',
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      {
        userId: 'user-456',
        action: 'LOGIN_SUCCESS',
        resource: 'email:jane.smith@company.com',
        ipAddress: '172.16.0.50',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        success: true,
        details: JSON.stringify({
          email: 'jane.smith@company.com',
          userType: 'registered',
          name: 'Jane Smith',
          subscription: 'pro',
          timestamp: new Date().toISOString()
        }),
        riskLevel: 'MEDIUM',
        createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      }
    ]

    console.log('📝 Creating test security log entries...')

    for (const session of testSessions) {
      await prisma.securityLog.create({
        data: session
      })
      console.log(`✅ Created session for ${JSON.parse(session.details).email}`)
    }

    console.log('\n🎯 Test Sessions Created Successfully!')
    console.log('📋 Summary:')
    console.log('   - 4 test active sessions created')
    console.log('   - Mix of admin, demo, and registered users')
    console.log('   - Different IP addresses and devices')
    console.log('   - Various login times (15 min to 2 hours ago)')
    console.log('   - Different risk levels and subscription types')
    console.log('')
    console.log('🔍 How to View:')
    console.log('   1. Login as admin (mickyblenk@gmail.com)')
    console.log('   2. Go to https://liftplannerpro.org/admin')
    console.log('   3. Click "Active Sessions" tab')
    console.log('   4. You should now see 4 active user sessions')
    console.log('')
    console.log('🎨 Expected Display:')
    console.log('   🟢 Micky Blenk (mickyblenk@gmail.com) [Enterprise]')
    console.log('      Login: 2h ago | IP: 192.168.1.100 | Desktop | Risk: LOW')
    console.log('')
    console.log('   🟢 Demo User (demo@liftplanner.com) [Pro]')
    console.log('      Login: 1h ago | IP: 203.0.113.45 | Mobile | Risk: LOW')
    console.log('')
    console.log('   🟢 John Doe (john.doe@example.com) [Premium]')
    console.log('      Login: 30m ago | IP: 198.51.100.25 | Desktop | Risk: LOW')
    console.log('')
    console.log('   🟡 Jane Smith (jane.smith@company.com) [Pro]')
    console.log('      Login: 15m ago | IP: 172.16.0.50 | Desktop | Risk: MEDIUM')

  } catch (error) {
    console.error('❌ Error creating test sessions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestSessions()
