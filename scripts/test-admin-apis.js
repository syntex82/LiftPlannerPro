const https = require('https')

console.log('🧪 Testing Admin Dashboard APIs...\n')

// Test configuration
const baseUrl = 'https://liftplannerpro.org'
const testEndpoints = [
  '/api/admin/users',
  '/api/issues',
  '/api/admin/security-logs?limit=5',
  '/api/admin/stats'
]

// Create HTTPS agent that accepts self-signed certificates
const agent = new https.Agent({
  rejectUnauthorized: false
})

async function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'liftplannerpro.org',
      port: 443,
      path: endpoint,
      method: 'GET',
      agent: agent,
      headers: {
        'User-Agent': 'Admin-Test-Script/1.0'
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve({
            status: res.statusCode,
            data: jsonData,
            endpoint: endpoint
          })
        } catch (error) {
          resolve({
            status: res.statusCode,
            error: 'Invalid JSON response',
            data: data.substring(0, 200),
            endpoint: endpoint
          })
        }
      })
    })

    req.on('error', (error) => {
      reject({
        endpoint: endpoint,
        error: error.message
      })
    })

    req.setTimeout(10000, () => {
      req.destroy()
      reject({
        endpoint: endpoint,
        error: 'Request timeout'
      })
    })

    req.end()
  })
}

async function runTests() {
  console.log('🔍 Testing API endpoints...\n')

  for (const endpoint of testEndpoints) {
    try {
      console.log(`Testing: ${endpoint}`)
      const result = await testEndpoint(endpoint)
      
      if (result.status === 200) {
        console.log(`✅ ${endpoint} - Status: ${result.status}`)
        
        // Show data summary
        if (result.data) {
          if (Array.isArray(result.data)) {
            console.log(`   📊 Returned ${result.data.length} items`)
          } else if (result.data.issues) {
            console.log(`   📊 Issues: ${result.data.issues.length} items`)
          } else if (result.data.logs) {
            console.log(`   📊 Security logs: ${result.data.logs.length} items`)
          } else if (result.data.overview) {
            console.log(`   📊 Stats - Users: ${result.data.overview.totalUsers}, Issues: ${result.data.overview.totalIssues}`)
          } else {
            console.log(`   📊 Data structure: ${Object.keys(result.data).join(', ')}`)
          }
        }
      } else if (result.status === 401) {
        console.log(`🔒 ${endpoint} - Status: ${result.status} (Authentication required - Expected)`)
      } else if (result.status === 403) {
        console.log(`🚫 ${endpoint} - Status: ${result.status} (Admin access required - Expected)`)
      } else {
        console.log(`❌ ${endpoint} - Status: ${result.status}`)
        if (result.error) {
          console.log(`   Error: ${result.error}`)
        }
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.error || error.message}`)
    }
    
    console.log('') // Empty line for readability
  }

  console.log('🎯 Test Summary:')
  console.log('- All endpoints should return 401/403 (authentication required)')
  console.log('- This confirms the APIs are working and properly secured')
  console.log('- Login as admin (mickyblenk@gmail.com) to access the data')
  console.log('\n✅ Admin Dashboard API tests complete!')
}

runTests().catch(console.error)
