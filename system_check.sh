#!/bin/bash
echo "🔍 COMPREHENSIVE SYSTEM CHECK"
echo "=============================="
echo ""

# 1. Check if server is running
echo "1️⃣ Server Status:"
if curl -s http://localhost:3000 > /dev/null; then
    echo "   ✅ Server is responding on port 3000"
else
    echo "   ❌ Server is NOT responding"
fi
echo ""

# 2. Check JavaScript syntax
echo "2️⃣ JavaScript Syntax:"
if node -c public/static/app-v3.js 2>/dev/null; then
    echo "   ✅ app-v3.js syntax is valid"
else
    echo "   ❌ app-v3.js has syntax errors"
fi

if node -c public/static/crypto-v2.js 2>/dev/null; then
    echo "   ✅ crypto-v2.js syntax is valid"
else
    echo "   ❌ crypto-v2.js has syntax errors"
fi
echo ""

# 3. Check for console.error statements
echo "3️⃣ Error Handling:"
ERROR_COUNT=$(grep -c "console.error" public/static/app-v3.js)
echo "   ℹ️  Found $ERROR_COUNT error handlers in app-v3.js"
echo ""

# 4. Check polling intervals
echo "4️⃣ Polling Configuration:"
grep "setInterval.*3000" public/static/app-v3.js > /dev/null && echo "   ✅ Message polling: 3 seconds"
echo ""

# 5. Check voice recording guards
echo "5️⃣ Voice Recording Fixes:"
grep "if (this.isRecording)" public/static/app-v3.js > /dev/null && echo "   ✅ Recording guard exists"
grep "sampleRate: 16000" public/static/app-v3.js > /dev/null && echo "   ✅ 16kHz sample rate configured"
grep "audioBitsPerSecond: 24000" public/static/app-v3.js > /dev/null && echo "   ✅ 24kbps bitrate configured"
grep "voice-sending-indicator" public/static/app-v3.js > /dev/null && echo "   ✅ Sending indicator added"
echo ""

# 6. Check encryption chunk processing
echo "6️⃣ Encryption Fixes:"
grep "8192" public/static/crypto-v2.js > /dev/null && echo "   ✅ Chunk processing (8KB) implemented"
echo ""

# 7. Check PM2 status
echo "7️⃣ PM2 Status:"
pm2 list | grep "online" > /dev/null && echo "   ✅ PM2 process is online"
RESTARTS=$(pm2 list | grep "securechat-pay" | awk '{print $14}')
echo "   ℹ️  Process restarts: $RESTARTS"
echo ""

# 8. Check recent errors
echo "8️⃣ Recent Errors:"
ERROR_LINES=$(pm2 logs securechat-pay --err --nostream --lines 10 2>/dev/null | grep "ERROR" | wc -l)
if [ "$ERROR_LINES" -gt 0 ]; then
    echo "   ⚠️  Found $ERROR_LINES recent errors in logs"
else
    echo "   ✅ No recent errors"
fi
echo ""

echo "=============================="
echo "✅ System check complete!"
