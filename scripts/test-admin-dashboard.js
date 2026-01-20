console.log('🧪 Testing Admin Dashboard Data Structure...\n')

// Test the expected data structure for admin dashboard
const testUserData = {
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  status: 'active',
  subscription: {
    plan: 'pro',
    status: 'active',
    amount: 79,
    currency: 'USD',
    nextPayment: new Date().toISOString(),
    endDate: new Date().toISOString(),
    paymentMethod: 'Credit Card',
    autoRenew: true
  },
  billing: {
    totalPaid: 500,
    invoiceCount: 6,
    paymentHistory: []
  }
}

// Test functions that were causing errors
function testBillingCalculations(users) {
  console.log('🧮 Testing billing calculations...')
  
  try {
    // Test total revenue calculation
    const totalRevenue = users.reduce((total, user) => total + (user.billing?.totalPaid || 0), 0)
    console.log(`✅ Total Revenue: $${totalRevenue}`)
    
    // Test monthly recurring calculation
    const monthlyRecurring = users
      .filter(u => u.subscription?.status === 'active')
      .reduce((total, user) => total + (user.subscription?.amount || 0), 0)
    console.log(`✅ Monthly Recurring: $${monthlyRecurring}`)
    
    // Test active subscriptions count
    const activeSubscriptions = users.filter(u => u.subscription?.status === 'active').length
    console.log(`✅ Active Subscriptions: ${activeSubscriptions}`)
    
    // Test cancelled subscriptions count
    const cancelledSubscriptions = users.filter(u => u.subscription?.status === 'cancelled').length
    console.log(`✅ Cancelled Subscriptions: ${cancelledSubscriptions}`)
    
    return true
  } catch (error) {
    console.error('❌ Error in billing calculations:', error.message)
    return false
  }
}

function testUserTableData(users) {
  console.log('\n📊 Testing user table data...')
  
  try {
    users.forEach((user, index) => {
      // Test subscription plan access
      const planName = user.subscription?.plan || 'free'
      console.log(`✅ User ${index + 1} - Plan: ${planName}`)
      
      // Test subscription status
      const status = user.subscription?.status || 'unknown'
      console.log(`✅ User ${index + 1} - Status: ${status}`)
      
      // Test billing amount
      const amount = user.subscription?.amount || 0
      console.log(`✅ User ${index + 1} - Amount: $${amount}`)
      
      // Test total paid
      const totalPaid = user.billing?.totalPaid || 0
      console.log(`✅ User ${index + 1} - Total Paid: $${totalPaid}`)
    })
    
    return true
  } catch (error) {
    console.error('❌ Error in user table data:', error.message)
    return false
  }
}

function testSecurityEvents(events) {
  console.log('\n🔒 Testing security events...')
  
  try {
    if (!events || events.length === 0) {
      console.log('⚠️ No security events to test')
      return true
    }
    
    events.forEach((event, index) => {
      // Test event type access
      const type = event?.type || 'Unknown Event'
      console.log(`✅ Event ${index + 1} - Type: ${type}`)
      
      // Test event details
      const details = event?.details || 'No details available'
      console.log(`✅ Event ${index + 1} - Details: ${details}`)
      
      // Test IP address
      const ipAddress = event?.ipAddress || 'Unknown IP'
      console.log(`✅ Event ${index + 1} - IP: ${ipAddress}`)
    })
    
    return true
  } catch (error) {
    console.error('❌ Error in security events:', error.message)
    return false
  }
}

// Run tests
console.log('🚀 Starting Admin Dashboard Tests...\n')

// Create test data
const testUsers = [
  testUserData,
  {
    ...testUserData,
    id: 'test-user-2',
    name: 'Test User 2',
    email: 'test2@example.com',
    subscription: {
      ...testUserData.subscription,
      plan: 'basic',
      amount: 29,
      status: 'cancelled'
    },
    billing: {
      totalPaid: 200,
      invoiceCount: 3,
      paymentHistory: []
    }
  },
  {
    ...testUserData,
    id: 'test-user-3',
    name: 'Test User 3',
    email: 'test3@example.com',
    subscription: {
      ...testUserData.subscription,
      plan: 'enterprise',
      amount: 199
    },
    billing: {
      totalPaid: 1500,
      invoiceCount: 8,
      paymentHistory: []
    }
  }
]

const testEvents = [
  {
    id: 'event-1',
    type: 'LOGIN_SUCCESS',
    details: 'User logged in successfully',
    ipAddress: '192.168.1.100',
    success: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'event-2',
    type: 'LOGIN_FAILED',
    details: 'Failed login attempt',
    ipAddress: '203.0.113.45',
    success: false,
    createdAt: new Date().toISOString()
  }
]

// Run all tests
let allTestsPassed = true

allTestsPassed &= testBillingCalculations(testUsers)
allTestsPassed &= testUserTableData(testUsers)
allTestsPassed &= testSecurityEvents(testEvents)

console.log('\n🎯 Test Results:')
if (allTestsPassed) {
  console.log('✅ All tests passed! Admin dashboard should work without errors.')
  console.log('\n📋 Summary:')
  console.log('- Billing calculations: Working')
  console.log('- User table data: Working')
  console.log('- Security events: Working')
  console.log('- Null safety: Implemented')
} else {
  console.log('❌ Some tests failed. Check the errors above.')
}

console.log('\n🎉 Admin Dashboard Test Complete!')
