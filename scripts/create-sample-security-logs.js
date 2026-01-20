const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createSampleSecurityLogs() {
  console.log('🧪 Creating Sample Security Log Entries...\n')

  try {
    // Create sample security log entries with proper dates
    const sampleLogs = [
      {
        userId: null,
        action: 'LOGIN_SUCCESS',
        resource: 'email:admin@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        details: JSON.stringify({
          email: 'admin@example.com',
          userType: 'admin',
          timestamp: new Date().toISOString()
        }),
        riskLevel: 'LOW',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        userId: null,
        action: 'LOGIN_FAILED',
        resource: 'email:hacker@malicious.com',
        ipAddress: '203.0.113.45',
        userAgent: 'curl/7.68.0',
        success: false,
        details: JSON.stringify({
          email: 'hacker@malicious.com',
          reason: 'Invalid credentials',
          attempts: 5,
          timestamp: new Date().toISOString()
        }),
        riskLevel: 'HIGH',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        userId: null,
        action: 'SUSPICIOUS_ACTIVITY',
        resource: 'multiple_failed_logins',
        ipAddress: '198.51.100.25',
        userAgent: 'Python-requests/2.25.1',
        success: false,
        details: JSON.stringify({
          activity: 'Multiple failed login attempts',
          count: 10,
          timeframe: '5 minutes',
          blocked: true,
          timestamp: new Date().toISOString()
        }),
        riskLevel: 'CRITICAL',
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      {
        userId: null,
        action: 'LOGOUT',
        resource: 'email:user@example.com',
        ipAddress: '172.16.0.50',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        success: true,
        details: JSON.stringify({
          email: 'user@example.com',
          sessionDuration: '2 hours 15 minutes',
          timestamp: new Date().toISOString()
        }),
        riskLevel: 'LOW',
        createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      },
      {
        userId: null,
        action: 'PASSWORD_CHANGE',
        resource: 'email:user@example.com',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        success: true,
        details: JSON.stringify({
          email: 'user@example.com',
          method: 'self_service',
          timestamp: new Date().toISOString()
        }),
        riskLevel: 'MEDIUM',
        createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      },
      {
        userId: null,
        action: 'ADMIN_ACTION',
        resource: 'user_management',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        details: JSON.stringify({
          action: 'User account created',
          targetUser: 'newuser@example.com',
          adminUser: 'admin@example.com',
          timestamp: new Date().toISOString()
        }),
        riskLevel: 'LOW',
        createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      }
    ]

    console.log('📝 Creating sample security log entries...')

    for (const log of sampleLogs) {
      await prisma.securityLog.create({
        data: log
      })
      const details = JSON.parse(log.details)
      console.log(`✅ Created ${log.action} event for ${details.email || 'system'} at ${log.createdAt.toLocaleString()}`)
    }

    console.log('\n🎯 Sample Security Logs Created Successfully!')
    console.log('📋 Summary:')
    console.log('   - 6 sample security events created')
    console.log('   - Mix of successful and failed events')
    console.log('   - Different risk levels (LOW, MEDIUM, HIGH, CRITICAL)')
    console.log('   - Various event types (LOGIN, LOGOUT, ADMIN_ACTION, etc.)')
    console.log('   - Realistic timestamps spread over last 2 hours')
    console.log('   - Different IP addresses and user agents')
    console.log('')
    console.log('🔍 How to View:')
    console.log('   1. Login as admin (mickyblenk@gmail.com)')
    console.log('   2. Go to https://liftplannerpro.org/admin')
    console.log('   3. Click "Security Audit Log" tab')
    console.log('   4. You should now see 6 security events with proper dates')
    console.log('')
    console.log('🎨 Expected Display:')
    console.log('   🔴 CRITICAL  SUSPICIOUS_ACTIVITY  30m ago')
    console.log('   🟠 HIGH      LOGIN_FAILED         1h ago')
    console.log('   🟡 MEDIUM    PASSWORD_CHANGE      10m ago')
    console.log('   🟢 LOW       LOGIN_SUCCESS        2h ago')
    console.log('   🟢 LOW       LOGOUT               15m ago')
    console.log('   🟢 LOW       ADMIN_ACTION         5m ago')
    console.log('')
    console.log('✅ All events should now display with valid dates!')

  } catch (error) {
    console.error('❌ Error creating sample security logs:', error)
    
    if (error.code === 'P2002') {
      console.log('💡 Note: Some entries may already exist (duplicate constraint)')
    } else if (error.code === 'P2003') {
      console.log('💡 Note: Foreign key constraint - this is expected for sample data')
    }
  } finally {
    await prisma.$disconnect()
  }
}

createSampleSecurityLogs()
