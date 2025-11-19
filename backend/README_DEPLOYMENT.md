# LangGraph Agent for CopilotKit

This is a LangGraph agent configured for use with CopilotKit frontend.

## Agent Overview

- **Name**: `agentic_chat`
- **Description**: A simple agentic chat flow using LangGraph
- **Features**: Supports frontend tools via CopilotKit

## Configuration

The agent is configured in `langgraph.json`:
- Graph location: `./agent.py:agentic_chat_graph`
- Environment variables: Loaded from `.env`

## Environment Variables Required

When deploying to LangSmith, set these environment variables:

### Required:
- `OPENAI_API_KEY` - Your OpenAI API key

### Optional (for monitoring):
- `LANGCHAIN_TRACING_V2=true` - Enable tracing
- `LANGCHAIN_PROJECT=copilotkit-agentic-chat` - Project name for traces

## Frontend Integration

This agent works with CopilotKit React frontend (v1.10.x).

Frontend configuration:
```typescript
<CopilotKit
  runtimeUrl="YOUR_LANGSMITH_DEPLOYMENT_URL"
  agent="agentic_chat"
  showDevConsole={true}
>
  <Chat />
</CopilotKit>
```

## Features

- ✅ Supports frontend tools (via `useFrontendTool`)
- ✅ Conversation history with checkpointer
- ✅ Streaming responses
- ✅ Compatible with CopilotKit GraphQL API

## Local Testing

To test locally (requires Python 3.11+):
```bash
langgraph dev --port 8123
```

## Deployment

Deploy to LangSmith Cloud via web interface:
1. Push this code to GitHub
2. Go to https://smith.langchain.com/
3. Create deployment from GitHub repo
4. Set environment variables
5. Get deployment URL

See `../DEPLOY_CORRECT_STEPS.md` for detailed instructions.

