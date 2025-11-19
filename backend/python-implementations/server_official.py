"""
Official CopilotKit Runtime implementation for LangGraph.
Based on CopilotKit official documentation v0.1.72.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit import CopilotKitRemoteEndpoint, LangGraphAGUIAgent
from agent import agentic_chat_graph
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize CopilotKit agent using LangGraphAGUIAgent (official way)
agent = LangGraphAGUIAgent(
    name="agentic_chat",
    description="A simple agentic chat flow using LangGraph",
    graph=agentic_chat_graph,
)

# Monkey-patch missing dict_repr method (SDK bug workaround)
from copilotkit.langgraph_agent import LangGraphAgent
from copilotkit.agent import Agent

def dict_repr(self):
    """Dict representation of the agent"""
    super_repr = Agent.dict_repr(self)
    return {
        **super_repr,
        'type': 'langgraph'
    }

agent.dict_repr = dict_repr.__get__(agent, type(agent))

# Also ensure execute method exists
if hasattr(LangGraphAgent, 'execute'):
    agent.execute = LangGraphAgent.execute.__get__(agent, type(agent))

# Initialize CopilotKit Remote Endpoint
endpoint = CopilotKitRemoteEndpoint(
    agents=[agent],
)

# Add CopilotKit endpoint
add_fastapi_endpoint(app, endpoint, "/copilotkit")

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3006)

