#!/usr/bin/env node

/**
 * Content Refresh Script for WordPress CMS Updates
 * 
 * This script helps manually refresh content when WordPress is updated.
 * Since we've removed automatic caching, content should update immediately,
 * but this script is useful for troubleshooting and manual refresh.
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🔄 WordPress Content Refresh Script');
console.log('=====================================');

// Function to execute shell commands
function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`📦 ${description}...`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.log(`⚠️  Warning: ${stderr}`);
      }
      console.log(`✅ ${description} completed`);
      if (stdout) console.log(stdout);
      resolve(stdout);
    });
  });
}

async function refreshContent() {
  try {
    console.log('🎯 Starting content refresh process...\n');

    // 1. Clear Next.js build cache
    await runCommand('rm -rf .next/cache', 'Clearing Next.js cache');

    // 2. Restart the development server if in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 In development mode - restart your dev server (npm run dev) to see changes');
    }

    // 3. In production, rebuild and restart
    if (process.env.NODE_ENV === 'production') {
      await runCommand('npm run build', 'Building application');
      
      // Check if using PM2
      try {
        await runCommand('pm2 restart edrishusein.com', 'Restarting PM2 process');
      } catch (error) {
        // Fallback to regular process restart
        console.log('PM2 not found, using standalone server restart...');
        await runCommand('pkill -f next-server || echo "No existing process"', 'Stopping existing server');
        await runCommand('nohup node .next/standalone/server.js > server.log 2>&1 &', 'Starting new server');
      }
    }

    console.log('\n🎉 Content refresh completed!');
    console.log('💡 Your WordPress content should now be up to date.');
    
    if (process.env.NODE_ENV === 'production') {
      console.log('🌍 Check your site: https://edrishusein.com');
    }

  } catch (error) {
    console.error('\n❌ Content refresh failed:', error.message);
    console.log('\n🛠️  Manual steps:');
    console.log('1. Delete .next/cache directory');
    console.log('2. Run: npm run build');
    console.log('3. Restart your server');
    process.exit(1);
  }
}

// Add CLI options
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node scripts/refresh-content.js [options]

Options:
  --help, -h     Show this help message
  --force, -f    Force cache clear and rebuild

Description:
  This script refreshes content from WordPress CMS by clearing Next.js cache
  and rebuilding the application. Use when WordPress content updates don't
  appear immediately on your site.

Examples:
  node scripts/refresh-content.js          # Standard refresh
  node scripts/refresh-content.js --force  # Force complete rebuild
  npm run refresh-content                  # If added to package.json scripts
  `);
  process.exit(0);
}

// Run the refresh
refreshContent();