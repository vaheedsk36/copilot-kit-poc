"""
FastAPI server using CopilotKit Python SDK for LangGraph runtime.
This uses the official CopilotKit SDK which handles GraphQL formatting automatically.
"""

import os
from fastapi import FastAPI, Request
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

# Set LANGGRAPH_FAST_API to indicate we're running in FastAPI mode
# This tells the agent to use MemorySaver checkpointer
os.environ["LANGGRAPH_FAST_API"] = "true"

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
        
        # Monkey-patch missing methods (workaround for SDK issue)
        # LangGraphAGUIAgent should inherit dict_repr and execute from LangGraphAgent but doesn't
        from copilotkit.langgraph_agent import LangGraphAgent
        from copilotkit.agent import Agent
        
        # Always patch dict_repr to ensure proper type reporting
        def dict_repr(self):
            """Dict representation of the agent"""
            super_repr = Agent.dict_repr(self)
            return {
                **super_repr,
                'type': 'langgraph'
            }
        langgraph_agent.dict_repr = dict_repr.__get__(langgraph_agent, type(langgraph_agent))
        
        # Always patch execute method from LangGraphAgent parent class
        if hasattr(LangGraphAgent, 'execute'):
            langgraph_agent.execute = LangGraphAgent.execute.__get__(langgraph_agent, type(langgraph_agent))
        else:
            print("WARNING: LangGraphAgent.execute not found, this may cause issues")
        
        # Initialize CopilotKit Remote Endpoint (replaces CopilotKitSDK)
        endpoint = CopilotKitRemoteEndpoint(agents=[langgraph_agent])
        
        # Add CopilotKit endpoint to FastAPI app
        # This automatically handles GraphQL formatting
        # The SDK creates a catch-all route at /copilotkit/{path:path}
        add_fastapi_endpoint(app, endpoint, "/copilotkit")
        
        print("✓ CopilotKit SDK initialized successfully")
        print(f"  Agent name: agentic_chat")
        print(f"  Endpoint: /copilotkit")
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
        "server:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

