#!/usr/bin/env node

/**
 * Production Migration Script for Lift Planner Pro
 * Migrates database schema and sets up production environment
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function migrateToProduction() {
  console.log('🚀 Starting production migration for Lift Planner Pro...')
  
  try {
    // 1. Apply database schema changes
    console.log('📊 Applying database schema changes...')
    
    // Check if new tables exist, create if not
    await createProductionTables()
    
    // 2. Migrate existing data
    console.log('📦 Migrating existing data...')
    await migrateExistingData()
    
    // 3. Set up admin users
    console.log('👤 Setting up admin users...')
    await setupAdminUsers()
    
    // 4. Create initial system configuration
    console.log('⚙️ Creating system configuration...')
    await createSystemConfig()
    
    // 5. Set up security logging
    console.log('🔒 Initializing security logging...')
    await initializeSecurityLogging()
    
    console.log('✅ Production migration completed successfully!')
    console.log('')
    console.log('🎉 Your Lift Planner Pro is now ready for production!')
    console.log('🌐 Live at: https://liftplannerpro.org')
    console.log('')
    console.log('Next steps:')
    console.log('1. Deploy to production server')
    console.log('2. Configure SSL certificates')
    console.log('3. Set up monitoring and backups')
    console.log('4. Test all functionality')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

async function createProductionTables() {
  console.log('  Creating production tables...')
  
  // The tables will be created automatically by Prisma when we run prisma db push
  // This function ensures all tables exist and have correct structure
  
  try {
    // Test if new tables exist by trying to count records
    await prisma.securityLog.count()
    console.log('  ✅ Security logs table ready')
  } catch (error) {
    console.log('  📝 Security logs table will be created')
  }
  
  try {
    await prisma.issueReport.count()
    console.log('  ✅ Issue reports table ready')
  } catch (error) {
    console.log('  📝 Issue reports table will be created')
  }
  
  try {
    await prisma.userSession.count()
    console.log('  ✅ User sessions table ready')
  } catch (error) {
    console.log('  📝 User sessions table will be created')
  }
  
  try {
    await prisma.riggingEquipment.count()
    console.log('  ✅ Rigging equipment table ready')
  } catch (error) {
    console.log('  📝 Rigging equipment table will be created')
  }
}

async function migrateExistingData() {
  console.log('  Checking existing users...')
  
  // Update existing users with new fields
  const users = await prisma.user.findMany()
  
  for (const user of users) {
    // Add default values for new fields if they don't exist
    const updateData = {}
    
    if (user.isActive === undefined) updateData.isActive = true
    if (user.loginAttempts === undefined) updateData.loginAttempts = 0
    if (user.role === undefined || user.role === null) updateData.role = 'user'
    if (user.subscription === undefined || user.subscription === null) updateData.subscription = 'free'
    
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      })
      console.log(`  ✅ Updated user: ${user.email}`)
    }
  }
}

async function setupAdminUsers() {
  const adminEmails = [
    'mickyblenk@gmail.com',
    'admin@liftplannerpro.org'
  ]
  
  for (const email of adminEmails) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      })
      
      if (user) {
        // Update existing user to admin
        await prisma.user.update({
          where: { email },
          data: {
            role: 'admin',
            subscription: 'enterprise'
          }
        })
        console.log(`  ✅ Updated admin user: ${email}`)
      } else {
        console.log(`  ⚠️ Admin user not found: ${email} (will be created on first login)`)
      }
    } catch (error) {
      console.log(`  ❌ Error setting up admin user ${email}:`, error.message)
    }
  }
}

async function createSystemConfig() {
  const configs = [
    {
      key: 'app_version',
      value: '1.0.0',
      description: 'Current application version'
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      description: 'Enable/disable maintenance mode'
    },
    {
      key: 'max_file_size',
      value: '10485760',
      description: 'Maximum file upload size in bytes'
    },
    {
      key: 'session_timeout',
      value: '3600000',
      description: 'Session timeout in milliseconds'
    },
    {
      key: 'security_logging',
      value: 'true',
      description: 'Enable security event logging'
    }
  ]
  
  for (const config of configs) {
    try {
      await prisma.systemConfig.upsert({
        where: { key: config.key },
        update: { value: config.value },
        create: config
      })
      console.log(`  ✅ System config: ${config.key}`)
    } catch (error) {
      // SystemConfig table might not exist yet, skip for now
      console.log(`  📝 System config will be created: ${config.key}`)
    }
  }
}

async function initializeSecurityLogging() {
  // Create initial security log entry
  try {
    await prisma.securityLog.create({
      data: {
        action: 'SYSTEM_MIGRATION',
        resource: 'database',
        ipAddress: '127.0.0.1',
        userAgent: 'Migration Script',
        success: true,
        details: JSON.stringify({
          event: 'production_migration_completed',
          timestamp: new Date().toISOString()
        }),
        riskLevel: 'LOW'
      }
    })
    console.log('  ✅ Security logging initialized')
  } catch (error) {
    console.log('  📝 Security logging will be available after schema update')
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToProduction()
}

module.exports = { migrateToProduction }
