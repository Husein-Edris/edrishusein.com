#!/bin/bash
set -e

echo "🚀 Starting deployment with Git sync..."

# Set Node.js path for Plesk environment
export PATH=/opt/plesk/node/24/bin:$PATH

# Variables
PID_FILE=".next/standalone/server.pid"
STASHED=false

# 1. Git safety checks - protect against local changes
echo "🔍 Checking for local changes..."
if ! git diff-index --quiet HEAD --; then
    echo "⚠️ You have local changes. Stashing them temporarily..."
    git stash push -m "auto-stash-before-deploy-$(date +%Y%m%d-%H%M%S)" || {
        echo "❌ Failed to stash changes"
        exit 1
    }
    STASHED=true
fi

# Pull latest changes from Git
echo "📥 Pulling latest changes..."
git pull origin main || {
    echo "❌ Git pull failed"
    exit 1
}
echo "✅ Git pull completed"

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
    echo "📌 Applying previously stashed changes..."
    git stash pop || echo "⚠️ Could not apply stashed changes automatically. Check 'git stash list'"
fi

# Check environment files
echo "🔧 Checking environment configuration..."
if [ ! -f ".env.production" ]; then
    echo "⚠️ Warning: .env.production not found"
    echo "💡 Make sure to create .env.production with required variables:"
    echo "   NEXT_PUBLIC_WORDPRESS_API_URL=https://cms.edrishusein.com/graphql"
    echo "   NEXT_PUBLIC_SITE_URL=https://edrishusein.com"
    echo "   NODE_ENV=production"
else
    echo "✅ Environment file found"
fi

# Backup previous logs
if [ -f server.log ]; then
    echo "💾 Backing up previous logs..."
    mv server.log "server.log.$(date +%Y%m%d%H%M%S)"
fi

# Clear caches (fixes chunk loading errors)
echo "🧹 Clearing caches..."
rm -rf .next
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .next/cache 2>/dev/null || true
echo "✅ Build caches cleared - prevents JavaScript console errors!"

# Clear npm cache for thorough cleanup
echo "🧹 Clearing npm cache for thorough cleanup..."
npm cache clean --force 2>/dev/null || echo "⚠️ NPM cache clean failed (non-critical)"

# 2. Install dependencies with better error handling
echo "📦 Installing dependencies..."
npm install || {
    echo "❌ npm install failed"
    exit 1
}

# 3. Build application with error handling
echo "🔨 Building application..."
npm run build || {
    echo "❌ Build failed"
    exit 1
}

# 4. Check build artifacts exist
if [ ! -f ".next/standalone/server.js" ]; then
    echo "❌ Build failed: server.js not found!"
    exit 1
fi
echo "✅ Build artifacts verified"

# Copy assets to standalone build and document root for Apache
echo "📁 Copying static assets..."
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# Copy static assets to document root for Apache to serve directly
echo "📁 Setting up static files for Apache..."
mkdir -p _next
cp -r .next/static _next/
echo "✅ Static files copied to document root"

# 5. Safer process restart using PID file
echo "🔄 Managing server process..."

# First try to stop via PID file
if [ -f "$PID_FILE" ]; then
    echo "🛑 Stopping existing process via PID file..."
    if kill $(cat $PID_FILE) 2>/dev/null; then
        echo "✅ Stopped existing process"
        sleep 2
    else
        echo "⚠️ Process was already stopped or PID file stale"
    fi
    rm -f $PID_FILE
fi

# Force kill any remaining Node.js processes to prevent port conflicts
echo "🧹 Ensuring no conflicting processes..."
pkill -f "next-server" 2>/dev/null && echo "✅ Stopped additional next-server processes" || true
pkill -f "node.*server.js" 2>/dev/null && echo "✅ Stopped additional node processes" || true

# Also kill any process using port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "✅ Freed up port 3000" || true
sleep 2

# Verify port 3000 is available
if lsof -i:3000 >/dev/null 2>&1; then
    echo "❌ Port 3000 is still in use, waiting..."
    sleep 3
    if lsof -i:3000 >/dev/null 2>&1; then
        echo "❌ Cannot free port 3000. Manual intervention needed."
        exit 1
    fi
fi
echo "✅ Port 3000 is available"

# Start the application in background
echo "▶️ Starting Next.js server..."
nohup node .next/standalone/server.js > server.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > $PID_FILE
echo "🆔 Started server with PID: $SERVER_PID"

# Wait and verify process started
sleep 3
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Deployment successful! Process is running."
    echo "🔗 Testing server response..."
    if curl -s -I http://localhost:3000/ | head -1 | grep -q "200\|301\|302"; then
        echo "✅ Server responding correctly"
    else
        echo "⚠️ Server running but not responding properly"
    fi
else
    echo "❌ Server failed to start"
    echo "🔍 Checking logs for error details:"
    echo "----------------------------------------"
    tail -20 server.log
    echo "----------------------------------------"
    echo "🔍 Checking what's using port 3000:"
    lsof -i:3000 || echo "No process found on port 3000"
    echo "🔍 Checking for any Node.js processes:"
    ps aux | grep -E "(node|next)" | grep -v grep || echo "No Node.js processes found"
    echo "🔍 Checking if server.js exists:"
    if [ -f ".next/standalone/server.js" ]; then
        echo "✅ server.js exists"
    else
        echo "❌ server.js not found!"
    fi
    rm -f $PID_FILE
    exit 1
fi

# 6. Deployment summary
echo ""
echo "🎉 Deployment completed successfully!"
echo "📌 Deployed commit: $(git rev-parse HEAD)"
echo "📅 Deployment time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "🌍 Site updated at: https://edrishusein.com"
echo "📊 Check logs with: tail -f server.log"
echo "🔍 Clear browser cache (Ctrl+Shift+F5) to see changes!"