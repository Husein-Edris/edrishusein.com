#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Build the application
echo "📦 Building application..."
npm run build

# Copy public assets to standalone build (required for static files)
echo "📁 Copying static assets..."
cp -r public .next/standalone/

# Restart the Next.js application
echo "🔄 Restarting application..."
pkill -f next-server || echo "No existing process found"

# Start the application in background
echo "▶️ Starting Next.js server..."
nohup node .next/standalone/server.js > server.log 2>&1 &

# Wait a moment and check if process started
sleep 2
if ps aux | grep next-server | grep -q -v grep; then
    echo "✅ Deployment successful! Process is running."
else
    echo "❌ Warning: Process may not have started correctly."
fi

echo "🌍 Site should be updated at: https://edrishusein.com"
echo "📊 Check logs with: tail -f server.log"