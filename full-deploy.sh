#!/bin/bash
set -e

echo "🚀 Starting comprehensive deployment..."

# Function to show usage
show_usage() {
    echo "Usage: $0 [--force] [--branch=branch_name] [--skip-git] [--no-restart]"
    echo "  --force: Force overwrite local changes"
    echo "  --branch: Specify branch to deploy (default: main)"
    echo "  --skip-git: Skip git pull, just rebuild and deploy"
    echo "  --no-restart: Skip server restart (for static-only changes)"
    exit 1
}

# Parse arguments
FORCE=false
BRANCH="main"
SKIP_GIT=false
NO_RESTART=false

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
        --skip-git)
            SKIP_GIT=true
            shift
            ;;
        --no-restart)
            NO_RESTART=true
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

# Get current directory
CURRENT_DIR=$(pwd)
echo "📍 Current directory: $CURRENT_DIR"

# Check if we're in httpdocs or navigate to it
if [[ ! -f "package.json" ]]; then
    echo "📂 Not in httpdocs, attempting to navigate..."
    
    # Try to find httpdocs directory
    if [[ -d "httpdocs" ]]; then
        echo "📍 Found httpdocs directory, navigating..."
        cd httpdocs
    elif [[ -d "../httpdocs" ]]; then
        echo "📍 Found httpdocs in parent directory, navigating..."
        cd ../httpdocs
    else
        echo "❌ Error: Cannot find httpdocs directory with package.json"
        echo "💡 Please run this script from the correct directory"
        exit 1
    fi
fi

# Verify we're in the right place now
if [[ ! -f "package.json" ]]; then
    echo "❌ Error: Still no package.json found. Cannot proceed."
    exit 1
fi

echo "✅ Confirmed we're in the correct directory: $(pwd)"

# Step 1: Git operations (unless skipped)
if [[ "$SKIP_GIT" == false ]]; then
    echo "📥 Pulling latest changes from git repository..."
    
    # Check if we're in a git repository
    if [[ ! -d ".git" ]]; then
        echo "❌ Error: Not in a git repository"
        exit 1
    fi
    
    # Fetch latest changes
    echo "🔄 Fetching latest changes from $BRANCH..."
    git fetch origin $BRANCH
    
    # Pull or reset based on force flag
    if [[ "$FORCE" == true ]]; then
        echo "⚠️  Force mode: Resetting to origin/$BRANCH (will overwrite local changes)"
        git reset --hard origin/$BRANCH
    else
        echo "🔄 Merging changes from origin/$BRANCH..."
        git pull origin $BRANCH
    fi
    
    echo "✅ Git operations completed"
else
    echo "⏭️  Skipping git operations as requested"
fi

# Step 2: Clear caches
echo "🧹 Clearing caches and temporary files..."
rm -rf .next/cache 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .next/standalone 2>/dev/null || true

# Step 3: Install dependencies
echo "📦 Installing/updating dependencies..."
npm ci --production=false

# Step 4: Build application
echo "🏗️ Building application..."
npm run build

# Step 5: Copy public assets to standalone build
echo "📁 Copying static assets to standalone build..."
if [[ -d "public" && -d ".next/standalone" ]]; then
    cp -r public .next/standalone/
    echo "✅ Static assets copied successfully"
else
    echo "⚠️  Warning: Could not copy static assets (missing directories)"
fi

# Step 6: Smart application restart
if [[ "$NO_RESTART" == true ]]; then
    echo "⏭️  Skipping server restart as requested"
    echo "ℹ️  Note: Code changes may not be reflected until manual restart"
    
    # Just verify server is running
    if pgrep -f "node.*server.js" > /dev/null; then
        CURRENT_PID=$(pgrep -f "node.*server.js")
        echo "✅ Server is still running with PID: $CURRENT_PID"
    else
        echo "⚠️  Warning: No server is currently running!"
        echo "💡 You may need to start the server manually: node .next/standalone/server.js"
    fi
else
    echo "🔄 Managing application restart..."
    
    # Check if server is currently running
    if pgrep -f "node.*server.js" > /dev/null; then
        CURRENT_PID=$(pgrep -f "node.*server.js")
        echo "ℹ️  Current server running with PID: $CURRENT_PID"
        
        # Always restart after a build (code changes require restart)
        echo "🛑 Stopping existing server (code changes detected)..."
        pkill -f "node.*server.js" 2>/dev/null && echo "✅ Stopped existing node server" || echo "ℹ️  No server to stop"
        pkill -f "next-server" 2>/dev/null && echo "✅ Stopped existing next-server" || echo "ℹ️  No next-server to stop"
        
        # Wait for processes to stop gracefully
        echo "⏳ Waiting for graceful shutdown..."
        sleep 3
        
        # Force kill if still running
        if pgrep -f "node.*server.js" > /dev/null; then
            echo "⚠️  Force killing remaining processes..."
            pkill -9 -f "node.*server.js" 2>/dev/null || true
            sleep 1
        fi
    else
        echo "ℹ️  No existing server found"
    fi

    # Start new process
    echo "▶️ Starting Next.js server..."
    if [[ -f ".next/standalone/server.js" ]]; then
        nohup node .next/standalone/server.js > server.log 2>&1 &
        SERVER_PID=$!
        echo "🆔 Started server with PID: $SERVER_PID"
    else
        echo "❌ Error: .next/standalone/server.js not found"
        exit 1
    fi
fi

# Wait and verify
sleep 5
if pgrep -f "node.*server.js" > /dev/null; then
    RUNNING_PID=$(pgrep -f "node.*server.js")
    echo "✅ Deployment successful! Server is running with PID: $RUNNING_PID"
    echo "🌍 Site should be updated and accessible"
    echo "📊 Check logs: tail -f server.log"
    echo "🔍 Monitor process: ps aux | grep server.js"
else
    echo "❌ Warning: Server may not have started correctly"
    echo "📊 Check logs: tail -f server.log"
    echo "🔧 Try manual start: node .next/standalone/server.js"
    exit 1
fi

echo ""
echo "🎉 Full deployment complete!"
echo "📋 Summary:"
echo "   📂 Directory: $(pwd)"
echo "   🌿 Branch: $BRANCH"
echo "   🔄 Git pull: $([ "$SKIP_GIT" == true ] && echo "Skipped" || echo "Completed")"
echo "   🏗️  Build: Completed"
echo "   ⚡ Server: Running"
