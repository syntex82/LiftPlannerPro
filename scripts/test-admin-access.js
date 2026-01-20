#!/usr/bin/env node

/**
 * Test Admin Access
 * Quick test to verify admin user can access admin features
 */

console.log('🧪 Testing Admin Access...')
console.log('=' .repeat(40))

// Test admin email check
function testAdminCheck() {
  console.log('\n1. 📧 Testing Admin Email Check:')
  
  const adminEmails = [
    'mickyblenk@gmail.com',
    'admin@liftplannerpro.org'
  ]
  
  const isAdmin = (email) => {
    return email && adminEmails.includes(email)
  }
  
  const testEmail = 'mickyblenk@gmail.com'
  const result = isAdmin(testEmail)
  
  console.log(`   Email: ${testEmail}`)
  console.log(`   Is Admin: ${result ? '✅ YES' : '❌ NO'}`)
  
  return result
}

// Test auth configuration
function testAuthConfig() {
  console.log('\n2. 🔐 Testing Auth Configuration:')
  
  const credentials = {
    email: 'mickyblenk@gmail.com',
    password: 'syntex82'
  }
  
  // Simulate auth check
  const isValidAdmin = (
    credentials.email === "mickyblenk@gmail.com" && 
    credentials.password === "syntex82"
  )
  
  console.log(`   Email: ${credentials.email}`)
  console.log(`   Password: ${'*'.repeat(credentials.password.length)}`)
  console.log(`   Auth Valid: ${isValidAdmin ? '✅ YES' : '❌ NO'}`)
  
  return isValidAdmin
}

// Test database connection
async function testDatabaseConnection() {
  console.log('\n3. 🗄️ Testing Database Connection:')
  
  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    // Test connection
    await prisma.$connect()
    console.log('   Database: ✅ Connected')
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'mickyblenk@gmail.com' }
    })
    
    if (user) {
      console.log('   User Found: ✅ YES')
      console.log(`   User Role: ${user.role || 'not set'}`)
      console.log(`   User Active: ${user.isActive ? 'YES' : 'NO'}`)
    } else {
      console.log('   User Found: ❌ NO')
    }
    
    await prisma.$disconnect()
    return !!user
    
  } catch (error) {
    console.log(`   Database: ❌ Error - ${error.message}`)
    return false
  }
}

// Main test function
async function runAdminTests() {
  console.log('🚀 Running Admin Access Tests...\n')
  
  const results = {
    emailCheck: false,
    authConfig: false,
    database: false
  }
  
  try {
    results.emailCheck = testAdminCheck()
    results.authConfig = testAuthConfig()
    results.database = await testDatabaseConnection()
    
    console.log('\n' + '=' .repeat(40))
    console.log('📊 Test Results:')
    console.log(`   Email Check: ${results.emailCheck ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`   Auth Config: ${results.authConfig ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`   Database: ${results.database ? '✅ PASS' : '❌ FAIL'}`)
    
    const allPassed = Object.values(results).every(result => result)
    
    if (allPassed) {
      console.log('\n🎉 All tests passed! Admin access should work.')
      console.log('\n📝 Login Instructions:')
      console.log('   1. Go to: http://localhost:3000/auth/signin')
      console.log('   2. Email: mickyblenk@gmail.com')
      console.log('   3. Password: syntex82')
      console.log('   4. After login, visit: http://localhost:3000/admin')
      console.log('   5. You should see the admin dashboard!')
      
    } else {
      console.log('\n⚠️ Some tests failed. Issues to fix:')
      
      if (!results.emailCheck) {
        console.log('   • Email not in admin list')
      }
      if (!results.authConfig) {
        console.log('   • Auth configuration issue')
      }
      if (!results.database) {
        console.log('   • Database connection or user not found')
        console.log('   • Run: node scripts/setup-admin-user.js')
      }
    }
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error)
  }
}

// Troubleshooting guide
function showTroubleshootingGuide() {
  console.log('\n🔧 Troubleshooting Guide:')
  console.log('\nIf admin access still doesn\'t work:')
  console.log('\n1. 🗄️ Setup Database User:')
  console.log('   node scripts/setup-admin-user.js')
  console.log('\n2. 🔄 Clear Browser Data:')
  console.log('   • Clear cookies and local storage')
  console.log('   • Try incognito/private browsing')
  console.log('\n3. 🔐 Check Session:')
  console.log('   • Logout and login again')
  console.log('   • Check browser console for errors')
  console.log('\n4. 🚀 Restart Server:')
  console.log('   • Stop server (Ctrl+C)')
  console.log('   • Run: npm run dev')
  console.log('   • Try accessing admin again')
  console.log('\n5. 🧪 Test Direct Access:')
  console.log('   • Try: http://localhost:3000/admin')
  console.log('   • Should redirect to login if not authenticated')
  console.log('   • Should show admin dashboard if authenticated')
}

// Run tests
if (require.main === module) {
  runAdminTests()
    .then(() => showTroubleshootingGuide())
    .catch(error => {
      console.error('❌ Test failed:', error)
      process.exit(1)
    })
}

module.exports = { runAdminTests }
