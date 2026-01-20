const net = require('net');
const https = require('https');
const http = require('http');

console.log('🔍 Testing Port Accessibility for Lift Planner Pro\n');

// Test if local ports are listening
function testLocalPort(port, name) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      console.log(`❌ Port ${port} (${name}) is NOT in use - server not running`);
      server.close();
      resolve(false);
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`✅ Port ${port} (${name}) is in use - server running`);
        resolve(true);
      } else {
        console.log(`❌ Port ${port} (${name}) error: ${err.message}`);
        resolve(false);
      }
    });
  });
}

// Test HTTP connection to local server
function testLocalHTTP() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3080,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      console.log(`✅ HTTP Server (3080) responding: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ HTTP Server (3080) not responding: ${err.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`❌ HTTP Server (3080) timeout`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Test HTTPS connection to local server
function testLocalHTTPS() {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'localhost',
      port: 3443,
      path: '/',
      method: 'GET',
      timeout: 5000,
      rejectUnauthorized: false // Accept self-signed certificates
    }, (res) => {
      console.log(`✅ HTTPS Server (3443) responding: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ HTTPS Server (3443) not responding: ${err.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`❌ HTTPS Server (3443) timeout`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Get external IP
async function getExternalIP() {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.ipify.org',
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`🌐 Your external IP: ${data.trim()}`);
        resolve(data.trim());
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Could not get external IP: ${err.message}`);
      resolve(null);
    });
    
    req.end();
  });
}

// Test external domain
function testExternalDomain() {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'liftplannerpro.org',
      path: '/',
      method: 'GET',
      timeout: 10000,
      rejectUnauthorized: false
    }, (res) => {
      console.log(`✅ liftplannerpro.org responding: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ liftplannerpro.org not accessible: ${err.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`❌ liftplannerpro.org timeout`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('📋 Testing Local Server Status:');
  console.log('=' .repeat(50));
  
  // Test if ports are in use (server running)
  await testLocalPort(3080, 'HTTP');
  await testLocalPort(3443, 'HTTPS');
  
  console.log('\n📋 Testing Local Server Response:');
  console.log('=' .repeat(50));
  
  // Test if servers respond
  await testLocalHTTP();
  await testLocalHTTPS();
  
  console.log('\n📋 Network Information:');
  console.log('=' .repeat(50));
  
  // Get external IP
  const externalIP = await getExternalIP();
  
  console.log('\n📋 Testing External Access:');
  console.log('=' .repeat(50));
  
  // Test external domain
  await testExternalDomain();
  
  console.log('\n📋 Manual Port Testing Instructions:');
  console.log('=' .repeat(50));
  
  if (externalIP) {
    console.log(`🔗 Test your ports online:`);
    console.log(`   1. Go to: https://www.yougetsignal.com/tools/open-ports/`);
    console.log(`   2. Enter IP: ${externalIP}`);
    console.log(`   3. Test Port: 80 (should be open)`);
    console.log(`   4. Test Port: 443 (should be open)`);
  }
  
  console.log(`\n🔗 Test your domain:`);
  console.log(`   1. Use mobile data (WiFi OFF)`);
  console.log(`   2. Go to: https://liftplannerpro.org`);
  console.log(`   3. Should load your Lift Planner Pro app`);
  
  console.log('\n📋 Troubleshooting:');
  console.log('=' .repeat(50));
  console.log('If ports show as closed:');
  console.log('  ❌ Check router port forwarding (80→3080, 443→3443)');
  console.log('  ❌ Check Windows Firewall rules');
  console.log('  ❌ Ensure your server is running (npm run https)');
  console.log('  ❌ Verify NoIP domain points to correct IP');
}

runTests().catch(console.error);
