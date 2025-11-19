#!/bin/bash

echo "🚀 Setting up CopilotKit Node.js Runtime..."
echo ""

# Stop any running Python servers
echo "1. Stopping old Python servers..."
pkill -f "server_official.py" 2>/dev/null
pkill -f "server_graphql.py" 2>/dev/null
pkill -f "server.py" 2>/dev/null
sleep 2

# Install Node.js dependencies
echo "2. Installing Node.js dependencies..."
cd /root/copilot-kit-poc/project-with-copilotkit/backend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed!"
    echo ""
    echo "3. Starting Node.js CopilotKit Runtime..."
    node server.mjs
else
    echo "❌ npm install failed!"
    echo "Please run manually:"
    echo "  cd /root/copilot-kit-poc/project-with-copilotkit/backend"
    echo "  npm install"
    echo "  node server.mjs"
fi

