# Deploy to LangGraph Cloud - Free Testing

## Why Deploy to LangGraph Cloud?

Your frontend (CopilotKit v1.10.6) expects the **official LangGraph Platform GraphQL API**. Deploying to LangGraph Cloud gives you:

✅ **Native GraphQL API** - No custom code needed
✅ **Free tier** - Perfect for testing
✅ **Proper streaming** - Exactly what your frontend expects
✅ **Built-in monitoring** - See what's happening
✅ **Thread persistence** - Conversation history works automatically

## Quick Deployment Steps

### Step 1: Sign Up for LangSmith (Free)

1. Go to: https://smith.langchain.com/
2. Click "Sign Up" 
3. Create a free account (no credit card needed)
4. You get free tier with limited usage - perfect for testing!

### Step 2: Get Your API Key

1. Once logged in, go to Settings → API Keys
2. Create a new API key
3. Copy it (you'll need it)

### Step 3: Set Up Environment Variables

```bash
cd /root/copilot-kit-poc/project-with-copilotkit/backend

# Add to your .env file (or create new one)
echo "LANGCHAIN_API_KEY=lsv2_pt_your_key_here" >> .env
echo "LANGCHAIN_TRACING_V2=true" >> .env
```

### Step 4: Deploy Your Graph

```bash
cd /root/copilot-kit-poc/project-with-copilotkit/backend

# Deploy to LangGraph Cloud
langgraph deploy
```

Follow the prompts:
- **Project name**: `copilotkit-agentic-chat` (or any name)
- **Confirm deployment**: Yes

### Step 5: Get Your Deployment URL

After deployment succeeds, you'll get a URL like:
```
https://your-deployment.langsmith.app
```

This is your new backend URL!

### Step 6: Update Frontend

Update your frontend to use the deployed URL:

```typescript
// src/AgenticChat.tsx
const runtimeUrl = "https://your-deployment.langsmith.app";
```

Or set environment variable:
```bash
# In your frontend .env
VITE_COPILOT_RUNTIME_URL=https://your-deployment.langsmith.app
```

## Alternative: LangGraph Studio (Local Testing)

If you want to test locally first without deploying:

### Requirements
- Python 3.11+ (you have 3.10, so this won't work)
- Docker Desktop installed

### Commands
```bash
cd /root/copilot-kit-poc/project-with-copilotkit/backend

# Start LangGraph Studio
langgraph dev
```

This starts a local server with the GraphQL API at `http://localhost:8123`

**Note**: This requires Python 3.11+, so deployment to cloud is better for you.

## Deployment Configuration

Your `langgraph.json` is already set up:

```json
{
  "dependencies": ["."],
  "graphs": {
    "agentic_chat": "./agent.py:agentic_chat_graph"
  },
  "env": ".env"
}
```

This tells LangGraph Cloud:
- Graph name: `agentic_chat` (matches your frontend!)
- Graph location: `agent.py:agentic_chat_graph`
- Environment: Load from `.env` file

## Testing After Deployment

Once deployed, test the GraphQL API:

```bash
curl -X POST 'https://your-deployment.langsmith.app/graphql' \
  -H 'content-type: application/json' \
  --data '{
    "query": "mutation { generateCopilotResponse(data: {...}) { ... } }"
  }'
```

Or use the LangSmith dashboard to test it visually!

## Frontend Integration

After deployment, your frontend code stays the same:

```typescript
<CopilotKit
  runtimeUrl="https://your-deployment.langsmith.app"
  showDevConsole={true}
  agent="agentic_chat"
>
  <Chat />
</CopilotKit>
```

The `agent="agentic_chat"` matches the graph name in `langgraph.json`.

## Benefits of LangGraph Cloud

1. **No custom GraphQL server needed** - LangGraph handles it
2. **Proper response format** - Works with CopilotKit out of the box
3. **Monitoring** - See all requests in LangSmith dashboard
4. **Debugging** - Trace every step of the agent
5. **Scaling** - Handles multiple users automatically
6. **Updates** - Deploy new versions easily

## Costs

**Free Tier Includes:**
- 1M LLM tokens per month
- 10K agent executions per month
- Basic monitoring
- Community support

**Perfect for:**
- Development
- Testing
- Small projects
- Demos

## Troubleshooting Deployment

### Error: "Python version incompatible"
**Solution**: LangGraph Cloud handles Python version - just deploy!

### Error: "Missing dependencies"
**Solution**: Make sure `requirements.txt` has all packages:
```txt
langgraph
langchain-openai
langchain-core
python-dotenv
```

### Error: "Graph not found"
**Solution**: Check `langgraph.json` has correct path to graph

### Error: "Authentication failed"
**Solution**: Check your `LANGCHAIN_API_KEY` is correct

## Expected Result

After deployment:
1. ✅ Your graph runs in the cloud
2. ✅ GraphQL API available at deployment URL
3. ✅ Frontend connects and works properly
4. ✅ Streaming responses work
5. ✅ Frontend tools (like `change_background`) work
6. ✅ Conversation history persists

## Monitoring

View your deployments:
1. Go to https://smith.langchain.com/
2. Click "Deployments" in sidebar
3. See your `agentic_chat` deployment
4. Click to see traces, logs, and metrics

## Next Steps

1. **Deploy now**: `langgraph deploy`
2. **Get deployment URL** from output
3. **Update frontend** with new URL
4. **Test in browser** - should work immediately!
5. **Monitor** in LangSmith dashboard

## Compare: Custom vs LangGraph Cloud

| Feature | Custom GraphQL Server | LangGraph Cloud |
|---------|----------------------|-----------------|
| Setup | Complex custom code | One command deploy |
| GraphQL API | Manual implementation | Built-in |
| Streaming | Custom format | Standard |
| Monitoring | None | Full dashboard |
| Debugging | Print statements | Visual traces |
| Scaling | Manual | Automatic |
| Cost | Server costs | Free tier |
| Updates | Redeploy manually | `langgraph deploy` |

## Ready to Deploy?

```bash
cd /root/copilot-kit-poc/project-with-copilotkit/backend

# Make sure you have LANGCHAIN_API_KEY in .env
# Then deploy:
langgraph deploy
```

The deployment will:
1. Package your graph
2. Upload to LangGraph Cloud
3. Start serving GraphQL API
4. Give you a deployment URL

Your frontend will work immediately with the deployment URL! 🚀

