# Node.js CopilotKit Runtime

## ✅ Official CopilotKit Runtime Implementation

This is the **active, production** backend for CopilotKit.

---

## 🚀 Quick Start

```bash
# Install dependencies (if not already)
npm install

# Start the example MCP server (in one terminal)
npm run mcp-server

# Start the main CopilotKit server (in another terminal)
npm start
```

**Servers run on:**
- CopilotKit Runtime: http://localhost:3006
- Example MCP Server: http://localhost:3002

---

## 📦 Dependencies

- `@copilotkit/runtime@^1.3.18` - Official CopilotKit runtime
- `@copilotkit/shared@^1.3.18` - Shared utilities
- `@langchain/core@^0.3.0` - LangChain core
- `@langchain/openai@^0.3.0` - OpenAI integration
- `express@^4.18.2` - Web server
- `dotenv@^16.0.0` - Environment variables
- `openai@^4.0.0` - OpenAI SDK

---

## 🔧 MCP Integration

This server includes MCP (Model Context Protocol) support, allowing you to connect external tools and services.

### Available Tools from Example MCP Server

When the example MCP server is running, the following tools become available to your CopilotKit chat:

- **`create_note`** - Create a new note with title and content
- **`get_notes`** - Retrieve all saved notes
- **`add_todo`** - Add a new todo item
- **`get_todos`** - Get all todo items

### Testing MCP Tools

1. Start both servers:
   ```bash
   # Terminal 1: MCP Server
   npm run mcp-server

   # Terminal 2: CopilotKit Runtime
   npm start
   ```

2. In your CopilotKit chat, try prompts like:
   - "Create a note about today's meeting"
   - "Add a todo to finish the project report"
   - "Show me all my notes"
   - "What are my todos?"

### Adding Your Own MCP Servers

Edit `server.mjs` to add more MCP servers:

```javascript
const mcpServers = [
  { endpoint: "http://localhost:3001" },  // Example server
  { endpoint: "http://localhost:3002" },  // Your custom server
  {
    endpoint: "https://api.example.com/mcp",
    apiKey: process.env.EXAMPLE_API_KEY
  }
];
```

---

## ⚙️ Configuration

### **Environment Variables**

Create a `.env` file in `backend/` (parent directory):
```env
OPENAI_API_KEY=sk-...
PORT=3006
```

### **Server Configuration**

Edit `server.mjs`:
```javascript
const model = new ChatOpenAI({
  model: 'gpt-4o',           // Change model
  temperature: 0.7,          // Adjust creativity
  streaming: true,
});
```

---

## 🎯 Endpoints

### **Health Check**
```
GET http://localhost:3006/health
```

Response:
```json
{
  "status": "ok",
  "message": "CopilotKit Runtime is running"
}
```

### **CopilotKit Runtime**
```
POST http://localhost:3006/copilotkit
```

Used by CopilotKit frontend for AI interactions.

---

## 🔧 Troubleshooting

### **OpenAI API Error**
```
Error: OPENAI_API_KEY is not set
```

**Fix:** Add `OPENAI_API_KEY` to `backend/.env`

### **Port Already in Use**
```
Error: listen EADDRINUSE :::3006
```

**Fix:** Kill process using port or change PORT in .env

### **Module Not Found**
```
Error: Cannot find module '@copilotkit/runtime'
```

**Fix:** Run `npm install`

---

## 📊 Architecture

```
Client (React)
    ↓ GraphQL
Runtime Endpoint (/copilotkit)
    ↓
CopilotRuntime
    ↓
OpenAIAdapter
    ↓
ChatOpenAI (LangChain)
    ↓
OpenAI API (GPT-4o)
```

---

## 🎨 Features

- ✅ Full GraphQL support
- ✅ Streaming responses
- ✅ OpenAI GPT-4o integration
- ✅ CopilotKit actions support
- ✅ CORS enabled
- ✅ Health check endpoint

---

## 🔄 Restart

```bash
# Stop server: Ctrl+C

# Restart
node server.mjs
```

---

## 📝 Logs

Server logs to console. Check for:
- ✅ "CopilotKit Runtime running on port 3006"
- ❌ Any error messages

---

## ✨ This is Production!

Use this for your live application. It's the official, supported way to run CopilotKit with React v1.10.6! 🚀

