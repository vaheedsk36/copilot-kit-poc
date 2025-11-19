# Deploy to LangSmith Cloud - Correct Steps

## ✅ Your CLI Version: 0.3.3

With this version, deployment is done through **LangSmith web interface**, not CLI commands.

## Step-by-Step Deployment

### Step 1: Prepare Your Code for Deployment

Your code is already ready! You have:
- ✅ `agent.py` - Your LangGraph agent
- ✅ `langgraph.json` - Configuration file
- ✅ `.env` - Environment variables (keep OPENAI_API_KEY)

### Step 2: Push to GitHub (Required)

LangSmith deploys from GitHub repositories:

```bash
cd /root/copilot-kit-poc/project-with-copilotkit

# Initialize git if not already done
git init

# Add files
git add backend/agent.py backend/langgraph.json backend/requirements.txt

# Commit
git commit -m "Add LangGraph agent for CopilotKit"

# Push to GitHub (create repo first on github.com)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

**Important**: Don't commit `.env` file! Add it to `.gitignore`

### Step 3: Deploy via LangSmith Web Interface

1. **Go to LangSmith**: https://smith.langchain.com/

2. **Sign up** (free account - no credit card needed)

3. **Click "Deployments"** in left sidebar

4. **Click "+ New Deployment"**

5. **Connect GitHub**:
   - Click "Import from GitHub"
   - Authorize LangSmith to access your repos
   - Select your repository

6. **Configure Deployment**:
   - **Name**: `copilotkit-agentic-chat`
   - **Branch**: `main` (or your branch name)
   - **LangGraph config file path**: `backend/langgraph.json`
   - **Auto-deploy**: Enable (optional)
   - **Environment**: Development (free tier)

7. **Add Environment Variables**:
   - Click "Add Environment Variable"
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key
   - Mark as "Secret"

8. **Click "Submit"**

### Step 4: Wait for Deployment

- Deployment takes ~10-15 minutes
- You'll see status: Building → Running
- Once running, you'll get a deployment URL

### Step 5: Get Your API URL

After deployment succeeds:
1. Click on your deployment name
2. Copy the **API URL** (something like `https://your-deployment-abc123.langsmith.app`)

### Step 6: Update Frontend

Update your frontend to use the deployed URL:

```typescript
// src/AgenticChat.tsx
const runtimeUrl = "https://your-deployment-abc123.langsmith.app";
```

Or use environment variable:
```bash
# Frontend .env
VITE_COPILOT_RUNTIME_URL=https://your-deployment-abc123.langsmith.app
```

### Step 7: Test!

Open your frontend and try chatting. It should work immediately!

## Alternative: Use LangGraph Cloud API (No GitHub)

If you don't want to use GitHub, you can use **LangGraph Studio** locally:

### Requirements
- Docker Desktop installed
- Python 3.11+ (you have 3.10, so skip this)

Since you have Python 3.10, **GitHub deployment is your best option**.

## Simpler Alternative: Just Fix the Custom Server

Actually, let me help you fix the custom GraphQL server (`server_graphql.py`) instead. The deployment to cloud takes time and setup. Let me debug why the frontend isn't rendering.

The issue might be that the frontend expects specific message formats. Let me check the actual response your frontend is receiving.

## Quick Debug

Can you:

1. **Open browser DevTools** (F12)
2. **Go to Network tab**
3. **Send a message** in the chat
4. **Find the POST request** to `/cpk/copilotkit/`
5. **Click on it** → **Response tab**
6. **Copy and paste** what you see in the Response

This will tell me exactly what format the frontend is getting vs. what it expects.

## Or: Simple Test

Run this in your browser console (F12 → Console):

```javascript
fetch('https://assistant.stark.dev.1digitalstack.com/cpk/copilotkit/', {
  method: 'POST',
  headers: {'content-type': 'application/json'},
  body: JSON.stringify({
    operationName: 'generateCopilotResponse',
    query: 'mutation generateCopilotResponse($data: GenerateCopilotResponseInput!) { generateCopilotResponse(data: $data) { threadId messages { __typename ... on TextMessageOutput { content } } } }',
    variables: {
      data: {
        agentSession: {agentName: 'agentic_chat'},
        messages: [{id:'test-1',createdAt:'2025-11-19T15:00:00.000Z',textMessage:{content:'hi',role:'user'}}],
        threadId: 'test-thread-123',
        frontend: {actions: []}
      }
    }
  })
}).then(r => r.text()).then(t => console.log(t.substring(0, 2000)))
```

Paste the output here and I can see what's wrong.

## What I Suspect

The custom server might be missing some required GraphQL fields that the frontend expects. Once you show me the actual response, I can fix it in 5 minutes.

## Bottom Line

**Option 1**: Deploy to LangSmith Cloud (proper way, takes time)
- Need to push code to GitHub
- Deploy via web interface
- Get deployment URL
- Update frontend

**Option 2**: Fix custom server (faster)
- Show me actual frontend response
- I fix the format issue
- Works immediately

Which would you prefer?

