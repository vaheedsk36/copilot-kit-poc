"""
FastAPI server for CopilotKit LangGraph runtime.
This server provides the /copilotkit/langgraph endpoint that the frontend expects.
"""

import os
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from dotenv import load_dotenv
from agent import agentic_chat_graph
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.runnables import RunnableConfig
import asyncio
from sse_starlette.sse import EventSourceResponse

# Load environment variables
load_dotenv()

app = FastAPI(title="CopilotKit LangGraph Runtime")

# CORS middleware - allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "CopilotKit LangGraph runtime is running"}


@app.post("/copilotkit/langgraph")
async def copilotkit_langgraph(request: Request):
    """
    Main endpoint for CopilotKit LangGraph runtime.
    This endpoint handles GraphQL requests from the CopilotKit frontend.
    """
    try:
        # Check content type
        content_type = request.headers.get("content-type", "")
        print(f"Content-Type: {content_type}")
        
        # Parse JSON body
        try:
            body = await request.json()
            print(f"Parsed JSON successfully, body keys: {list(body.keys())}")
        except Exception as e:
            # If JSON parsing fails, try to get raw body for debugging
            raw_body = await request.body()
            print(f"JSON decode error: {e}")
            print(f"Raw body (first 500 chars): {raw_body[:500] if raw_body else 'Empty'}")
            return JSONResponse(
                content={"errors": [{"message": f"Invalid JSON: {str(e)}"}]},
                status_code=400
            )
        
        # Extract GraphQL query and variables
        query = body.get("query", "")
        variables = body.get("variables", {})
        operation_name = body.get("operationName", "")
        
        # Log for debugging
        print(f"\n{'='*60}")
        print(f"Received GraphQL request:")
        print(f"  Operation: {operation_name}")
        print(f"  Query preview: {query[:200] if query else 'None'}...")
        print(f"  Variables type: {type(variables)}")
        print(f"  Variables keys: {list(variables.keys()) if isinstance(variables, dict) else 'Not a dict'}")
        if isinstance(variables, dict) and "data" in variables:
            data = variables.get("data", {})
            print(f"  Data keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
            if isinstance(data, dict) and "messages" in data:
                messages = data.get("messages", [])
                print(f"  Messages count: {len(messages)}")
                for i, msg in enumerate(messages):
                    print(f"    Message {i}: {list(msg.keys()) if isinstance(msg, dict) else type(msg)}")
        print(f"{'='*60}\n")
        
        # Handle CopilotKit's generateCopilotResponse mutation
        if operation_name == "generateCopilotResponse" or "generateCopilotResponse" in query:
            return await handle_generate_copilot_response(variables, request)
        # Legacy handlers for other operations
        elif "streamMessages" in query.lower() or operation_name == "StreamMessages":
            return await handle_stream_messages(variables)
        elif "sendMessage" in query.lower() or operation_name == "SendMessage":
            return await handle_send_message(variables)
        else:
            # Default: try to handle as generateCopilotResponse
            return await handle_generate_copilot_response(variables, request)
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error processing request: {e}")
        return JSONResponse(
            content={"errors": [{"message": str(e)}]},
            status_code=500
        )


async def handle_generate_copilot_response(variables: Dict[str, Any], request: Request = None):
    """
    Handle CopilotKit's generateCopilotResponse GraphQL mutation.
    This is the main mutation used by CopilotKit for LangGraph agents.
    """
    try:
        # Validate variables structure
        if not isinstance(variables, dict):
            print(f"ERROR: variables is not a dict, it's {type(variables)}")
            return JSONResponse(
                content={"errors": [{"message": f"Invalid variables format: expected dict, got {type(variables)}"}]},
                status_code=400
            )
        
        # Extract data from nested structure: variables.data
        data = variables.get("data", {})
        
        if not isinstance(data, dict):
            print(f"ERROR: data is not a dict, it's {type(data)}")
            print(f"Variables content: {json.dumps(variables, indent=2)}")
            return JSONResponse(
                content={"errors": [{"message": f"Invalid data format: expected dict, got {type(data)}"}]},
                status_code=400
            )
        
        # Extract thread ID
        thread_id = data.get("threadId", "default")
        run_id = data.get("runId")
        
        # Extract messages from data.messages array
        messages_data = data.get("messages", [])
        
        if not isinstance(messages_data, list):
            print(f"ERROR: messages_data is not a list, it's {type(messages_data)}")
            return JSONResponse(
                content={"errors": [{"message": f"Invalid messages format: expected list, got {type(messages_data)}"}]},
                status_code=400
            )
        
        # Extract agent name
        agent_session = data.get("agentSession", {})
        agent_name = agent_session.get("agentName", "agentic_chat") if isinstance(agent_session, dict) else "agentic_chat"
        
        print(f"Extracted data:")
        print(f"  Thread ID: {thread_id}")
        print(f"  Run ID: {run_id}")
        print(f"  Agent name: {agent_name}")
        print(f"  Messages count: {len(messages_data)}")
        
        # Find the latest user message (skip system messages)
        user_message_content = None
        user_message_id = None
        for i, msg in enumerate(reversed(messages_data)):
            if not isinstance(msg, dict):
                print(f"  Warning: Message {i} is not a dict: {type(msg)}")
                continue
                
            text_msg = msg.get("textMessage", {})
            if text_msg and isinstance(text_msg, dict):
                role = text_msg.get("role", "")
                print(f"  Message {i} role: {role}")
                if role == "user":
                    user_message_content = text_msg.get("content", "")
                    user_message_id = msg.get("id")
                    print(f"  Found user message: {user_message_content[:100]}...")
                    print(f"  User message ID: {user_message_id}")
                    break
        
        if not user_message_content:
            # Log all messages for debugging
            print(f"ERROR: No user message found!")
            print(f"Available messages: {json.dumps(messages_data, indent=2, default=str)}")
            return JSONResponse(
                content={"errors": [{"message": "No user message found in request. Check server logs for details."}]},
                status_code=400
            )
        
        print(f"Processing message for thread {thread_id}, agent {agent_name}")
        print(f"User message: {user_message_content[:100]}...")
        
        # Create a generator for streaming response
        async def event_generator():
            try:
                # Convert message to LangChain format
                human_message = HumanMessage(content=user_message_content)
                
                # Prepare state for the graph
                config = RunnableConfig(
                    configurable={"thread_id": thread_id}
                )
                
                # Stream the response from the graph
                state = {"messages": [human_message]}
                
                # Stream messages from LangGraph
                message_index = 0  # Track message index in the messages array
                full_content = ""
                
                async for chunk in agentic_chat_graph.astream(
                    state,
                    config=config
                ):
                    # Extract the AI message from the chunk
                    if "chat_node" in chunk:
                        messages = chunk["chat_node"].get("messages", [])
                        for msg in messages:
                            if isinstance(msg, AIMessage) and hasattr(msg, "content"):
                                content = msg.content
                                # Ensure content is a string
                                if content is None:
                                    content = ""
                                content = str(content)
                                
                                # Only process if this is new content
                                if content != full_content:
                                    full_content = content
                                    created_at = datetime.utcnow().isoformat() + "Z"
                                    message_id = f"msg-{thread_id}-{int(time.time() * 1000)}"
                                    
                                    # Ensure we have content to stream
                                    if not content.strip():
                                        print(f"WARNING: Empty content received from AI message")
                                        content = " "  # At least send a space to avoid "No Content" error
                                    
                                    # Send initial message with empty content array
                                    yield {
                                        "event": "message",
                                        "data": json.dumps({
                                            "incremental": [{
                                                "items": [{
                                                    "__typename": "TextMessageOutput",
                                                    "id": message_id,
                                                    "createdAt": created_at,
                                                    "role": "assistant",
                                                    "parentMessageId": user_message_id,
                                                    "content": []
                                                }],
                                                "path": ["generateCopilotResponse", "messages", message_index]
                                            }],
                                            "hasNext": True
                                        })
                                    }
                                    
                                    # Stream content incrementally as array items
                                    # Content is sent as individual string items in the content array
                                    # Match the working example: split by spaces, include space before each word (except first)
                                    words = [w for w in content.split(" ") if w]  # Filter out empty strings
                                    for i, word in enumerate(words):
                                        # Add space before word (except first word) - matches working example
                                        content_item = (" " + word) if i > 0 else word
                                        
                                        yield {
                                            "event": "message",
                                            "data": json.dumps({
                                                "incremental": [{
                                                    "items": [content_item],
                                                    "path": ["generateCopilotResponse", "messages", message_index, "content", i]
                                                }],
                                                "hasNext": True
                                            })
                                        }
                                        
                                        # Small delay for streaming effect
                                        await asyncio.sleep(0.05)
                                    
                                    # Send final status update for the message
                                    yield {
                                        "event": "message",
                                        "data": json.dumps({
                                            "incremental": [{
                                                "data": {
                                                    "__typename": "TextMessageOutput",
                                                    "status": {
                                                        "code": "Success",
                                                        "__typename": "SuccessMessageStatus"
                                                    }
                                                },
                                                "path": ["generateCopilotResponse", "messages", message_index]
                                            }],
                                            "hasNext": True
                                        })
                                    }
                                    
                                    message_index += 1
                
                # Send final response status
                yield {
                    "event": "message",
                    "data": json.dumps({
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
                    })
                }
                
            except Exception as e:
                import traceback
                error_msg = str(e)
                traceback.print_exc()
                yield {
                    "event": "error",
                    "data": json.dumps({
                        "errors": [{"message": error_msg}]
                    })
                }
        
        # Use GraphQL incremental delivery format with multipart/mixed
        # This matches CopilotKit's expected format exactly
        async def multipart_generator():
            try:
                # Send initial response
                initial_data = {
                    "data": {
                        "generateCopilotResponse": {
                            "threadId": thread_id,
                            "runId": run_id,
                            "extensions": None,
                            "__typename": "CopilotResponse",
                            "messages": [],
                            "metaEvents": []
                        }
                    },
                    "hasNext": True
                }
                
                # First chunk: initial response
                json_data = json.dumps(initial_data, ensure_ascii=False)
                json_bytes = json_data.encode('utf-8')
                initial_chunk = f"---\nContent-Type: application/json; charset=utf-8\nContent-Length: {len(json_bytes)}\n\n".encode('utf-8') + json_bytes + b"\n"
                print(f"Sending initial chunk: {len(initial_chunk)} bytes")
                yield initial_chunk
                
                # Stream incremental updates
                chunk_count = 0
                async for event in event_generator():
                    if event.get("event") == "message":
                        data = json.loads(event.get("data", "{}"))
                        json_data = json.dumps(data, ensure_ascii=False)
                        json_bytes = json_data.encode('utf-8')
                        chunk_header = f"---\nContent-Type: application/json; charset=utf-8\nContent-Length: {len(json_bytes)}\n\n".encode('utf-8')
                        chunk = chunk_header + json_bytes + b"\n"
                        chunk_count += 1
                        print(f"Sending incremental chunk {chunk_count}: {len(chunk)} bytes, data keys: {list(data.keys())}")
                        if "incremental" in data:
                            for inc in data.get("incremental", []):
                                if "path" in inc:
                                    print(f"  Path: {inc['path']}, has items: {'items' in inc}, has data: {'data' in inc}")
                        yield chunk
                
                # Final boundary
                final_boundary = b"-----\n"
                print(f"Sending final boundary, total chunks: {chunk_count + 1}")
                yield final_boundary
                
            except Exception as e:
                import traceback
                traceback.print_exc()
                print(f"Error in multipart generator: {e}")
        
        # Check accept header - try SSE first as CopilotKit might prefer it
        accept_header = request.headers.get("accept", "") if request else ""
        
        # Always use multipart format since that's what the working example uses
        # But ensure it's properly formatted
        return StreamingResponse(
            multipart_generator(),
            media_type="multipart/mixed; boundary=-",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error handling generateCopilotResponse: {e}")
        return JSONResponse(
            content={"errors": [{"message": str(e)}]},
            status_code=500
        )


async def handle_stream_messages(variables: Dict[str, Any]):
    """
    Handle streaming messages from CopilotKit frontend.
    This creates a streaming response compatible with CopilotKit's GraphQL expectations.
    """
    thread_id = variables.get("threadId", "default")
    message_data = variables.get("message", {})
    
    # Handle both string and object message formats
    if isinstance(message_data, str):
        message_content = message_data
    elif isinstance(message_data, dict):
        message_content = message_data.get("content", "")
    else:
        message_content = str(message_data)
    
    agent_name = variables.get("agent", "agentic_chat")
    
    if not message_content:
        return JSONResponse(
            content={"errors": [{"message": "Message is required"}]},
            status_code=400
        )
    
    # Create a generator for streaming response
    async def event_generator():
        try:
            # Convert message to LangChain format
            human_message = HumanMessage(content=message_content)
            
            # Prepare state for the graph
            config = RunnableConfig(
                configurable={"thread_id": thread_id}
            )
            
            # Get existing state from checkpointer if available
            # The checkpointer maintains conversation history
            # We'll add the new message to the existing state
            state = {"messages": [human_message]}
            
            # Stream the response from the graph
            # The graph will automatically load previous messages from the checkpointer
            last_content = ""
            async for chunk in agentic_chat_graph.astream(
                state,
                config=config
            ):
                # Extract the AI message from the chunk
                if "chat_node" in chunk:
                    messages = chunk["chat_node"].get("messages", [])
                    for msg in messages:
                        if isinstance(msg, AIMessage) and hasattr(msg, "content"):
                            content = msg.content
                            # Stream incremental content
                            if content and content != last_content:
                                # Send incremental update
                                yield {
                                    "event": "message",
                                    "data": json.dumps({
                                        "data": {
                                            "streamMessages": {
                                                "message": {
                                                    "content": content,
                                                    "role": "assistant"
                                                }
                                            }
                                        }
                                    })
                                }
                                last_content = content
            
            # Send completion event
            yield {
                "event": "done",
                "data": json.dumps({"data": {"streamMessages": {"done": True}}})
            }
            
        except Exception as e:
            import traceback
            error_msg = str(e)
            traceback.print_exc()
            yield {
                "event": "error",
                "data": json.dumps({
                    "errors": [{"message": error_msg}]
                })
            }
    
    return EventSourceResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


async def handle_send_message(variables: Dict[str, Any]):
    """
    Handle non-streaming message send.
    """
    thread_id = variables.get("threadId", "default")
    message_data = variables.get("message", {})
    
    # Handle both string and object message formats
    if isinstance(message_data, str):
        message_content = message_data
    elif isinstance(message_data, dict):
        message_content = message_data.get("content", "")
    else:
        message_content = str(message_data)
    
    if not message_content:
        return JSONResponse(
            content={"errors": [{"message": "Message is required"}]},
            status_code=400
        )
    
    try:
        # Convert message to LangChain format
        human_message = HumanMessage(content=message_content)
        
        # Prepare state for the graph
        config = RunnableConfig(
            configurable={"thread_id": thread_id}
        )
        
        # Invoke the graph
        # The graph will automatically load previous messages from the checkpointer
        result = await agentic_chat_graph.ainvoke(
            {"messages": [human_message]},
            config=config
        )
        
        # Extract the response
        messages = result.get("messages", [])
        ai_message = None
        for msg in messages:
            if isinstance(msg, AIMessage):
                ai_message = msg
                break
        
        if ai_message:
            return JSONResponse(content={
                "data": {
                    "sendMessage": {
                        "message": {
                            "content": ai_message.content,
                            "role": "assistant"
                        }
                    }
                }
            })
        else:
            return JSONResponse(
                content={"errors": [{"message": "No response generated"}]},
                status_code=500
            )
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error handling send message: {e}")
        return JSONResponse(
            content={"errors": [{"message": str(e)}]},
            status_code=500
        )


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

