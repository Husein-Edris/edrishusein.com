#!/usr/bin/env node

/**
 * GitHub Webhook Auto-Deploy Script
 * 
 * This creates a simple HTTP server that listens for GitHub webhook pushes
 * and automatically deploys your site when you push to the main branch.
 * 
 * Setup:
 * 1. Run: node webhook-deploy.js (or pm2 start webhook-deploy.js)
 * 2. In GitHub repo settings -> Webhooks, add: http://your-server:3001/deploy
 * 3. Set content type to application/json
 * 4. Select "Just the push event"
 */

const http = require('http');
const { exec } = require('child_process');
const path = require('path');

const PORT = 3001;
const DEPLOY_SCRIPT = path.join(__dirname, 'auto-deploy.sh');

// Simple webhook server
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/deploy') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        
        // Check if it's a push to main branch
        if (payload.ref === 'refs/heads/main') {
          console.log(`🔔 Webhook received: ${payload.head_commit.message}`);
          
          // Run deployment
          exec(`bash ${DEPLOY_SCRIPT}`, (error, stdout, stderr) => {
            if (error) {
              console.error(`❌ Deploy failed: ${error.message}`);
              return;
            }
            if (stderr) {
              console.log(`⚠️ Deploy warnings: ${stderr}`);
            }
            console.log(`✅ Deploy success: ${stdout}`);
          });
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'Deployment started' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'Not main branch, ignored' }));
        }
      } catch (err) {
        console.error('❌ Webhook parse error:', err.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`🎣 Webhook server running on port ${PORT}`);
  console.log(`📝 Add this webhook URL in GitHub: http://your-server:${PORT}/deploy`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down webhook server...');
  server.close(() => {
    process.exit(0);
  });
});