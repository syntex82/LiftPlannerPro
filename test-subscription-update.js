// Test script to verify subscription update functionality
const https = require('https');

// Test data - replace with actual user ID from your database
const testData = {
  userId: 'cme1nqxjb0000v7xsxb9083kx', // Your user ID
  subscription: 'enterprise'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'liftplannerpro.org',
  port: 443,
  path: '/api/admin/users',
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    // You'll need to add authentication headers here
    'Cookie': 'next-auth.session-token=YOUR_SESSION_TOKEN' // Replace with actual session token
  },
  rejectUnauthorized: false // For self-signed certificates
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();

console.log('Testing subscription update...');
console.log('Request data:', testData);
