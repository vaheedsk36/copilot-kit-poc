# ✅ Deployment Checklist

Follow this checklist to deploy your LangGraph agent to LangSmith Cloud.

## Pre-Deployment

- [ ] Your agent code is ready (`backend/agent.py`)
- [ ] Configuration file exists (`backend/langgraph.json`)
- [ ] Dependencies listed (`backend/requirements.txt`)
- [ ] `.env` file is NOT committed (in `.gitignore`)
- [ ] You have your OPENAI_API_KEY ready

## GitHub Setup

- [ ] Create GitHub account (if you don't have one)
- [ ] Create new repository on GitHub
- [ ] Configure git locally:
  ```bash
  git config --global user.email "you@example.com"
  git config --global user.name "Your Name"
  ```
- [ ] Run setup script:
  ```bash
  ./setup-github.sh
  ```
- [ ] Add GitHub remote:
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
  ```
- [ ] Push to GitHub:
  ```bash
  git branch -M main
  git push -u origin main
  ```
- [ ] Verify files on GitHub (no `.env` file!)

## LangSmith Setup

- [ ] Go to https://smith.langchain.com/
- [ ] Sign up for free account (no credit card)
- [ ] Click "Deployments" in sidebar
- [ ] Click "+ New Deployment"

### Deployment Configuration

- [ ] Import from GitHub (authorize if first time)
- [ ] Select your repository
- [ ] **Deployment name**: `copilotkit-agentic-chat`
- [ ] **Git branch**: `main`
- [ ] **Config file path**: `backend/langgraph.json`
- [ ] **Auto-deploy on push**: ✅ (optional)
- [ ] **Environment**: `Development` (free tier)

### Environment Variables

- [ ] Add `OPENAI_API_KEY`:
  - Key: `OPENAI_API_KEY`
  - Value: Your actual key
  - Secret: ✅ Checked

- [ ] (Optional) Add `LANGCHAIN_TRACING_V2`:
  - Key: `LANGCHAIN_TRACING_V2`
  - Value: `true`
  - Secret: ❌ Not checked

- [ ] Click "Submit"

## Deployment Wait

- [ ] Wait 10-15 minutes for build
- [ ] Check status: Building → Running
- [ ] Monitor logs for errors
- [ ] Status shows "Running" ✅

## Get Deployment URL

- [ ] Click on your deployment name
- [ ] Copy the API URL (e.g., `https://something-abc123.langsmith.app`)
- [ ] Save this URL - you'll need it for frontend!

## Frontend Update

- [ ] Update frontend with deployment URL:

### Option A: Environment Variable
```bash
# Frontend .env file
VITE_COPILOT_RUNTIME_URL=https://your-deployment-abc123.langsmith.app
```

### Option B: Direct in Code
```typescript
// src/AgenticChat.tsx
const runtimeUrl = "https://your-deployment-abc123.langsmith.app";
```

- [ ] Restart frontend dev server:
  ```bash
  npm run dev
  ```

## Testing

- [ ] Open frontend in browser
- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Open DevTools Console (F12)
- [ ] Type "hi" in chat
- [ ] See streaming response ✅
- [ ] Try: "Change the background to blue"
- [ ] Background changes ✅

## Verification

- [ ] Messages appear in chat UI
- [ ] Responses stream word-by-word
- [ ] Frontend tools work
- [ ] No errors in browser console
- [ ] No errors in LangSmith logs

## Monitoring

- [ ] Go to LangSmith dashboard
- [ ] Click on your deployment
- [ ] View traces of conversations
- [ ] Check for any errors

## Success! 🎉

If all checkboxes are checked, your agent is deployed and working!

## Troubleshooting

### Build Failed
- [ ] Check LangSmith deployment logs
- [ ] Verify `langgraph.json` path is correct
- [ ] Check `requirements.txt` has all dependencies
- [ ] Ensure `OPENAI_API_KEY` is set

### Frontend Not Connecting
- [ ] Verify deployment URL is correct
- [ ] Hard refresh browser
- [ ] Check browser console for errors
- [ ] Verify CORS is working

### No Response in UI
- [ ] Check LangSmith logs for incoming requests
- [ ] Verify agent name matches: `agentic_chat`
- [ ] Test deployment URL with curl
- [ ] Check browser Network tab for response

## Quick Reference

**GitHub Repo**: `https://github.com/YOUR_USERNAME/YOUR_REPO`
**LangSmith**: `https://smith.langchain.com/`
**Deployment URL**: `https://your-deployment-abc123.langsmith.app`
**Agent Name**: `agentic_chat`

## Next Steps After Success

- [ ] Test more complex prompts
- [ ] Add custom tools to agent
- [ ] Monitor usage in LangSmith
- [ ] Share with team
- [ ] Consider upgrading for production use

---

**Estimated Time**: 30-45 minutes total
**Cost**: $0 (Free tier)
**Difficulty**: Easy with this checklist!

Good luck! 🚀

