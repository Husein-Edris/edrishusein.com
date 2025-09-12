#!/bin/bash
set -e

echo "🚀 Starting automated Git deployment..."

# Function to show usage
show_usage() {
    echo "Usage: $0 [--force] [--branch=branch_name]"
    echo "  --force: Force overwrite local changes"
    echo "  --branch: Specify branch to deploy (default: main)"
    exit 1
}

# Parse arguments
FORCE=false
BRANCH="main"

for arg in "$@"; do
    case $arg in
        --force)
            FORCE=true
            shift
            ;;
        --branch=*)
            BRANCH="${arg#*=}"
            shift
            ;;
        -h|--help)
            show_usage
            ;;
        *)
            echo "Unknown argument: $arg"
            show_usage
            ;;
    esac
done

# Get current directory (should be httpdocs)
CURRENT_DIR=$(pwd)
echo "📍 Current directory: $CURRENT_DIR"

# Check if we're in the right place
if [[ ! -f "package.json" ]]; then
    echo "❌ Error: package.json not found. Are you in the httpdocs directory?"
    exit 1
fi

# Step 1: Pull latest changes from git repository
echo "📥 Pulling latest changes from git repository..."
cd ../git/edrishusein.com.git

# Fetch latest changes
echo "🔄 Fetching latest changes..."
git fetch origin $BRANCH

# Reset to latest commit (this handles the cache clearing)
echo "🔄 Updating to latest $BRANCH..."
if [ "$FORCE" = true ]; then
    git reset --hard origin/$BRANCH
else
    git merge origin/$BRANCH
fi

# Step 2: Deploy to httpdocs
echo "📤 Deploying files to web directory..."
git --git-dir=. --work-tree=../../httpdocs checkout -f HEAD

# Go back to httpdocs
cd "$CURRENT_DIR"

# Step 3: Clear caches and rebuild
echo "🧹 Clearing caches..."
rm -rf .next/cache node_modules/.cache 2>/dev/null || true

# Step 4: Install dependencies (if package.json changed)
echo "📦 Installing dependencies..."
npm ci --production=false

# Step 5: Build application
echo "🏗️ Building application..."
npm run build

# Step 6: Copy public assets to standalone build
echo "📁 Copying static assets..."
cp -r public .next/standalone/ 2>/dev/null || true

# Step 7: Restart application
echo "🔄 Restarting application..."

# Try to stop existing processes
pkill -f "node.*server.js" 2>/dev/null || echo "No existing Node process found"
pkill -f "next-server" 2>/dev/null || echo "No existing next-server process found"

# Wait a moment for processes to stop
sleep 2

# Start new process
echo "▶️ Starting Next.js server..."
nohup node .next/standalone/server.js > server.log 2>&1 &

# Wait and verify
sleep 3
if pgrep -f "node.*server.js" > /dev/null; then
    echo "✅ Deployment successful! Process is running."
    echo "🌍 Site updated at: https://edrishusein.com"
    echo "📊 Check logs: tail -f server.log"
    echo "🔍 Process ID: $(pgrep -f 'node.*server.js')"
else
    echo "❌ Warning: Process may not have started correctly."
    echo "📊 Check logs: tail -f server.log"
    exit 1
fi

echo "🎉 Deployment complete!"