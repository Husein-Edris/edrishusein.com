#!/bin/bash
# Simple one-command deployment script
# Usage: ./auto-deploy.sh

set -e

echo "🚀 Auto-deploying latest changes..."

# Pull and deploy in one command
cd ../git/edrishusein.com.git && \
git fetch origin main && \
git reset --hard origin/main && \
git --git-dir=. --work-tree=../../httpdocs checkout -f HEAD && \
cd ../../httpdocs && \
chmod +x *.sh && \
./deploy.sh

echo "✅ Auto-deployment complete!"