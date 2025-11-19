#!/bin/bash

echo "🔧 Installing Official CopilotKit Python SDK v0.1.72..."

cd /root/copilot-kit-poc/project-with-copilotkit/backend

# Install official requirements
pip3 install copilotkit==0.1.72
pip3 install -r requirements_official.txt

echo "✅ Installation complete!"
echo ""
echo "📋 Now run:"
echo "  cd /root/copilot-kit-poc/project-with-copilotkit/backend"
echo "  python3 server_official.py"
echo ""
echo "🎯 Frontend already configured for v1.3.8!"

