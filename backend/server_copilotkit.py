"""
FastAPI server using CopilotKit Python SDK for LangGraph runtime.
This uses the official CopilotKit SDK which handles GraphQL formatting automatically.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from agent import agentic_chat_graph

# Import CopilotKit SDK
try:
    from copilotkit import LangGraphAGUIAgent, CopilotKitRemoteEndpoint
    from copilotkit.integrations.fastapi import add_fastapi_endpoint
    COPILOTKIT_AVAILABLE = True
except ImportError as e:
    print(f"ERROR: CopilotKit Python SDK not installed. Install with: pip install copilotkit")
    print(f"Import error: {e}")
    COPILOTKIT_AVAILABLE = False

# Load environment variables
load_dotenv()

app = FastAPI(title="CopilotKit LangGraph Runtime")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "CopilotKit LangGraph runtime is running"}

if COPILOTKIT_AVAILABLE:
    try:
        # Initialize LangGraph agent using LangGraphAGUIAgent (recommended)
        langgraph_agent = LangGraphAGUIAgent(
            name="agentic_chat",
            description="A simple agentic chat flow using LangGraph",
            graph=agentic_chat_graph,
        )
        
        # Initialize CopilotKit Remote Endpoint (replaces CopilotKitSDK)
        endpoint = CopilotKitRemoteEndpoint(agents=[langgraph_agent])
        
        # Add CopilotKit endpoint to FastAPI app
        # This automatically handles GraphQL formatting
        add_fastapi_endpoint(app, endpoint, "/copilotkit/langgraph")
        
        print("✓ CopilotKit SDK initialized successfully")
        print(f"  Agent name: agentic_chat")
        print(f"  Endpoint: /copilotkit/langgraph")
    except Exception as e:
        print(f"✗ Error initializing CopilotKit SDK: {e}")
        import traceback
        traceback.print_exc()
        COPILOTKIT_AVAILABLE = False
else:
    print("✗ CopilotKit SDK not available")

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 3006))
    uvicorn.run(
        "server_copilotkit:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

