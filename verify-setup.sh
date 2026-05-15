#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verifying LuxeDrive Setup..."
echo ""

# Check if pnpm is installed
echo -n "Checking pnpm installation... "
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✓${NC} pnpm v$PNPM_VERSION installed"
else
    echo -e "${RED}✗${NC} pnpm not found"
    echo "Install with: npm install -g pnpm"
    exit 1
fi

# Check Node.js version
echo -n "Checking Node.js version... "
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION"

# Check workspace configuration
echo -n "Checking workspace configuration... "
if [ -f "pnpm-workspace.yaml" ]; then
    echo -e "${GREEN}✓${NC} pnpm-workspace.yaml found"
else
    echo -e "${RED}✗${NC} pnpm-workspace.yaml not found"
    exit 1
fi

# Check frontend dependencies
echo -n "Checking frontend dependencies... "
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Frontend dependencies not installed"
    echo "Run: pnpm install"
fi

# Check backend dependencies
echo -n "Checking backend dependencies... "
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Backend dependencies not installed"
    echo "Run: pnpm install"
fi

# Check Prisma client
echo -n "Checking Prisma client... "
if [ -d "backend/src/generated/prisma" ]; then
    echo -e "${GREEN}✓${NC} Prisma client generated"
else
    echo -e "${YELLOW}⚠${NC} Prisma client not generated"
    echo "Run: pnpm prisma:generate"
fi

# Check environment files
echo -n "Checking backend .env file... "
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env found"
else
    echo -e "${YELLOW}⚠${NC} Backend .env not found"
    echo "Copy from: backend/.env.example"
fi

echo -n "Checking frontend .env file... "
if [ -f "frontend/.env.production" ]; then
    echo -e "${GREEN}✓${NC} Frontend .env.production found"
else
    echo -e "${YELLOW}⚠${NC} Frontend .env.production not found"
    echo "Create from example"
fi

# Check lock files
echo -n "Checking lock files... "
if [ -f "frontend/pnpm-lock.yaml" ] && [ -f "backend/pnpm-lock.yaml" ]; then
    echo -e "${GREEN}✓${NC} Lock files present"
else
    echo -e "${YELLOW}⚠${NC} Lock files missing"
fi

echo ""
echo "📊 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Count checks
TOTAL_CHECKS=9
PASSED_CHECKS=0

[ -f "pnpm-workspace.yaml" ] && ((PASSED_CHECKS++))
[ -d "frontend/node_modules" ] && ((PASSED_CHECKS++))
[ -d "backend/node_modules" ] && ((PASSED_CHECKS++))
[ -d "backend/src/generated/prisma" ] && ((PASSED_CHECKS++))
[ -f "backend/.env" ] && ((PASSED_CHECKS++))
[ -f "frontend/.env.production" ] && ((PASSED_CHECKS++))
[ -f "frontend/pnpm-lock.yaml" ] && ((PASSED_CHECKS++))
[ -f "backend/pnpm-lock.yaml" ] && ((PASSED_CHECKS++))
command -v pnpm &> /dev/null && ((PASSED_CHECKS++))

echo "Passed: $PASSED_CHECKS/$TOTAL_CHECKS checks"

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "🚀 Ready to start development:"
    echo "   pnpm dev"
    exit 0
else
    echo -e "${YELLOW}⚠ Some checks failed${NC}"
    echo ""
    echo "📝 Next steps:"
    [ ! -d "frontend/node_modules" ] && echo "   1. Run: pnpm install"
    [ ! -d "backend/src/generated/prisma" ] && echo "   2. Run: pnpm prisma:generate"
    [ ! -f "backend/.env" ] && echo "   3. Create backend/.env from .env.example"
    [ ! -f "frontend/.env.production" ] && echo "   4. Create frontend/.env.production"
    exit 1
fi
