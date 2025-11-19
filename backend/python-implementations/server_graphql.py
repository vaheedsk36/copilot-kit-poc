"""
FastAPI server with GraphQL endpoint for CopilotKit frontend.
This provides the GraphQL streaming API that CopilotKit frontend v1.10.x expects.
"""

import os
import json
import uuid
from typing import Any, Dict, List, AsyncIterator
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from agent import agentic_chat_graph

# Load environment variables
load_dotenv()

app = FastAPI(title="CopilotKit LangGraph GraphQL Runtime")

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
    return {"status": "ok", "message": "CopilotKit LangGraph GraphQL runtime is running"}

@app.get("/copilotkit/")
@app.post("/copilotkit/")
async def copilotkit_graphql(request: Request):
    """
    Handle GraphQL requests from CopilotKit frontend.
    This mimics the LangGraph Platform GraphQL API.
    """
    try:
        body = await request.json()
    except:
        body = None
    
    # Handle GET request or info request
    if request.method == "GET" or not body:
        return {
            "actions": [],
            "agents": [{
                "name": "agentic_chat",
                "description": "A simple agentic chat flow using LangGraph",
                "type": "langgraph"
            }],
            "sdkVersion": "0.1.72"
        }
    
    operation_name = body.get("operationName")
    
    # Handle GraphQL mutation: generateCopilotResponse
    if operation_name == "generateCopilotResponse":
        variables = body.get("variables", {})
        data = variables.get("data", {})
        
        return StreamingResponse(
            generate_copilot_response(data),
            media_type="multipart/mixed; boundary=---",
        )
    
    # Default response
    return {
        "actions": [],
        "agents": [{
            "name": "agentic_chat",
            "description": "A simple agentic chat flow using LangGraph",
            "type": "langgraph"
        }],
        "sdkVersion": "0.1.72"
    }

