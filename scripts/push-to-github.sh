#!/bin/bash

# ============================================================
# SciHub Pro - GitHub Push Script
# ============================================================
# This script helps you push your SciHub Pro project to GitHub
# and set up live preview via Vercel/GitHub Pages
# ============================================================

set -e

echo "╔══════════════════════════════════════════════════════╗"
echo "║        SciHub Pro - GitHub Deployment Tool          ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

PROJECT_DIR="/home/z/my-project"
REPO_NAME="scihub-pro-demo"

cd "$PROJECT_DIR"

# Step 1: Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo ""
    echo "📋 To install and authenticate:"
    echo ""
    echo "   Option A - Install gh CLI (recommended):"
    echo "   → Visit: https://github.com/cli/cli#installation"
    echo "   → Or on Ubuntu/Debian:"
    echo "     sudo apt install gh"
    echo "     gh auth login"
    echo ""
    echo "   Option B - Use Personal Access Token:"
    echo "   1. Go to https://github.com/settings/tokens"
    echo "   2. Generate new token (repo scope)"
    echo "   3. Run: git remote add origin https://<TOKEN>@github.com/<USER>/${REPO_NAME}.git"
    echo "   4. Run: git push -u origin main"
    echo ""
    exit 1
fi

# Step 2: Check authentication
echo "✅ GitHub CLI found!"
echo ""

if ! gh auth status &> /dev/null; then
    echo "🔐 Please authenticate with GitHub:"
    echo "   Run: gh auth login"
    echo "   Select: GitHub.com > HTTPS > Login with browser"
    echo ""
    exit 1
fi

# Step 3: Get GitHub username
GITHUB_USER=$(gh api user --jq '.login')
echo "👤 Authenticated as: ${GITHUB_USER}"
echo ""

# Step 4: Check if repo exists, if not create it
echo "📦 Setting up repository: ${GITHUB_USER}/${REPO_NAME}..."
if gh repo view "${GITHUB_USER}/${REPO_NAME}" &> /dev/null; then
    echo "   ✅ Repository already exists"
else
    echo "   🆕 Creating new repository..."
    gh repo create "${REPO_NAME}" \
        --public \
        --description="SciHub Pro - Scientific Research Microservices Platform" \
        --homepage="https://scihub.pro" \
        --source="$PROJECT_DIR" \
        --push \
        2>/dev/null || true
    
    # If auto-push didn't work, do it manually
    REMOTE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
    
    # Remove existing origin if any
    git remote remove origin 2>/dev/null || true
    
    # Add new remote
    git remote add origin "$REMOTE_URL" 2>/dev/null || git remote set-url origin "$REMOTE_URL"
    
    # Push
    echo "   🚀 Pushing code to GitHub..."
    git push -u origin main --force
fi

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║              ✅ SUCCESS!                            ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Your repository is now live at:"
echo "   https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEPS FOR LIVE PREVIEW:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Option 1: Vercel (Recommended for Next.js)"
echo "   1. Go to https://vercel.com/import"
echo "   2. Import your GitHub repo: ${GITHUB_USER}/${REPO_NAME}"
echo "   3. Click 'Deploy' - it auto-detects Next.js!"
echo "   4. Get instant HTTPS URL like: scihub-pro.vercel.app"
echo ""
echo "Option 2: Netlify"
echo "   1. Go to https://app.netlify.com/start"
echo "   2. Connect GitHub & select repo"
echo "   3. Build command: npm run build"
echo "   4. Publish directory: .next"
echo ""
echo "Option 3: GitHub Pages (Static Export)"
echo "   1. Add to next.config.js: output: 'export'"
echo "   2. Run: npm run build (creates 'out' folder)"
echo "   3. Enable GitHub Pages in repo Settings"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
