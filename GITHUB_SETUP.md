# GitHub Setup for LangSmith Deployment

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `copilotkit-agentic-chat` (or any name)
3. Description: "CopilotKit agent using LangGraph"
4. **Keep it Private** (or Public, your choice)
5. **Do NOT initialize** with README/gitignore (we already have them)
6. Click "Create repository"

## Step 2: Push Code to GitHub

Run these commands:

```bash
cd /root/copilot-kit-poc/project-with-copilotkit

# Configure git (if not already done)
git config --global user.email "you@example.com"
git config --global user.name "Your Name"

# Initialize and add files
git init
git add backend/agent.py
git add backend/langgraph.json
git add backend/requirements.txt
git add backend/README_DEPLOYMENT.md
git add .gitignore

# Commit
git commit -m "Add LangGraph agent for CopilotKit deployment"

# Add remote (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR_USERNAME/copilotkit-agentic-chat.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Important**: Replace `YOUR_USERNAME` with your actual GitHub username!

## Step 3: Verify on GitHub

Go to your repository URL and verify you see:
- ✅ `backend/agent.py`
- ✅ `backend/langgraph.json`  
- ✅ `backend/requirements.txt`
- ❌ No `.env` file (should be gitignored)

## Step 4: Deploy to LangSmith

Now that your code is on GitHub:

### 4.1: Go to LangSmith
https://smith.langchain.com/

### 4.2: Sign Up / Sign In
- Free account (no credit card needed)
- Sign in with GitHub (recommended)

### 4.3: Create Deployment

1. Click **"Deployments"** in left sidebar
2. Click **"+ New Deployment"**
3. **Import from GitHub**:
   - If first time: Authorize LangSmith to access your repos
   - Select your repository: `copilotkit-agentic-chat`
   
4. **Configure Deployment**:
   - **Name**: `copilotkit-agentic-chat`
   - **Git branch**: `main`
   - **Config file**: `backend/langgraph.json`
   - **Auto-deploy on push**: ✅ Enable (optional)
   - **Environment**: `Development` (free tier)

5. **Environment Variables**:
   Click "Add Environment Variable":
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `your_actual_openai_api_key_here`
   - **Secret**: ✅ Check this box
   
   Optional (for monitoring):
   - **Key**: `LANGCHAIN_TRACING_V2`
   - **Value**: `true`
   - **Secret**: ❌ Not secret

6. **Click "Submit"**

### 4.4: Wait for Deployment

- Status will show: `Building` → `Running`
- Takes about 10-15 minutes
- Watch the logs for any errors

### 4.5: Get Deployment URL

Once status is **"Running"**:
1. Click on your deployment name
2. Copy the **API URL** (looks like: `https://something-abc123.langsmith.app`)

## Step 5: Update Frontend

Update your frontend to use the deployed URL:

### Option A: Environment Variable (Recommended)
Create/update `.env` in your frontend root:
```bash
VITE_COPILOT_RUNTIME_URL=https://your-deployment-abc123.langsmith.app
```

### Option B: Direct in Code
Update `src/AgenticChat.tsx`:
```typescript
const runtimeUrl = "https://your-deployment-abc123.langsmith.app";
```

### Restart Frontend
```bash
# Stop the dev server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 6: Test!

1. Open your frontend in browser
2. Type "hi" in the chat
3. You should see a streaming response! 🎉

## Troubleshooting

### Build Failed
Check LangSmith deployment logs:
- Click on deployment → "Logs" tab
- Look for error messages
- Common issues:
  - Missing `OPENAI_API_KEY`
  - Wrong path to `langgraph.json`
  - Python dependencies conflict

### Deployment Running but Frontend Not Working
1. Check if you updated the frontend URL correctly
2. Hard refresh browser (Ctrl+Shift+R)
3. Check browser console for errors
4. Verify deployment URL is correct

### "Graph not found" Error
- Check `langgraph.json` path is correct
- Verify graph name matches: `agentic_chat`
- Check `agent.py` exports `agentic_chat_graph`

## Monitoring

View traces and logs:
1. Go to https://smith.langchain.com/
2. Click your deployment
3. See real-time requests, traces, and logs
4. Debug issues easily with visual traces

## Update Deployment

When you make changes:

```bash
# Make changes to agent.py
git add backend/agent.py
git commit -m "Update agent logic"
git push

# LangSmith auto-deploys if you enabled auto-deploy
# Otherwise, manually trigger deployment in LangSmith UI
```

## Expected Result

After successful deployment:
- ✅ Your agent is running in the cloud
- ✅ GraphQL API available at deployment URL
- ✅ Frontend connects and renders responses
- ✅ Streaming works
- ✅ Frontend tools work
- ✅ Conversation history persists

## Next Steps

1. **Test different prompts**
2. **Try the frontend tool**: "Change the background to blue"
3. **Monitor in LangSmith**: See traces of each conversation
4. **Add more features**: Update `agent.py` and push

## Free Tier Limits

LangSmith Free Tier:
- ✅ 1M LLM tokens/month
- ✅ 10K agent executions/month
- ✅ Full monitoring and traces
- ✅ Perfect for development and testing!

## Support

If you encounter issues:
- Check LangSmith documentation: https://docs.smith.langchain.com/
- LangSmith Discord: https://discord.gg/langchain
- GitHub Issues: https://github.com/langchain-ai/langsmith-sdk

---

Ready to deploy? Start with Step 1! 🚀

