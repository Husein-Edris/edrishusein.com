#!/usr/bin/env node
/**
 * WordPress API Connection Diagnostic Tool
 * Tests connectivity to WordPress GraphQL and REST API endpoints
 */

const https = require('https');
const http = require('http');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://cms.edrishusein.com/graphql';
const BASE_URL = WORDPRESS_URL.replace('/graphql', '');

console.log('🔍 WordPress API Diagnostic Tool\n');
console.log(`Environment Variable: NEXT_PUBLIC_WORDPRESS_API_URL=${process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'NOT SET'}`);
console.log(`GraphQL Endpoint: ${WORDPRESS_URL}`);
console.log(`Base URL: ${BASE_URL}\n`);

// Test function
function testEndpoint(url, name) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    const startTime = Date.now();
    
    const req = client.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Next.js-Build-Diagnostic/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({
          success: true,
          status: res.statusCode,
          duration,
          contentType: res.headers['content-type'],
          dataLength: data.length
        });
      });
    });
    
    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        success: false,
        error: error.message,
        code: error.code,
        duration
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout',
        duration: Date.now() - startTime
      });
    });
  });
}

async function runDiagnostics() {
  console.log('📡 Testing endpoints...\n');
  
  // Test 1: GraphQL endpoint
  console.log('1️⃣ Testing GraphQL endpoint...');
  const graphqlResult = await testEndpoint(WORDPRESS_URL, 'GraphQL');
  if (graphqlResult.success) {
    console.log(`   ✅ GraphQL endpoint is reachable`);
    console.log(`   Status: ${graphqlResult.status}`);
    console.log(`   Response time: ${graphqlResult.duration}ms`);
    console.log(`   Content-Type: ${graphqlResult.contentType}`);
  } else {
    console.log(`   ❌ GraphQL endpoint failed`);
    console.log(`   Error: ${graphqlResult.error}`);
    console.log(`   Code: ${graphqlResult.code || 'N/A'}`);
    console.log(`   Duration: ${graphqlResult.duration}ms`);
  }
  console.log('');
  
  // Test 2: REST API endpoint
  console.log('2️⃣ Testing REST API endpoint...');
  const restResult = await testEndpoint(`${BASE_URL}/wp-json/wp/v2/posts?per_page=1`, 'REST API');
  if (restResult.success) {
    console.log(`   ✅ REST API endpoint is reachable`);
    console.log(`   Status: ${restResult.status}`);
    console.log(`   Response time: ${restResult.duration}ms`);
    console.log(`   Content-Type: ${restResult.contentType}`);
  } else {
    console.log(`   ❌ REST API endpoint failed`);
    console.log(`   Error: ${restResult.error}`);
    console.log(`   Code: ${restResult.code || 'N/A'}`);
    console.log(`   Duration: ${restResult.duration}ms`);
  }
  console.log('');
  
  // Test 3: Base URL
  console.log('3️⃣ Testing base URL...');
  const baseResult = await testEndpoint(BASE_URL, 'Base URL');
  if (baseResult.success) {
    console.log(`   ✅ Base URL is reachable`);
    console.log(`   Status: ${baseResult.status}`);
    console.log(`   Response time: ${baseResult.duration}ms`);
  } else {
    console.log(`   ❌ Base URL failed`);
    console.log(`   Error: ${baseResult.error}`);
    console.log(`   Code: ${baseResult.code || 'N/A'}`);
  }
  console.log('');
  
  // Summary
  console.log('📊 Summary:');
  const allTests = [graphqlResult, restResult, baseResult];
  const passed = allTests.filter(t => t.success).length;
  const failed = allTests.filter(t => !t.success).length;
  
  console.log(`   ✅ Passed: ${passed}/3`);
  console.log(`   ❌ Failed: ${failed}/3`);
  
  if (failed > 0) {
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Check if .env.production file exists and has NEXT_PUBLIC_WORDPRESS_API_URL set');
    console.log('   2. Verify DNS resolution: nslookup cms.edrishusein.com');
    console.log('   3. Test connectivity: curl -I https://cms.edrishusein.com');
    console.log('   4. Check firewall rules on the server');
    console.log('   5. Verify WordPress site is running and accessible');
  } else {
    console.log('\n✅ All endpoints are reachable!');
  }
}

runDiagnostics().catch(console.error);
