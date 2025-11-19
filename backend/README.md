# Backend Organization

## 📁 Structure

```
backend/
├── nodejs-runtime/              ✅ CURRENT - Node.js CopilotKit Runtime
│   ├── server.mjs              # Main server (Node.js)
│   ├── package.json            # Node.js dependencies
│   └── node_modules/
│
├── python-implementations/      🗄️ ARCHIVE - Python experiments
│   ├── server.py               # Old Python SDK attempt
│   ├── server_official.py      # Python SDK v0.1.72
│   ├── server_graphql.py       # Custom GraphQL server
│   ├── server_manual.py        # Manual implementation
│   └── requirements.txt        # Python dependencies
│
├── agent.py                     📦 SHARED - LangGraph agent
├── langgraph.json              📦 SHARED - LangGraph config
├── .env                        📦 SHARED - Environment variables
└── README.md                   📄 This file
```

---

## 🚀 Current Active Server

**Node.js Runtime** (`nodejs-runtime/`)

**Why Node.js?**
- ✅ Official @copilotkit/runtime package
- ✅ Compatible with React v1.10.6
- ✅ Full GraphQL support
- ✅ Better streaming
- ✅ Active development

**Start it:**
```bash
cd /root/copilot-kit-poc/project-with-copilotkit/backend/nodejs-runtime
node server.mjs
```

---

## 🗄️ Python Implementations (Archived)

The `python-implementations/` folder contains various Python attempts:

1. **server.py** - Initial CopilotKit Python SDK attempt
2. **server_official.py** - Python SDK v0.1.72 (not compatible with React v1.10.6)
3. **server_graphql.py** - Custom GraphQL server implementation
4. **server_manual.py** - Manual protocol implementation

**Why archived?**
- ❌ Python SDK v0.1.72 is too old for React v1.10.6
- ❌ Custom implementations are harder to maintain
- ❌ Missing features compared to Node.js runtime

**These are kept for reference only.**

---

## 📦 Shared Resources

### **agent.py**
LangGraph agent implementation (for future integration).

### **langgraph.json**
LangGraph configuration file.

### **.env**
Environment variables:
```
OPENAI_API_KEY=sk-...
LANGCHAIN_API_KEY=lsv2_...
LANGSMITH_API_KEY=lsv2_...
```

---

## 🎯 Quick Start

### **1. Start Backend (Node.js)**
```bash
cd /root/copilot-kit-poc/project-with-copilotkit/backend/nodejs-runtime
node server.mjs
```

### **2. Start Frontend**
```bash
cd /root/copilot-kit-poc/project-with-copilotkit
npm run dev
```

### **3. Test**
Open: https://assistant.stark.dev.1digitalstack.com/

---

## 🔧 Reorganize Script

To reorganize the backend folder:
```bash
bash /root/copilot-kit-poc/project-with-copilotkit/REORGANIZE_BACKEND.sh
```

This will move files into the proper structure.

---

## 📚 Documentation

- **Node.js Runtime**: See `nodejs-runtime/README.md`
- **Setup Guide**: See `/root/copilot-kit-poc/project-with-copilotkit/FINAL_INSTRUCTIONS.md`
- **Frontend Config**: See `src/AgenticChat.tsx`

---

## ✨ Summary

**Active:** Node.js runtime in `nodejs-runtime/`
**Archived:** Python implementations in `python-implementations/`
**Shared:** agent.py, langgraph.json, .env in `backend/`

**Use Node.js runtime for production!** 🚀
