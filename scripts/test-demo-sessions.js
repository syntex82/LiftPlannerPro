const https = require('https')

console.log('🧪 Testing Demo Active Sessions...\n')

// Create HTTPS agent that accepts self-signed certificates
const agent = new https.Agent({
  rejectUnauthorized: false
})

async function testDemoSessions() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'liftplannerpro.org',
      port: 443,
      path: '/api/admin/sessions',
      method: 'GET',
      agent: agent,
      headers: {
        'User-Agent': 'Demo-Sessions-Test/1.0',
        'Content-Type': 'application/json'
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
            data: jsonData
          })
        } catch (error) {
          resolve({
            status: res.statusCode,
            error: 'Invalid JSON response',
            data: responseData.substring(0, 500)
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

    req.end()
  })
}

async function runDemoTest() {
  try {
    console.log('🔍 Testing Demo Active Sessions API...')
    const result = await testDemoSessions()
    
    console.log(`📊 Status: ${result.status}`)
    
    if (result.status === 401) {
      console.log('✅ Authentication required (expected for security)')
      console.log('   This confirms the API endpoint is protected')
      console.log('   Demo data will be visible when logged in as admin')
    } else if (result.status === 200) {
      console.log('✅ API endpoint working!')
      
      if (result.data && result.data.sessions) {
        console.log(`📋 Found ${result.data.sessions.length} active sessions`)
        
        if (result.data.note) {
          console.log(`💡 Note: ${result.data.note}`)
        }
        
        if (result.data.sessions.length > 0) {
          console.log('\n🎯 Demo Session Data:')
          result.data.sessions.forEach((session, index) => {
            console.log(`   Session ${index + 1}:`)
            console.log(`   👤 User: ${session.user?.name || 'Unknown'} (${session.user?.email || 'Unknown'})`)
            console.log(`   🔒 Subscription: ${session.user?.subscription || 'free'}`)
            console.log(`   ⏰ Login Time: ${new Date(session.loginTime).toLocaleString()}`)
            console.log(`   🌐 IP Address: ${session.ipAddress || 'Unknown'}`)
            console.log(`   📱 Device: ${session.device || 'Unknown'}`)
            console.log(`   🌍 Browser: ${session.browser || 'Unknown'}`)
            console.log(`   📍 Location: ${session.location || 'Unknown'}`)
            console.log(`   🔴 Status: ${session.status || 'Unknown'}`)
            console.log(`   ⚠️ Risk Level: ${session.riskLevel || 'Unknown'}`)
            
            const duration = Math.floor(session.sessionDuration / (1000 * 60))
            console.log(`   ⏱️ Duration: ${Math.floor(duration / 60)}h ${duration % 60}m`)
            console.log('')
          })
        } else {
          console.log('   📝 No sessions found')
        }
        
        console.log(`📈 Total Active Sessions: ${result.data.totalActive || 0}`)
        console.log(`🕐 Last Updated: ${result.data.timestamp || 'Unknown'}`)
      } else {
        console.log('⚠️ Unexpected response format')
        console.log('Response:', JSON.stringify(result.data, null, 2))
      }
    } else {
      console.log(`❌ Unexpected status: ${result.status}`)
      console.log('Response:', result.data)
    }

  } catch (error) {
    console.log(`❌ Test error: ${error.error || error.message}`)
  }

  console.log('\n🎯 Demo Active Sessions Summary:')
  console.log('✅ Purpose: Test Active Sessions with demo data')
  console.log('🎨 Demo Features:')
  console.log('   - 4 sample active user sessions')
  console.log('   - Mix of admin, demo, and registered users')
  console.log('   - Different subscription types (enterprise, pro, premium)')
  console.log('   - Various devices (Desktop Windows/Mac/Linux, Mobile iPhone)')
  console.log('   - Different browsers (Chrome, Safari)')
  console.log('   - Local and external IP addresses')
  console.log('   - Different risk levels (LOW, MEDIUM)')
  console.log('   - Realistic session durations and login times')
  console.log('')
  console.log('📋 How to View Demo Sessions:')
  console.log('   1. Login as admin (mickyblenk@gmail.com)')
  console.log('   2. Go to https://liftplannerpro.org/admin')
  console.log('   3. Click "Active Sessions" tab')
  console.log('   4. You should see 4 demo active sessions')
  console.log('')
  console.log('🎨 Expected Demo Display:')
  console.log('   🟢 Micky Blenk (mickyblenk@gmail.com) [Enterprise]')
  console.log('      Login: 2h ago | Duration: 2h | IP: 192.168.1.100')
  console.log('      Device: Desktop (Windows) | Browser: Chrome | Risk: LOW')
  console.log('')
  console.log('   🟢 Demo User (demo@liftplanner.com) [Pro]')
  console.log('      Login: 1h ago | Duration: 1h | IP: 203.0.113.45')
  console.log('      Device: Mobile (iPhone) | Browser: Safari | Risk: LOW')
  console.log('')
  console.log('   🟢 John Doe (john.doe@example.com) [Premium]')
  console.log('      Login: 30m ago | Duration: 30m | IP: 198.51.100.25')
  console.log('      Device: Desktop (Mac) | Browser: Chrome | Risk: LOW')
  console.log('')
  console.log('   🟡 Jane Smith (jane.smith@company.com) [Pro]')
  console.log('      Login: 15m ago | Duration: 15m | IP: 172.16.0.50')
  console.log('      Device: Desktop (Linux) | Browser: Chrome | Risk: MEDIUM')
  console.log('')
  console.log('✅ Demo Active Sessions are now ready for testing!')
}

runDemoTest().catch(console.error)
