const http = require('http')

console.log('🧪 Testing Authentication Debug...\n')

async function testAuthenticationFlow() {
  console.log('🔍 Testing Authentication Flow for Security Threats API')
  
  try {
    // Test the admin page first to see if user is authenticated
    console.log('\n1. Testing Admin Page Access...')
    const adminResult = await testEndpoint('/admin')
    console.log(`   Status: ${adminResult.status}`)
    
    if (adminResult.status === 200) {
      console.log('   ✅ Admin page accessible - user likely authenticated')
    } else if (adminResult.status === 302) {
      console.log('   🔄 Redirect detected - user may need to authenticate')
    } else {
      console.log('   ❌ Admin page not accessible')
    }
    
    // Test the security threats API directly
    console.log('\n2. Testing Security Threats API...')
    const apiResult = await testEndpoint('/api/admin/security/threats')
    console.log(`   Status: ${apiResult.status}`)
    console.log(`   Size: ${apiResult.size} bytes`)
    
    if (apiResult.status === 200) {
      console.log('   ✅ API accessible - authentication working')
      try {
        const data = JSON.parse(apiResult.content)
        console.log('   📊 Response data:', {
          hasThreats: Array.isArray(data.threats),
          total: data.total,
          active: data.active,
          mitigated: data.mitigated,
          lastUpdated: data.lastUpdated
        })
      } catch (parseError) {
        console.log('   ⚠️ Could not parse response as JSON')
      }
    } else if (apiResult.status === 401) {
      console.log('   🔒 Unauthorized - session may be invalid')
    } else if (apiResult.status === 403) {
      console.log('   🚫 Forbidden - user may not be admin')
    } else if (apiResult.status === 404) {
      console.log('   👤 User not found in database')
    } else {
      console.log('   ❌ API error - check server logs')
    }
    
    // Test session endpoint if available
    console.log('\n3. Testing Session Status...')
    const sessionResult = await testEndpoint('/api/auth/session')
    console.log(`   Status: ${sessionResult.status}`)
    
    if (sessionResult.status === 200) {
      try {
        const sessionData = JSON.parse(sessionResult.content)
        console.log('   📋 Session data:', {
          hasUser: !!sessionData.user,
          email: sessionData.user?.email,
          role: sessionData.user?.role,
          expires: sessionData.expires
        })
      } catch (parseError) {
        console.log('   ⚠️ Could not parse session response')
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Test error: ${error.message}`)
  }
}

async function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3443,  // Using HTTPS port
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Auth-Debug-Test/1.0',
        'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }

    const req = http.request(options, (res) => {
      let responseData = ''
      
      res.on('data', (chunk) => {
        responseData += chunk
      })
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          content: responseData,
          size: responseData.length,
          headers: res.headers
        })
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    req.end()
  })
}

async function runAuthDebugTest() {
  console.log('🎯 Authentication Debug Test Results:\n')
  
  await testAuthenticationFlow()
  
  console.log('\n📋 Debugging Security Threats API Error:')
  console.log('✅ Enhanced Error Handling Added:')
  console.log('   - Detailed API response logging')
  console.log('   - Session and user authentication checks')
  console.log('   - Specific error status code handling')
  console.log('   - Database user lookup debugging')
  console.log('   - Admin privilege verification')
  console.log('')
  
  console.log('✅ Frontend Improvements:')
  console.log('   - Better error parsing and logging')
  console.log('   - Detailed API response information')
  console.log('   - Specific handling for 401/403 errors')
  console.log('   - User-friendly error messages')
  console.log('')
  
  console.log('✅ Backend Debugging:')
  console.log('   - Session validation logging')
  console.log('   - Admin email verification')
  console.log('   - Database user lookup logging')
  console.log('   - Successful response confirmation')
  console.log('')
  
  console.log('🔍 Common Issues and Solutions:')
  console.log('   📋 Issue: Empty error object {}')
  console.log('      - Usually indicates authentication failure')
  console.log('      - Check if user is logged in')
  console.log('      - Verify session is valid')
  console.log('')
  
  console.log('   📋 Issue: 401 Unauthorized')
  console.log('      - User session may have expired')
  console.log('      - User needs to log in again')
  console.log('      - Check NextAuth configuration')
  console.log('')
  
  console.log('   📋 Issue: 403 Forbidden')
  console.log('      - User is not in admin email list')
  console.log('      - Check adminEmails array in API')
  console.log('      - Verify user email matches exactly')
  console.log('')
  
  console.log('   📋 Issue: 404 User Not Found')
  console.log('      - User exists in session but not in database')
  console.log('      - User may need to complete registration')
  console.log('      - Check database connection')
  console.log('')
  
  console.log('🔧 Debugging Steps:')
  console.log('   1. Check browser console for detailed logs')
  console.log('   2. Verify user is logged in at /dashboard')
  console.log('   3. Check server console for API debugging')
  console.log('   4. Verify admin email in adminEmails array')
  console.log('   5. Test session endpoint: /api/auth/session')
  console.log('')
  
  console.log('📊 Debug Information Now Available:')
  console.log('   🔍 Frontend Logs:')
  console.log('      - "🔄 Starting security threats refresh..."')
  console.log('      - "📡 API Response: {status, statusText, ok}"')
  console.log('      - "✅ Security threats refreshed successfully"')
  console.log('      - "❌ Failed to load security threats"')
  console.log('')
  
  console.log('   🔍 Backend Logs:')
  console.log('      - "🔍 Security threats API called"')
  console.log('      - "📋 Session check: {hasSession, email}"')
  console.log('      - "🔐 Admin check: {isAdmin, adminEmails}"')
  console.log('      - "👤 User lookup result: {found, userId}"')
  console.log('      - "✅ Returning security threats data"')
  console.log('')
  
  console.log('✅ Enhanced error handling implemented!')
  console.log('')
  console.log('🎯 Next steps to resolve the error:')
  console.log('   1. Open browser console and try refresh again')
  console.log('   2. Check the detailed logs for specific error')
  console.log('   3. Verify authentication status')
  console.log('   4. Check server console for backend logs')
  console.log('   5. Ensure user email is in admin list')
  console.log('')
  console.log('🔍 The enhanced logging will show exactly what\'s failing!')
}

runAuthDebugTest().catch(console.error)
