#!/bin/bash

# =============================================================================
# DOQ - AI Medical Platform Production Deployment Script
# =============================================================================
# 
# This script handles the complete deployment process for production
# 
# Usage: ./scripts/deploy.sh [environment]
# Example: ./scripts/deploy.sh production
#
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="doq-medical-ai"
BUILD_DIR="dist"

echo -e "${BLUE}🚀 Starting deployment for ${ENVIRONMENT} environment${NC}"

# -----------------------------------------------------------------------------
# Pre-deployment checks
# -----------------------------------------------------------------------------
echo -e "${YELLOW}📋 Running pre-deployment checks...${NC}"

# Check if required environment variables are set
if [ "$ENVIRONMENT" = "production" ]; then
    required_vars=(
        "DATABASE_URL"
        "CLERK_SECRET_KEY"
        "OPEN_ROUTER_API_KEY"
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}❌ Error: Required environment variable $var is not set${NC}"
            exit 1
        fi
    done
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    exit 1
fi

# -----------------------------------------------------------------------------
# Install dependencies
# -----------------------------------------------------------------------------
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci --only=production

# -----------------------------------------------------------------------------
# Run tests
# -----------------------------------------------------------------------------
echo -e "${YELLOW}🧪 Running tests...${NC}"
npm run test:ci || {
    echo -e "${RED}❌ Tests failed. Deployment aborted.${NC}"
    exit 1
}

# -----------------------------------------------------------------------------
# Build application
# -----------------------------------------------------------------------------
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

# Check if build was successful
if [ ! -d ".next" ]; then
    echo -e "${RED}❌ Build failed. .next directory not found.${NC}"
    exit 1
fi

# -----------------------------------------------------------------------------
# Database migrations
# -----------------------------------------------------------------------------
echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
npm run db:push

# -----------------------------------------------------------------------------
# Security checks
# -----------------------------------------------------------------------------
echo -e "${YELLOW}🔒 Running security audit...${NC}"
npm audit --audit-level=high

# -----------------------------------------------------------------------------
# Bundle analysis (optional)
# -----------------------------------------------------------------------------
if [ "$ANALYZE_BUNDLE" = "true" ]; then
    echo -e "${YELLOW}📊 Analyzing bundle size...${NC}"
    ANALYZE=true npm run build
fi

# -----------------------------------------------------------------------------
# Deployment
# -----------------------------------------------------------------------------
echo -e "${YELLOW}🚀 Deploying to ${ENVIRONMENT}...${NC}"

case $ENVIRONMENT in
    "vercel")
        echo -e "${BLUE}Deploying to Vercel...${NC}"
        npx vercel --prod
        ;;
    "netlify")
        echo -e "${BLUE}Deploying to Netlify...${NC}"
        npx netlify deploy --prod --dir=.next
        ;;
    "docker")
        echo -e "${BLUE}Building Docker image...${NC}"
        docker build -t $PROJECT_NAME:latest .
        ;;
    *)
        echo -e "${BLUE}Custom deployment for ${ENVIRONMENT}...${NC}"
        # Add your custom deployment logic here
        ;;
esac

# -----------------------------------------------------------------------------
# Post-deployment checks
# -----------------------------------------------------------------------------
echo -e "${YELLOW}🔍 Running post-deployment checks...${NC}"

# Health check (if URL is provided)
if [ ! -z "$HEALTH_CHECK_URL" ]; then
    echo -e "${BLUE}Checking application health...${NC}"
    curl -f "$HEALTH_CHECK_URL/api/health" || {
        echo -e "${RED}❌ Health check failed${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Health check passed${NC}"
fi

# -----------------------------------------------------------------------------
# Cleanup
# -----------------------------------------------------------------------------
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm -rf node_modules/.cache
rm -rf .next/cache

# -----------------------------------------------------------------------------
# Success
# -----------------------------------------------------------------------------
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Build time: $(date)${NC}"

# Send notification (optional)
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ DOQ Medical AI deployed successfully to ${ENVIRONMENT}\"}" \
        "$SLACK_WEBHOOK_URL"
fi
