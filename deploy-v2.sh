#!/bin/bash
# ============================================
# AMEBO v2.0 - Quick Deployment Script
# ============================================
# Run this after configuring Cloudflare API key

set -e  # Exit on error

echo "🚀 AMEBO v2.0 Deployment Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "wrangler.v2.jsonc" ]; then
    echo -e "${RED}❌ Error: wrangler.v2.jsonc not found${NC}"
    echo "Please run this script from /home/user/webapp/"
    exit 1
fi

echo -e "${BLUE}Step 1:${NC} Creating v2 production database..."
DB_OUTPUT=$(npx wrangler d1 create amebo-v2-production 2>&1)
echo "$DB_OUTPUT"

# Extract database_id from output
DB_ID=$(echo "$DB_OUTPUT" | grep "database_id" | sed 's/.*"\(.*\)"/\1/')

if [ -z "$DB_ID" ]; then
    echo -e "${YELLOW}⚠️  Database might already exist or creation failed${NC}"
    echo "Check output above for details"
    echo ""
    read -p "Enter database_id manually (or press Enter to skip): " DB_ID
fi

if [ ! -z "$DB_ID" ]; then
    echo -e "${GREEN}✅ Database ID: ${DB_ID}${NC}"
    echo ""
    echo -e "${BLUE}Step 2:${NC} Updating wrangler.v2.jsonc..."
    
    # Backup original
    cp wrangler.v2.jsonc wrangler.v2.jsonc.bak
    
    # Update database_id
    sed -i "s/\"database_id\": \"\"/\"database_id\": \"$DB_ID\"/" wrangler.v2.jsonc
    echo -e "${GREEN}✅ Configuration updated${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping database_id update${NC}"
    echo "Please manually add database_id to wrangler.v2.jsonc"
fi

echo ""
echo -e "${BLUE}Step 3:${NC} Applying database schema..."
npx wrangler d1 execute amebo-v2-production \
    --file=migrations_v2/0001_clean_schema_v2.sql
echo -e "${GREEN}✅ Schema applied${NC}"

echo ""
echo -e "${BLUE}Step 4:${NC} Verifying database tables..."
npx wrangler d1 execute amebo-v2-production \
    --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
echo -e "${GREEN}✅ Database verified${NC}"

echo ""
echo -e "${BLUE}Step 5:${NC} Creating Cloudflare Pages project..."
npx wrangler pages project create amebo-v2 --production-branch v2.0-rebuild || \
    echo -e "${YELLOW}⚠️  Project might already exist${NC}"
echo -e "${GREEN}✅ Project ready${NC}"

echo ""
echo -e "${BLUE}Step 6:${NC} Deploying to production..."
npx wrangler pages deploy dist_v2 --project-name amebo-v2
echo -e "${GREEN}✅ Deployment complete!${NC}"

echo ""
echo "================================"
echo -e "${GREEN}🎉 SUCCESS!${NC}"
echo ""
echo "v2 is now live at: ${BLUE}https://amebo-v2.pages.dev${NC}"
echo ""
echo "Next steps:"
echo "1. Test: curl https://amebo-v2.pages.dev/api/v2/health"
echo "2. Visit: https://amebo-v2.pages.dev"
echo "3. Register test user"
echo "4. Test all features"
echo ""
echo "v1 stays at: ${BLUE}https://amebo-app.pages.dev${NC}"
echo ""
echo "See DEPLOYMENT_GUIDE_V2.md for testing checklist"
