"""
FastAPI server with NDJSON streaming for CopilotKit frontend.
Uses newline-delimited JSON instead of multipart/mixed for better compatibility.
"""

import os
import json
import uuid
from typing import Any, Dict, List
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from agent import agentic_chat_graph
from langchain_core.messages import HumanMessage, AIMessage

# Load environment variables
load_dotenv()

app = FastAPI(title="CopilotKit LangGraph Runtime (NDJSON)")

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
    return {"status": "ok", "message": "CopilotKit LangGraph runtime (NDJSON) is running"}

@app.get("/copilotkit/")
async def copilotkit_info():
    """Return agent info."""
    return {
        "actions": [],
        "agents": [{
            "name": "agentic_chat",
            "description": "A simple agentic chat flow using LangGraph",
            "type": "langgraph"
        }],
        "sdkVersion": "0.1.72"
    }

@app.post("/copilotkit/")
async def copilotkit_stream(request: Request):
    """
    Handle GraphQL streaming requests using NDJSON format.
    Each JSON object is on its own line.
    """
    try:
        body = await request.json()
    except:
        return await copilotkit_info()
    
    operation_name = body.get("operationName")
    
    if operation_name != "generateCopilotResponse":
        return await copilotkit_info()
    
    # Extract data
    variables = body.get("variables", {})
    data = variables.get("data", {})
    thread_id = data.get("threadId", str(uuid.uuid4()))
    messages_input = data.get("messages", [])
    frontend_data = data.get("frontend", {})
    frontend_actions = frontend_data.get("actions", [])
    
    # Parse messages
    lc_messages = []
    for msg in messages_input:
        if "textMessage" in msg:
            text_msg = msg["textMessage"]
            role = text_msg.get("role")
            content = text_msg.get("content", "")
            if role == "user":
                lc_messages.append(HumanMessage(content=content))
            elif role == "assistant":
                lc_messages.append(AIMessage(content=content))
    
    # Parse frontend tools
    tools = []
    for action in frontend_actions:
        tool_def = {
            "name": action.get("name"),
            "description": action.get("description", ""),
            "type": "function",
            "function": {
                "name": action.get("name"),
                "description": action.get("description", ""),
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        }
        
        # Parse parameters
        params = action.get("parameters", [])
        if isinstance(params, list):
            for param in params:
                param_name = param.get("name")
                tool_def["function"]["parameters"]["properties"][param_name] = {
                    "type": param.get("type", "string"),
                    "description": param.get("description", "")
                }
                if param.get("required", False):
                    tool_def["function"]["parameters"]["required"].append(param_name)
        
        tools.append(tool_def)
    
    # Generate NDJSON streaming response
    async def generate_ndjson_stream():
        # 1. Initial response
        yield json.dumps({
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
        }) + "\n"
        
        # 2. Agent state (start)
        yield json.dumps({
            "incremental": [{
                "items": [{
                    "__typename": "AgentStateMessageOutput",
                    "id": f"ck-{uuid.uuid4()}",
                    "createdAt": "2025-11-19T16:00:00.000Z",
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
        }) + "\n"
        
        try:
            # Invoke agent
            config = {"configurable": {"thread_id": thread_id}}
            input_state = {
                "messages": lc_messages,
                "tools": tools
            }
            
            content_parts = []
            message_idx = 1
            
            async for event in agentic_chat_graph.astream(input_state, config):
                if "chat_node" in event:
                    node_output = event["chat_node"]
                    if "messages" in node_output:
                        ai_messages = node_output["messages"]
                        ai_message = ai_messages[-1] if isinstance(ai_messages, list) else ai_messages
                        
                        # Start text message
                        if not content_parts:
                            message_idx += 1
                            yield json.dumps({
                                "incremental": [{
                                    "items": [{
                                        "__typename": "TextMessageOutput",
                                        "id": f"run--{uuid.uuid4()}",
                                        "createdAt": "2025-11-19T16:00:00.000Z",
                                        "role": "assistant",
                                        "parentMessageId": None,
                                        "content": []
                                    }],
                                    "path": ["generateCopilotResponse", "messages", message_idx]
                                }],
                                "hasNext": True
                            }) + "\n"
                        
                        # Stream content word by word
                        content = ai_message.content if hasattr(ai_message, 'content') else str(ai_message)
                        words = content.split()
                        
                        for i, word in enumerate(words):
                            content_part = word if i == 0 else f" {word}"
                            content_parts.append(content_part)
                            
                            yield json.dumps({
                                "incremental": [{
                                    "items": [content_part],
                                    "path": ["generateCopilotResponse", "messages", message_idx, "content", len(content_parts) - 1]
                                }],
                                "hasNext": True
                            }) + "\n"
            
            # Mark message complete
            if content_parts:
                yield json.dumps({
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
                }) + "\n"
            
            # Final agent state
            message_idx += 1
            full_message = "".join(content_parts)
            user_content = lc_messages[-1].content if lc_messages else ""
            
            yield json.dumps({
                "incremental": [{
                    "items": [{
                        "__typename": "AgentStateMessageOutput",
                        "id": f"ck-{uuid.uuid4()}",
                        "createdAt": "2025-11-19T16:00:00.000Z",
                        "threadId": thread_id,
                        "state": json.dumps({
                            "tools": tools,
                            "messages": [
                                {"role": "user", "content": user_content},
                                {"role": "assistant", "content": full_message}
                            ]
                        }),
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
            }) + "\n"
            
            # Success
            yield json.dumps({
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
            }) + "\n"
            
        except Exception as e:
            # Error
            yield json.dumps({
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
            }) + "\n"
    
    return StreamingResponse(
        generate_ndjson_stream(),
        media_type="application/x-ndjson"
    )

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 3006))
    uvicorn.run(
        "server_ndjson:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

