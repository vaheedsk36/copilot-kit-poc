#!/bin/bash

echo "🔧 Reorganizing backend folder..."
echo ""

cd /root/copilot-kit-poc/project-with-copilotkit/backend

# Create directories
echo "1. Creating directories..."
mkdir -p nodejs-runtime
mkdir -p python-implementations

# Move Node.js files
echo "2. Moving Node.js files..."
mv server.mjs nodejs-runtime/ 2>/dev/null || true
mv package.json nodejs-runtime/ 2>/dev/null || true
mv node_modules nodejs-runtime/ 2>/dev/null || true
mv package-lock.json nodejs-runtime/ 2>/dev/null || true

# Move Python files
echo "3. Moving Python files..."
mv server.py python-implementations/ 2>/dev/null || true
mv server_official.py python-implementations/ 2>/dev/null || true
mv server_graphql.py python-implementations/ 2>/dev/null || true
mv server_manual.py python-implementations/ 2>/dev/null || true
mv server_ndjson.py python-implementations/ 2>/dev/null || true
mv server_graphql_backup.py python-implementations/ 2>/dev/null || true
mv requirements.txt python-implementations/ 2>/dev/null || true
mv requirements_official.txt python-implementations/ 2>/dev/null || true

# Keep shared files in root
echo "4. Keeping shared files in backend root..."
# agent.py, langgraph.json, .env, etc stay in backend/

echo ""
echo "✅ Done! New structure:"
echo ""
echo "backend/"
echo "├── nodejs-runtime/          # Node.js CopilotKit Runtime (CURRENT)"
echo "│   ├── server.mjs"
echo "│   ├── package.json"
echo "│   └── node_modules/"
echo "├── python-implementations/  # Python experiments (NOT USED)"
echo "│   ├── server.py"
echo "│   ├── server_official.py"
echo "│   ├── server_graphql.py"
echo "│   └── requirements.txt"
echo "├── agent.py                 # LangGraph agent (shared)"
echo "├── langgraph.json          # LangGraph config (shared)"
echo "└── .env                    # Environment variables (shared)"
echo ""
echo "🎯 To run the Node.js server:"
echo "   cd /root/copilot-kit-poc/project-with-copilotkit/backend/nodejs-runtime"
echo "   node server.mjs"

