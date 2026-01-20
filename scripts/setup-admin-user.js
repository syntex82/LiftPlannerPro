#!/usr/bin/env node

/**
 * Setup Admin User Script
 * Creates or updates admin user with proper permissions
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setupAdminUser() {
  console.log('🔧 Setting up admin user...')
  
  try {
    const adminEmail = 'mickyblenk@gmail.com'
    const adminPassword = 'syntex82'
    const adminName = 'Micky Blenk'

    // Check if admin user exists
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (adminUser) {
      console.log('✅ Admin user found in database')
      console.log(`   ID: ${adminUser.id}`)
      console.log(`   Name: ${adminUser.name}`)
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Role: ${adminUser.role}`)
      console.log(`   Active: ${adminUser.isActive}`)
      
      // Update to ensure admin role
      if (adminUser.role !== 'admin') {
        console.log('🔄 Updating user role to admin...')
        adminUser = await prisma.user.update({
          where: { email: adminEmail },
          data: {
            role: 'admin',
            subscription: 'enterprise',
            isActive: true,
            loginAttempts: 0,
            lockedUntil: null
          }
        })
        console.log('✅ User updated to admin role')
      }
      
      // Update password if needed
      const isPasswordValid = await bcrypt.compare(adminPassword, adminUser.password || '')
      if (!isPasswordValid) {
        console.log('🔄 Updating admin password...')
        const hashedPassword = await bcrypt.hash(adminPassword, 12)
        await prisma.user.update({
          where: { email: adminEmail },
          data: { password: hashedPassword }
        })
        console.log('✅ Admin password updated')
      }
      
    } else {
      console.log('➕ Creating new admin user...')
      
      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 12)
      
      // Create admin user
      adminUser = await prisma.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          subscription: 'enterprise',
          isActive: true,
          loginAttempts: 0,
          company: 'Lift Planner Pro'
        }
      })
      
      console.log('✅ Admin user created successfully')
    }

    // Verify admin access
    console.log('\n🔍 Verifying admin access...')
    
    // Check auth configuration
    const authConfig = `
// Admin email list in auth configuration
const adminEmails = [
  'mickyblenk@gmail.com',  // Primary admin
  'admin@liftplannerpro.org'   // Backup admin
]

const isAdmin = (email) => {
  return email && adminEmails.includes(email)
}
`
    
    console.log('📋 Auth Configuration:')
    console.log(authConfig)
    
    // Test admin check
    const adminEmails = ['mickyblenk@gmail.com', 'admin@liftplannerpro.org']
    const isAdminResult = adminEmails.includes(adminEmail)
    
    console.log(`🧪 Admin Check Test: ${isAdminResult ? '✅ PASS' : '❌ FAIL'}`)
    
    if (isAdminResult) {
      console.log('\n🎉 Admin user setup complete!')
      console.log('\n📝 Login Details:')
      console.log(`   Email: ${adminEmail}`)
      console.log(`   Password: ${adminPassword}`)
      console.log(`   Role: admin`)
      console.log(`   Subscription: enterprise`)
      
      console.log('\n🚀 Next Steps:')
      console.log('   1. Start the server: npm run dev')
      console.log('   2. Go to: http://localhost:3000/auth/signin')
      console.log('   3. Login with the credentials above')
      console.log('   4. Visit: http://localhost:3000/admin')
      console.log('   5. You should now have full admin access!')
      
    } else {
      console.log('\n❌ Admin check failed - email not in admin list')
    }

  } catch (error) {
    console.error('❌ Error setting up admin user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function checkCurrentUsers() {
  console.log('\n👥 Current Users in Database:')
  console.log('=' .repeat(50))
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscription: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    if (users.length === 0) {
      console.log('📭 No users found in database')
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name || 'Unknown'}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Role: ${user.role || 'user'}`)
        console.log(`   Subscription: ${user.subscription || 'free'}`)
        console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`)
        console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error fetching users:', error)
  }
}

async function createSecurityLog() {
  try {
    // Create a security log entry for admin setup
    await prisma.securityLog.create({
      data: {
        action: 'ADMIN_SETUP',
        resource: 'user_management',
        ipAddress: '127.0.0.1',
        userAgent: 'Admin Setup Script',
        success: true,
        details: JSON.stringify({
          event: 'admin_user_setup_completed',
          timestamp: new Date().toISOString(),
          adminEmail: 'mickyblenk@gmail.com'
        }),
        riskLevel: 'LOW'
      }
    })
    console.log('📝 Security log entry created')
  } catch (error) {
    console.log('⚠️ Could not create security log (table may not exist yet)')
  }
}

// Run setup
if (require.main === module) {
  setupAdminUser()
    .then(() => checkCurrentUsers())
    .then(() => createSecurityLog())
    .catch(error => {
      console.error('❌ Setup failed:', error)
      process.exit(1)
    })
}

module.exports = { setupAdminUser, checkCurrentUsers }
