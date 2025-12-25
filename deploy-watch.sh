#!/bin/bash

# ============================================
# FILE WATCHER - AUTO DEPLOY ON CHANGES
# Monitors src/ and public/ folders
# Auto-deploys to all devices in < 1 minute
# ============================================

set -e

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║           👀 FILE WATCHER - AUTO DEPLOY ENABLED                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if CLOUDFLARE_API_TOKEN is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN not set"
    echo "Please set it: export CLOUDFLARE_API_TOKEN='your-token'"
    exit 1
fi

# Check if inotify-tools is installed (for Linux file watching)
if ! command -v inotifywait &> /dev/null; then
    echo "📦 Installing inotify-tools..."
    sudo apt-get update > /dev/null 2>&1
    sudo apt-get install -y inotify-tools > /dev/null 2>&1
    echo "   ✅ inotify-tools installed"
fi

WATCH_DIRS="src public"
DEBOUNCE_SECONDS=5
LAST_DEPLOY=0

echo "👀 Watching for changes in:"
echo "   • src/"
echo "   • public/"
echo ""
echo "⚙️  Settings:"
echo "   • Debounce: ${DEBOUNCE_SECONDS}s (waits before deploying)"
echo "   • Auto-deploy: Enabled"
echo "   • Target: < 1 minute per deploy"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ File watcher is now active! Press Ctrl+C to stop."
echo ""

# Function to deploy
deploy() {
    CURRENT_TIME=$(date +%s)
    TIME_SINCE_LAST=$((CURRENT_TIME - LAST_DEPLOY))
    
    # Debounce: don't deploy if less than DEBOUNCE_SECONDS since last deploy
    if [ $TIME_SINCE_LAST -lt $DEBOUNCE_SECONDS ]; then
        echo "   ⏳ Debouncing... (${TIME_SINCE_LAST}s since last deploy)"
        return
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔥 CHANGE DETECTED - Starting auto-deploy..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Run instant deployment script
    ./deploy-instant.sh
    
    LAST_DEPLOY=$(date +%s)
    
    echo ""
    echo "✅ Auto-deploy complete! Watching for next change..."
    echo ""
}

# Watch for file changes
inotifywait -m -r -e modify,create,delete,move \
    --exclude '(node_modules|\.git|dist|\.wrangler|\.vscode)' \
    $WATCH_DIRS |
while read -r directory event filename; do
    # Only deploy for relevant file types
    if [[ "$filename" =~ \.(ts|tsx|js|jsx|css|html|json)$ ]]; then
        echo "📝 Changed: $directory$filename"
        deploy
    fi
done
