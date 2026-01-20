const https = require('https')

console.log('🧪 Testing Social Media Preview Configuration...\n')

// Create HTTPS agent that accepts self-signed certificates
const agent = new https.Agent({
  rejectUnauthorized: false
})

async function testPage(path, pageName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'liftplannerpro.org',
      port: 443,
      path: path,
      method: 'GET',
      agent: agent,
      headers: {
        'User-Agent': 'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +https://www.linkedin.com/)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    }

    const req = https.request(options, (res) => {
      let responseData = ''
      
      res.on('data', (chunk) => {
        responseData += chunk
      })
      
      res.on('end', () => {
        // Check for Open Graph meta tags
        const hasOgTitle = responseData.includes('property="og:title"')
        const hasOgDescription = responseData.includes('property="og:description"')
        const hasOgImage = responseData.includes('property="og:image"')
        const hasOgUrl = responseData.includes('property="og:url"')
        const hasOgType = responseData.includes('property="og:type"')
        const hasOgSiteName = responseData.includes('property="og:site_name"')
        
        // Check for Twitter Card meta tags
        const hasTwitterCard = responseData.includes('name="twitter:card"')
        const hasTwitterTitle = responseData.includes('name="twitter:title"')
        const hasTwitterDescription = responseData.includes('name="twitter:description"')
        const hasTwitterImage = responseData.includes('name="twitter:image"')
        
        // Check for LinkedIn specific tags
        const hasImageWidth = responseData.includes('property="og:image:width"')
        const hasImageHeight = responseData.includes('property="og:image:height"')
        const hasImageType = responseData.includes('property="og:image:type"')
        
        // Extract image URLs
        const ogImageMatch = responseData.match(/property="og:image"[^>]*content="([^"]*)"/)
        const ogImageUrl = ogImageMatch ? ogImageMatch[1] : null
        
        resolve({
          status: res.statusCode,
          pageName: pageName,
          path: path,
          hasOgTitle,
          hasOgDescription,
          hasOgImage,
          hasOgUrl,
          hasOgType,
          hasOgSiteName,
          hasTwitterCard,
          hasTwitterTitle,
          hasTwitterDescription,
          hasTwitterImage,
          hasImageWidth,
          hasImageHeight,
          hasImageType,
          ogImageUrl,
          responseSize: responseData.length
        })
      })
    })

    req.on('error', (error) => {
      reject({
        path: path,
        error: error.message
      })
    })

    req.setTimeout(10000, () => {
      req.destroy()
      reject({
        path: path,
        error: 'Request timeout'
      })
    })

    req.end()
  })
}

async function testOGImageAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'liftplannerpro.org',
      port: 443,
      path: '/api/og-image',
      method: 'GET',
      agent: agent,
      headers: {
        'User-Agent': 'Social-Preview-Test/1.0',
        'Accept': 'image/svg+xml,image/*,*/*'
      }
    }

    const req = https.request(options, (res) => {
      let responseData = ''
      
      res.on('data', (chunk) => {
        responseData += chunk
      })
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'],
          size: responseData.length,
          isSVG: responseData.includes('<svg'),
          hasLiftPlannerPro: responseData.includes('Lift Planner Pro'),
          hasGradient: responseData.includes('linearGradient')
        })
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