async def generate_copilot_response(data: Dict[str, Any]) -> AsyncIterator[str]:
    """
    Generate streaming GraphQL response for CopilotKit.
    Mimics the LangGraph Platform API response format.
    """
    thread_id = data.get("threadId", str(uuid.uuid4()))
    messages = data.get("messages", [])
    frontend = data.get("frontend", {})
    frontend_actions = frontend.get("actions", [])
    
    # Convert frontend actions to LangChain tools format
    tools = []
    for action in frontend_actions:
        tool = {
            "name": action["name"],
            "description": action.get("description", ""),
            "type": "function",
            "function": {
                "name": action["name"],
                "description": action.get("description", ""),
                "parameters": json.loads(action.get("jsonSchema", "{}"))
            }
        }
        tools.append(tool)
    
    # Convert messages to LangChain format
    lc_messages = []
    for msg in messages:
        text_msg = msg.get("textMessage", {})
        content = text_msg.get("content", "")
        role = text_msg.get("role", "user")
        
        if role == "system":
            from langchain_core.messages import SystemMessage
            lc_messages.append(SystemMessage(content=content))
        elif role == "user":
            from langchain_core.messages import HumanMessage
            lc_messages.append(HumanMessage(content=content))
        elif role == "assistant":
            from langchain_core.messages import AIMessage
            lc_messages.append(AIMessage(content=content))
    
    # Initial response
    yield "---\n"
    yield f"Content-Type: application/json; charset=utf-8\n\n"
    initial_response = {
        "data": {
            "generateCopilotResponse": {
                "threadId": thread_id,
                "runId": None,
                "extensions": None,
                "__typename": "CopilotResponse",
                "messages": [],
                "metaEvents": []
            }
        },
        "hasNext": True
    }
    yield json.dumps(initial_response) + "\n"
    
    # Agent state message - starting
    yield "---\n"
    yield f"Content-Type: application/json; charset=utf-8\n\n"
    agent_state_msg = {
        "incremental": [{
            "items": [{
                "__typename": "AgentStateMessageOutput",
                "id": f"ck-{uuid.uuid4()}",
                "createdAt": "2025-11-19T15:00:00.000Z",
                "threadId": thread_id,
                "state": json.dumps({"tools": tools}),
                "running": True,
                "agentName": "agentic_chat",
                "nodeName": "chat_node",
                "runId": str(uuid.uuid4()),
                "active": True,
                "role": "assistant"
            }],
            "path": ["generateCopilotResponse", "messages", 0]
        }],
        "hasNext": True
    }
    yield json.dumps(agent_state_msg) + "\n"
    
    try:
        # Invoke the LangGraph agent
        config = {"configurable": {"thread_id": thread_id}}
        input_state = {
            "messages": lc_messages,
            "tools": tools
        }
        
        # Stream the response
        message_idx = 1
        content_parts = []
        
        async for event in agentic_chat_graph.astream(input_state, config):
            # Get the AI message from the event
            if "chat_node" in event:
                node_output = event["chat_node"]
                if "messages" in node_output:
                    ai_messages = node_output["messages"]
                    if isinstance(ai_messages, list):
                        ai_message = ai_messages[-1]
                    else:
                        ai_message = ai_messages
                    
                    # Start text message
                    if not content_parts:
                        message_idx += 1
                        yield "---\n"
                        yield f"Content-Type: application/json; charset=utf-8\n\n"
                        text_msg_start = {
                            "incremental": [{
                                "items": [{
                                    "__typename": "TextMessageOutput",
                                    "id": f"run--{uuid.uuid4()}",
                                    "createdAt": "2025-11-19T15:00:00.000Z",
                                    "role": "assistant",
                                    "parentMessageId": None,
                                    "content": []
                                }],
                                "path": ["generateCopilotResponse", "messages", message_idx]
                            }],
                            "hasNext": True
                        }
                        yield json.dumps(text_msg_start) + "\n"
                    
                    # Stream content
                    content = ai_message.content if hasattr(ai_message, 'content') else str(ai_message)
                    
                    # Split into words for streaming effect
                    words = content.split()
                    for i, word in enumerate(words):
                        content_part = word if i == 0 else f" {word}"
                        content_parts.append(content_part)
                        
                        yield "---\n"
                        yield f"Content-Type: application/json; charset=utf-8\n\n"
                        content_chunk = {
                            "incremental": [{
                                "items": [content_part],
                                "path": ["generateCopilotResponse", "messages", message_idx, "content", len(content_parts) - 1]
                            }],
                            "hasNext": True
                        }
                        yield json.dumps(content_chunk) + "\n"
        
        # Mark message as complete
        if content_parts:
            yield "---\n"
            yield f"Content-Type: application/json; charset=utf-8\n\n"
            msg_complete = {
                "incremental": [{
                    "data": {
                        "__typename": "TextMessageOutput",
                        "status": {
                            "code": "Success",
                            "__typename": "SuccessMessageStatus"
                        }
                    },
                    "path": ["generateCopilotResponse", "messages", message_idx]
                }],
                "hasNext": True
            }
            yield json.dumps(msg_complete) + "\n"
        
        # Final agent state
        message_idx += 1
        yield "---\n"
        yield f"Content-Type: application/json; charset=utf-8\n\n"
        final_state = {
            "incremental": [{
                "items": [{
                    "__typename": "AgentStateMessageOutput",
                    "id": f"ck-{uuid.uuid4()}",
                    "createdAt": "2025-11-19T15:00:00.000Z",
                    "threadId": thread_id,
                    "state": json.dumps({"tools": tools, "messages": [{"role": "user", "content": lc_messages[-1].content if lc_messages else ""}, {"role": "assistant", "content": "".join(content_parts)}]}),
                    "running": True,
                    "agentName": "agentic_chat",
                    "nodeName": "chat_node",
                    "runId": str(uuid.uuid4()),
                    "active": False,
                    "role": "assistant"
                }],
                "path": ["generateCopilotResponse", "messages", message_idx]
            }],
            "hasNext": True
        }
        yield json.dumps(final_state) + "\n"
        
        # Success response
        yield "---\n"
        yield f"Content-Type: application/json; charset=utf-8\n\n"
        success = {
            "incremental": [{
                "data": {
                    "__typename": "CopilotResponse",
                    "status": {
                        "code": "Success",
                        "__typename": "SuccessResponseStatus"
                    }
                },
                "path": ["generateCopilotResponse"]
            }],
            "hasNext": False
        }
        yield json.dumps(success) + "\n"
        yield "-----\n"
        
    except Exception as e:
        # Error response
        yield "---\n"
        yield f"Content-Type: application/json; charset=utf-8\n\n"
        error = {
            "incremental": [{
                "data": {
                    "__typename": "CopilotResponse",
                    "status": {
                        "code": "Failed",
                        "reason": str(e),
                        "__typename": "FailedResponseStatus"
                    }
                },
                "path": ["generateCopilotResponse"]
            }],
            "hasNext": False
        }
        yield json.dumps(error) + "\n"
        yield "-----\n"

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 3006))
    uvicorn.run(
        "server_graphql:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

