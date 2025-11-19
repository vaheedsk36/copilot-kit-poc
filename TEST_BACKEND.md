# Test Backend Connectivity

## Quick Test

Run this command to test if the backend is working:

```bash
curl -X POST 'http://localhost:3006/copilotkit/' \
  -H 'content-type: application/json' \
  --data '{"operationName":"generateCopilotResponse","variables":{"data":{"agentSession":{"agentName":"agentic_chat"},"messages":[{"id":"1","textMessage":{"content":"hi","role":"user"}}],"threadId":"test","frontend":{"actions":[]}}}}'
```

You should see streaming JSON responses.

## Test via your domain

```bash
curl -X POST 'https://assistant.stark.dev.1digitalstack.com/cpk/copilotkit/' \
  -H 'content-type: application/json' \
  --data '{"operationName":"generateCopilotResponse","variables":{"data":{"agentSession":{"agentName":"agentic_chat"},"messages":[{"id":"1","textMessage":{"content":"hi","role":"user"}}],"threadId":"test","frontend":{"actions":[]}}}}'
```

## Troubleshooting Frontend Not Rendering

### 1. Check Browser Console

Open browser DevTools (F12) and check:
- Network tab: Do you see requests to `/cpk/copilotkit/`?
- Console tab: Any errors?
- Look for GraphQL errors or CORS issues

### 2. Hard Refresh Frontend

- Chrome/Firefox: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- This clears the cache

### 3. Check Frontend Dev Server

```bash
cd /root/copilot-kit-poc/project-with-copilotkit
npm run dev
```

### 4. Verify Apache Proxy

Your Apache should proxy:
```
/cpk/copilotkit/ → http://localhost:3006/copilotkit/
```

Test it:
```bash
curl -v https://assistant.stark.dev.1digitalstack.com/cpk/copilotkit/
```

Should return the agent info JSON.

### 5. Check Server Logs

```bash
cd /root/copilot-kit-poc/project-with-copilotkit/backend
tail -f server_graphql.log
```

When you send a message from the frontend, you should see POST requests.

### 6. Common Issues

**Issue**: Frontend shows "Hi, I'm an agent. Want to chat?" but doesn't respond
**Solution**: Check if requests are reaching the backend (check logs)

**Issue**: "Network error" or "Failed to fetch"
**Solution**: Check Apache proxy configuration and CORS

**Issue**: Response comes but UI doesn't update
**Solution**: 
- Check browser console for React errors
- Verify CopilotKit version compatibility
- Try hard refresh

**Issue**: Old cached version
**Solution**:
```bash
# Clear browser cache completely
# Or add cache-busting to vite.config.ts
```

## Verify Current Setup

✅ Backend running: `ps aux | grep server_graphql`
✅ Port 3006 listening: `lsof -i :3006`
✅ Health check: `curl http://localhost:3006/health`
✅ GraphQL endpoint: `curl http://localhost:3006/copilotkit/`

## Expected Frontend Behavior

1. You type "hi" in the chat
2. Message appears in the UI
3. AI response streams word-by-word: "How can I assist you today?"
4. You can continue the conversation

## Test Frontend Tool

Try this message:
```
Change the background to linear-gradient(to right, #667eea, #764ba2)
```

The background should change to a purple gradient.

## Debug Mode

Your AgenticChat component has `showDevConsole={true}`, so check the CopilotKit debug console in the UI.

