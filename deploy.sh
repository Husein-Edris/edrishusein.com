#!/bin/bash
set -e

echo "🚀 Deploying edrishusein.com..."

# Pull latest code (if using git)
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build application
echo "🔨 Building application..."
npm run build

# Restart PM2 process
echo "🔄 Restarting application..."
pm2 restart edrishusein.com

echo "✅ Deployment complete!"
echo "🌐 Site available at: https://edrishusein.com"