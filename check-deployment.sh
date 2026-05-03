#!/bin/bash

echo "🚀 WellSpring PWA Deployment Checklist"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check if git is initialized
echo "📋 Checking Prerequisites..."
echo ""

if [ -d ".git" ]; then
    check_pass "Git repository initialized"
else
    check_fail "Git repository not found. Run: git init"
    exit 1
fi

# 2. Check for uncommitted changes
if [ -z "$(git status --porcelain)" ]; then
    check_pass "No uncommitted changes"
else
    check_warn "You have uncommitted changes. Consider committing them first."
fi

# 3. Check if node_modules exist
if [ -d "node_modules" ] && [ -d "frontend/node_modules" ]; then
    check_pass "Dependencies installed"
else
    check_fail "Dependencies missing. Run: npm install && cd frontend && npm install"
    exit 1
fi

# 4. Check for environment files
echo ""
echo "📄 Checking Configuration Files..."
echo ""

if [ -f "frontend/netlify.toml" ]; then
    check_pass "netlify.toml exists"
else
    check_fail "netlify.toml not found"
fi

if [ -f "frontend/.env.production" ]; then
    check_pass ".env.production exists"
else
    check_warn ".env.production not found (create it with VITE_API_URL)"
fi

# 5. Check PWA files
echo ""
echo "📱 Checking PWA Files..."
echo ""

if [ -f "frontend/public/manifest.webmanifest" ] || [ -f "frontend/public/manifest.json" ]; then
    check_pass "PWA manifest exists"
else
    check_fail "PWA manifest not found"
fi

if [ -f "frontend/public/pwa-192x192.png" ]; then
    check_pass "PWA icon 192x192 exists"
else
    check_fail "PWA icon 192x192 missing"
fi

if [ -f "frontend/public/pwa-512x512.png" ]; then
    check_pass "PWA icon 512x512 exists"
else
    check_fail "PWA icon 512x512 missing"
fi

# 6. Check backend build
echo ""
echo "🔧 Testing Backend Build..."
echo ""

npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    check_pass "Backend builds successfully"
else
    check_fail "Backend build failed. Run: npm run build"
    exit 1
fi

# 7. Check frontend build
echo ""
echo "🎨 Testing Frontend Build..."
echo ""

cd frontend
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    check_pass "Frontend builds successfully"
else
    check_fail "Frontend build failed. Run: cd frontend && npm run build"
    exit 1
fi
cd ..

# 8. Check if Prisma is configured
echo ""
echo "🗄️  Checking Database Configuration..."
echo ""

if [ -f "prisma/schema.prisma" ]; then
    check_pass "Prisma schema exists"
else
    check_fail "Prisma schema not found"
fi

# 9. Check for sensitive files in git
echo ""
echo "🔐 Checking Security..."
echo ""

if grep -q ".env" .gitignore 2>/dev/null; then
    check_pass ".env files are gitignored"
else
    check_warn ".env should be in .gitignore"
fi

if [ -f ".env" ]; then
    if git ls-files --error-unmatch .env > /dev/null 2>&1; then
        check_fail ".env file is tracked by git (SECURITY RISK!)"
    else
        check_pass ".env file not tracked by git"
    fi
fi

# Summary
echo ""
echo "======================================"
echo "📊 Deployment Readiness Summary"
echo "======================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Backend Deployment (Render.com):"
echo "   → Go to https://render.com"
echo "   → New Web Service → Connect your repo"
echo "   → Build Command: npm install && npm run build"
echo "   → Start Command: npm start"
echo "   → Add DATABASE_URL, JWT_SECRET environment variables"
echo ""
echo "2. Frontend Deployment (Netlify):"
echo "   → Go to https://netlify.com"
echo "   → New Site → Import from Git"
echo "   → Base directory: frontend"
echo "   → Build command: npm run build"
echo "   → Publish directory: frontend/dist"
echo "   → Add VITE_API_URL environment variable"
echo ""
echo "3. After Backend Deploys:"
echo "   → Update frontend/.env.production with backend URL"
echo "   → Redeploy frontend"
echo "   → Run migrations: npx prisma migrate deploy"
echo ""
echo "📚 Read DEPLOY.md for detailed instructions"
echo ""