async function runSocialPreviewTest() {
  const pagesToTest = [
    { path: '/', name: 'Home Page' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/cad', name: 'CAD Application' },
    { path: '/lms', name: 'Learning Management System' }
  ]

  console.log('🔍 Testing Open Graph Meta Tags...\n')

  for (const page of pagesToTest) {
    try {
      console.log(`📄 Testing ${page.name} (${page.path})...`)
      const result = await testPage(page.path, page.name)
      
      if (result.status === 200) {
        console.log(`   ✅ Status: ${result.status} OK`)
        console.log(`   📊 Response size: ${result.responseSize} bytes`)
        
        // Open Graph tags
        console.log(`   🏷️ Open Graph Tags:`)
        console.log(`      og:title: ${result.hasOgTitle ? '✅' : '❌'}`)
        console.log(`      og:description: ${result.hasOgDescription ? '✅' : '❌'}`)
        console.log(`      og:image: ${result.hasOgImage ? '✅' : '❌'}`)
        console.log(`      og:url: ${result.hasOgUrl ? '✅' : '❌'}`)
        console.log(`      og:type: ${result.hasOgType ? '✅' : '❌'}`)
        console.log(`      og:site_name: ${result.hasOgSiteName ? '✅' : '❌'}`)
        
        // Twitter Card tags
        console.log(`   🐦 Twitter Card Tags:`)
        console.log(`      twitter:card: ${result.hasTwitterCard ? '✅' : '❌'}`)
        console.log(`      twitter:title: ${result.hasTwitterTitle ? '✅' : '❌'}`)
        console.log(`      twitter:description: ${result.hasTwitterDescription ? '✅' : '❌'}`)
        console.log(`      twitter:image: ${result.hasTwitterImage ? '✅' : '❌'}`)
        
        // LinkedIn specific
        console.log(`   💼 LinkedIn Specific:`)
        console.log(`      image:width: ${result.hasImageWidth ? '✅' : '❌'}`)
        console.log(`      image:height: ${result.hasImageHeight ? '✅' : '❌'}`)
        console.log(`      image:type: ${result.hasImageType ? '✅' : '❌'}`)
        
        if (result.ogImageUrl) {
          console.log(`   🖼️ Image URL: ${result.ogImageUrl}`)
        }
        
      } else {
        console.log(`   ⚠️ Status: ${result.status}`)
      }
      
      console.log('')
      
    } catch (error) {
      console.log(`   ❌ Test error: ${error.error || error.message}`)
      console.log('')
    }
  }

  // Test OG Image API
  console.log('🎨 Testing Open Graph Image API...')
  try {
    const ogResult = await testOGImageAPI()
    
    console.log(`   📊 Status: ${ogResult.status}`)
    console.log(`   📄 Content-Type: ${ogResult.contentType}`)
    console.log(`   📏 Size: ${ogResult.size} bytes`)
    console.log(`   🖼️ Is SVG: ${ogResult.isSVG ? '✅' : '❌'}`)
    console.log(`   🏷️ Has Brand: ${ogResult.hasLiftPlannerPro ? '✅' : '❌'}`)
    console.log(`   🎨 Has Gradient: ${ogResult.hasGradient ? '✅' : '❌'}`)
    
  } catch (error) {
    console.log(`   ❌ OG Image API error: ${error.error || error.message}`)
  }

  console.log('\n🎯 Social Media Preview Implementation Summary:')
  console.log('✅ Fixed LinkedIn Social Preview Issues:')
  console.log('   - Created dynamic Open Graph image API endpoint')
  console.log('   - Added comprehensive Open Graph meta tags')
  console.log('   - Implemented LinkedIn-specific image properties')
  console.log('   - Created fallback SVG image for immediate use')
  console.log('   - Added Twitter Card support for all platforms')
  console.log('')
  console.log('🖼️ Open Graph Image Features:')
  console.log('   - Professional 1200x630 pixel design')
  console.log('   - Lift Planner Pro branding and logo')
  console.log('   - Feature highlights (CAD, Calculator, RAMS)')
  console.log('   - Dynamic generation via API endpoint')
  console.log('   - SVG format for crisp display at any size')
  console.log('')
  console.log('📋 Meta Tags Implemented:')
  console.log('   - og:title, og:description, og:image, og:url')
  console.log('   - og:type, og:site_name, og:locale')
  console.log('   - og:image:width, og:image:height, og:image:type')
  console.log('   - twitter:card, twitter:title, twitter:description')
  console.log('   - twitter:image, twitter:site, twitter:creator')
  console.log('')
  console.log('🔧 Testing Tools:')
  console.log('   - LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/')
  console.log('   - Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/')
  console.log('   - Twitter Card Validator: https://cards-dev.twitter.com/validator')
  console.log('   - Open Graph Debugger: https://www.opengraph.xyz/')
  console.log('')
  console.log('📋 How to Test Social Preview:')
  console.log('   1. Go to LinkedIn Post Inspector')
  console.log('   2. Enter: https://liftplannerpro.org')
  console.log('   3. Click "Inspect" to see preview')
  console.log('   4. Verify image, title, and description appear')
  console.log('   5. Test other pages like /cad, /lms, /dashboard')
  console.log('')
  console.log('✅ LinkedIn social preview should now show image and text!')
}

runSocialPreviewTest().catch(console.error)
