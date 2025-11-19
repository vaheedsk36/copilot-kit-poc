"""
LangGraph agent implementation for agentic chat.
This matches the TypeScript implementation and supports CopilotKit frontend tools.
"""

import os
from typing import List, Any, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, START, END, MessagesState
from langgraph.types import Command
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class AgentState(MessagesState):
    """
    State of our graph.
    Inherits from MessagesState to get messages management.
    """
    tools: List[Any]


async def chat_node(state: AgentState, config: Optional[RunnableConfig] = None):
    """
    Standard chat node based on the ReAct design pattern. It handles:
    - The model to use (and binds in CopilotKit actions and tools)
    - The system prompt
    - Getting a response from the model
    - Handling tool calls

    For more about the ReAct design pattern, see: 
    https://www.perplexity.ai/search/react-agents-NcXLQhreS0WDzpVaS4m9Cg
    """

    # 1. Define the model
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError(
            "OPENAI_API_KEY environment variable is not set. "
            "Please set it in your .env file or environment."
        )
    
    model = ChatOpenAI(model="gpt-4o", api_key=api_key)

    # Define config for the model
    if config is None:
        config = RunnableConfig(recursion_limit=25)

    # 2. Bind the tools to the model
    # This includes tools from CopilotKit (frontend tools via useFrontendTool)
    model_with_tools = model.bind_tools(
        [
            *state["tools"],
            # Add your custom tools here if needed
        ],
        # 2.1 Disable parallel tool calls to avoid race conditions,
        #     enable this for faster performance if you want to manage
        #     the complexity of running tool calls in parallel.
        parallel_tool_calls=False,
    )

    # 3. Define the system message by which the chat model will be run
    system_message = SystemMessage(
        content="You are a helpful assistant."
    )

    # 4. Run the model to generate a response
    response = await model_with_tools.ainvoke([
        system_message,
        *state["messages"],
    ], config)

    # 5. Return using Command to control flow
    return Command(
        goto=END,
        update={
            "messages": response
        }
    )


# Define the graph
workflow = StateGraph(AgentState)
workflow.add_node("chat_node", chat_node)
workflow.set_entry_point("chat_node")

# Add explicit edges, matching the pattern in other examples
workflow.add_edge(START, "chat_node")
workflow.add_edge("chat_node", END)

# Always use MemorySaver for conversation history
# LangGraph Platform/Studio will use its own checkpointer when deployed
from langgraph.checkpoint.memory import MemorySaver
memory = MemorySaver()
agentic_chat_graph = workflow.compile(checkpointer=memory)

