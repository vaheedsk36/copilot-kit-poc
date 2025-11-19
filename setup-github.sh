#!/bin/bash

echo "🚀 Setting up GitHub repository for LangSmith deployment"
echo ""

# Check if git is configured
if ! git config user.email > /dev/null 2>&1; then
    echo "⚠️  Git user not configured. Please run:"
    echo "   git config --global user.email 'you@example.com'"
    echo "   git config --global user.name 'Your Name'"
    exit 1
fi

echo "✓ Git is configured"
echo ""

# Initialize git if not already done
if [ ! -d .git ]; then
    echo "📁 Initializing git repository..."
    git init
    echo "✓ Git initialized"
else
    echo "✓ Git already initialized"
fi

echo ""
echo "📝 Files to commit:"
echo "   - backend/agent.py (LangGraph agent)"
echo "   - backend/langgraph.json (Configuration)"
echo "   - backend/requirements.txt (Dependencies)"
echo "   - backend/README_DEPLOYMENT.md (Documentation)"
echo "   - .gitignore (Git ignore rules)"
echo ""

# Stage files
echo "📦 Staging files..."
git add backend/agent.py
git add backend/langgraph.json
git add backend/requirements.txt
git add backend/README_DEPLOYMENT.md
git add .gitignore

# Check if .env is being ignored
if git check-ignore .env > /dev/null 2>&1; then
    echo "✓ .env file is properly ignored"
else
    echo "⚠️  WARNING: .env might not be ignored!"
fi

echo ""
echo "📸 Creating commit..."
git commit -m "Add LangGraph agent for CopilotKit deployment" 2>/dev/null || echo "✓ Files already committed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Repository prepared for GitHub!"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Run these commands (replace YOUR_USERNAME):"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/copilotkit-agentic-chat.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Then deploy to LangSmith:"
echo "   https://smith.langchain.com/"
echo ""
echo "📖 See GITHUB_SETUP.md for detailed instructions"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

