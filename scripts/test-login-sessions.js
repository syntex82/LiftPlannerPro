const https = require('https')

console.log('🧪 Testing Login and Active Sessions...\n')

// Create HTTPS agent that accepts self-signed certificates
const agent = new https.Agent({
  rejectUnauthorized: false
})

async function makeRequest(path, method = 'GET', data = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'liftplannerpro.org',
      port: 443,
      path: path,
      method: method,
      agent: agent,
      headers: {
        'User-Agent': 'Login-Sessions-Test/1.0',
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    }

    const req = https.request(options, (res) => {
      let responseData = ''
      
      res.on('data', (chunk) => {
        responseData += chunk
      })
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData)
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers,
            cookies: res.headers['set-cookie'] || []
          })
        } catch (error) {
          resolve({
            status: res.statusCode,
            error: 'Invalid JSON response',
            data: responseData.substring(0, 500),
            headers: res.headers,
            cookies: res.headers['set-cookie'] || []
          })
        }
      })
    })

    req.on('error', (error) => {
      reject({
        error: error.message
      })
    })

    req.setTimeout(10000, () => {
      req.destroy()
      reject({
        error: 'Request timeout'
      })
    })

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

async function testLoginAndSessions() {
  try {
    console.log('🔐 Step 1: Testing Admin Login...')
    
    // First get CSRF token
    const csrfResult = await makeRequest('/api/auth/csrf')
    if (csrfResult.status !== 200) {
      console.log('❌ Failed to get CSRF token')
      return
    }
    
    const csrfToken = csrfResult.data.csrfToken
    console.log('✅ Got CSRF token')
    
    // Attempt admin login
    const loginData = {
      email: 'mickyblenk@gmail.com',
      password: 'syntex82',
      csrfToken: csrfToken
    }
    
    const loginResult = await makeRequest('/api/auth/callback/credentials', 'POST', loginData)
    console.log(`📊 Login Status: ${loginResult.status}`)
    
    if (loginResult.status === 200) {
      console.log('✅ Admin login successful!')
      
      // Extract session cookies
      const sessionCookies = loginResult.cookies.join('; ')
      console.log('🍪 Got session cookies')
      
      // Wait a moment for security logging to complete
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('\n🔍 Step 2: Checking Active Sessions...')
      
      // Check active sessions
      const sessionsResult = await makeRequest('/api/admin/sessions', 'GET', null, sessionCookies)
      console.log(`📊 Sessions API Status: ${sessionsResult.status}`)
      
      if (sessionsResult.status === 200) {
        console.log('✅ Sessions API working!')
        
        if (sessionsResult.data && sessionsResult.data.sessions) {
          console.log(`📋 Found ${sessionsResult.data.sessions.length} active sessions`)
          
          if (sessionsResult.data.sessions.length > 0) {
            console.log('\n🎯 Active Session Details:')
            sessionsResult.data.sessions.forEach((session, index) => {
              console.log(`   Session ${index + 1}:`)
              console.log(`   👤 User: ${session.user?.name || 'Unknown'} (${session.user?.email || 'Unknown'})`)
              console.log(`   🔒 Subscription: ${session.user?.subscription || 'free'}`)
              console.log(`   ⏰ Login Time: ${new Date(session.loginTime).toLocaleString()}`)
              console.log(`   🌐 IP: ${session.ipAddress || 'Unknown'}`)
              console.log(`   📱 Device: ${session.device || 'Unknown'}`)
              console.log(`   🌍 Browser: ${session.browser || 'Unknown'}`)
              console.log(`   🔴 Status: ${session.status || 'Unknown'}`)
              console.log(`   ⚠️ Risk: ${session.riskLevel || 'Unknown'}`)
              console.log('')
            })
          } else {
            console.log('   📝 No active sessions found')
            console.log('   💡 This might mean:')
            console.log('      - Security logging is not working properly')
            console.log('      - Sessions are being filtered out')
            console.log('      - Login events are not being recorded')
          }
        } else {
          console.log('⚠️ Unexpected sessions response format')
        }
      } else if (sessionsResult.status === 401) {
        console.log('🔒 Sessions API requires authentication (expected)')
      } else {
        console.log(`❌ Sessions API error: ${sessionsResult.status}`)
      }
      
      console.log('\n🔍 Step 3: Checking Security Logs...')
      
      // Check security logs
      const logsResult = await makeRequest('/api/admin/security-logs?limit=10', 'GET', null, sessionCookies)
      console.log(`📊 Security Logs Status: ${logsResult.status}`)
      
      if (logsResult.status === 200 && logsResult.data && logsResult.data.logs) {
        console.log(`📋 Found ${logsResult.data.logs.length} recent security events`)
        
        const loginEvents = logsResult.data.logs.filter(log => 
          log.action === 'LOGIN_SUCCESS' || log.action === 'LOGIN_FAILED'
        )
        
        console.log(`🔐 Login events: ${loginEvents.length}`)
        
        if (loginEvents.length > 0) {
          console.log('\n🎯 Recent Login Events:')
          loginEvents.slice(0, 3).forEach((event, index) => {
            console.log(`   Event ${index + 1}:`)
            console.log(`   🔑 Action: ${event.action}`)
            console.log(`   👤 User: ${event.userId}`)
            console.log(`   📧 Resource: ${event.resource}`)
            console.log(`   ⏰ Time: ${new Date(event.createdAt).toLocaleString()}`)
            console.log(`   ✅ Success: ${event.success}`)
            console.log('')
          })
        } else {
          console.log('   📝 No login events found in recent logs')
          console.log('   💡 This suggests security logging may need to be fixed')
        }
      }
      
    } else {
      console.log('❌ Admin login failed')
      console.log('Response:', loginResult.data)
    }

  } catch (error) {
    console.log(`❌ Test error: ${error.error || error.message}`)
  }

  console.log('\n🎯 Test Summary:')
  console.log('✅ Purpose: Test login process and verify active sessions tracking')
  console.log('🔧 What we tested:')
  console.log('   - Admin login with credentials')
  console.log('   - Active sessions API response')
  console.log('   - Security logging verification')
  console.log('   - Session data structure')
  console.log('')
  console.log('📋 Expected Results:')
  console.log('   - Successful admin login')
  console.log('   - Active session appears in sessions API')
  console.log('   - LOGIN_SUCCESS event in security logs')
  console.log('   - Complete session information displayed')
  console.log('')
  console.log('🔧 If no sessions appear:')
  console.log('   1. Check if security logging is working')
  console.log('   2. Verify LOGIN_SUCCESS events are being created')
  console.log('   3. Ensure sessions API filters are correct')
  console.log('   4. Test with a fresh login via browser')
}

testLoginAndSessions().catch(console.error)
