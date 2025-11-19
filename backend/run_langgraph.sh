#!/bin/bash

# Run LangGraph development server for CopilotKit integration
# This provides the GraphQL API that CopilotKit frontend expects

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found"
    echo "Please create .env with your OPENAI_API_KEY"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Run LangGraph development server
# This provides the GraphQL streaming API that CopilotKit expects
echo "Starting LangGraph development server on port 3006..."
echo "Graph: agentic_chat"
echo "Endpoint: http://localhost:3006"
echo ""

langgraph dev --port 3006

