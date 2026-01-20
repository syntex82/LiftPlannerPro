#!/usr/bin/env node

/**
 * Debug Login Issues
 * Comprehensive debugging for authentication problems
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function debugLogin() {
  console.log('🔍 Debugging Login Issues...')
  console.log('=' .repeat(50))
  
  try {
    // Test 1: Check database connection
    console.log('\n1. 🗄️ Testing Database Connection:')
    await prisma.$connect()
    console.log('   ✅ Database connected successfully')
    
    // Test 2: Check if user exists
    console.log('\n2. 👤 Checking User Account:')
    const adminEmail = 'mickyblenk@gmail.com'
    const user = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (user) {
      console.log('   ✅ User found in database')
      console.log(`   ID: ${user.id}`)
      console.log(`   Name: ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Active: ${user.isActive}`)
      console.log(`   Login Attempts: ${user.loginAttempts}`)
      console.log(`   Locked Until: ${user.lockedUntil || 'Not locked'}`)
      console.log(`   Has Password: ${user.password ? 'Yes' : 'No'}`)
    } else {
      console.log('   ❌ User NOT found in database')
      console.log('   Creating user now...')
      
      const hashedPassword = await bcrypt.hash('syntex82', 12)
      const newUser = await prisma.user.create({
        data: {
          name: 'Micky Blenk',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          subscription: 'enterprise',
          isActive: true,
          loginAttempts: 0
        }
      })
      console.log('   ✅ User created successfully')
      console.log(`   New User ID: ${newUser.id}`)
    }
    
    // Test 3: Check password hash
    console.log('\n3. 🔐 Testing Password:')
    const currentUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (currentUser && currentUser.password) {
      const testPassword = 'syntex82'
      const isPasswordValid = await bcrypt.compare(testPassword, currentUser.password)
      console.log(`   Password Test: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`)
      
      if (!isPasswordValid) {
        console.log('   🔄 Updating password...')
        const newHashedPassword = await bcrypt.hash(testPassword, 12)
        await prisma.user.update({
          where: { email: adminEmail },
          data: { 
            password: newHashedPassword,
            loginAttempts: 0,
            lockedUntil: null
          }
        })
        console.log('   ✅ Password updated')
      }
    } else {
      console.log('   ❌ No password found for user')
    }
    
    // Test 4: Check environment variables
    console.log('\n4. 🌍 Checking Environment Variables:')
    const requiredEnvVars = [
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'DATABASE_URL'
    ]
    
    requiredEnvVars.forEach(varName => {
      const value = process.env[varName]
      console.log(`   ${varName}: ${value ? '✅ Set' : '❌ Missing'}`)
      if (value && varName !== 'DATABASE_URL') {
        console.log(`     Value: ${value.substring(0, 10)}...`)
      }
    })
    
    // Test 5: Test auth logic
    console.log('\n5. 🔑 Testing Auth Logic:')
    const testCredentials = {
      email: 'mickyblenk@gmail.com',
      password: 'syntex82'
    }
    
    // Test hardcoded admin check (from lib/auth.ts)
    const isHardcodedAdmin = (
      testCredentials.email === "mickyblenk@gmail.com" && 
      testCredentials.password === "syntex82"
    )
    console.log(`   Hardcoded Admin Check: ${isHardcodedAdmin ? '✅ PASS' : '❌ FAIL'}`)
    
    // Test database auth
    const dbUser = await prisma.user.findUnique({
      where: { email: testCredentials.email }
    })
    
    if (dbUser && dbUser.password) {
      const dbPasswordValid = await bcrypt.compare(testCredentials.password, dbUser.password)
      console.log(`   Database Auth Check: ${dbPasswordValid ? '✅ PASS' : '❌ FAIL'}`)
    }
    
    // Test 6: Check for account locks
    console.log('\n6. 🔒 Checking Account Status:')
    if (currentUser) {
      const isLocked = currentUser.lockedUntil && new Date(currentUser.lockedUntil) > new Date()
      console.log(`   Account Locked: ${isLocked ? '❌ YES' : '✅ NO'}`)
      console.log(`   Login Attempts: ${currentUser.loginAttempts}`)
      
      if (isLocked || currentUser.loginAttempts > 0) {
        console.log('   🔄 Resetting account status...')
        await prisma.user.update({
          where: { email: adminEmail },
          data: {
            loginAttempts: 0,
            lockedUntil: null,
            isActive: true
          }
        })
        console.log('   ✅ Account status reset')
      }
    }
    
    // Test 7: Create test security log
    console.log('\n7. 📝 Testing Security Logging:')
    try {
      await prisma.securityLog.create({
        data: {
          action: 'LOGIN_DEBUG',
          resource: 'authentication',
          ipAddress: '127.0.0.1',
          userAgent: 'Debug Script',
          success: true,
          details: JSON.stringify({
            event: 'login_debug_test',
            timestamp: new Date().toISOString()
          }),
          riskLevel: 'LOW'
        }
      })
      console.log('   ✅ Security logging working')
    } catch (error) {
      console.log(`   ⚠️ Security logging issue: ${error.message}`)
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function testLoginAPI() {
  console.log('\n8. 🌐 Testing Login API:')
  
  const http = require('http')
  
  const loginData = JSON.stringify({
    email: 'mickyblenk@gmail.com',
    password: 'syntex82'
  })
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/callback/credentials',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  }
  
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      console.log(`   API Response Status: ${res.statusCode}`)
      console.log(`   API Response Headers:`, res.headers)
      
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        console.log(`   API Response Body: ${data.substring(0, 200)}...`)
        resolve()
      })
    })
    
    req.on('error', (error) => {
      console.log(`   ❌ API Error: ${error.message}`)
      resolve()
    })
    
    req.setTimeout(5000, () => {
      console.log('   ⏰ API Timeout')
      req.destroy()
      resolve()
    })
    
    req.write(loginData)
    req.end()
  })
}

async function showLoginInstructions() {
  console.log('\n' + '=' .repeat(50))
  console.log('📋 Login Instructions:')
  console.log('\n1. 🚀 Start the server:')
  console.log('   npm run dev')
  console.log('\n2. 🌐 Open browser and go to:')
  console.log('   http://localhost:3000/auth/signin')
  console.log('\n3. 🔑 Enter credentials:')
  console.log('   Email: mickyblenk@gmail.com')
  console.log('   Password: syntex82')
  console.log('\n4. 🎯 After login, visit:')
  console.log('   http://localhost:3000/admin')
  console.log('\n5. 🔍 If login fails, check:')
  console.log('   • Browser console for errors')
  console.log('   • Network tab for failed requests')
  console.log('   • Clear browser cookies/cache')
  console.log('   • Try incognito/private mode')
  
  console.log('\n🆘 If still not working:')
  console.log('   • Check server console for errors')
  console.log('   • Restart the server')
  console.log('   • Run this debug script again')
}

// Run debug
if (require.main === module) {
  debugLogin()
    .then(() => testLoginAPI())
    .then(() => showLoginInstructions())
    .catch(error => {
      console.error('❌ Debug script failed:', error)
      process.exit(1)
    })
}

module.exports = { debugLogin }
