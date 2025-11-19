/**
 * Example MCP Server for Testing
 * This demonstrates how to create MCP tools that can be used by CopilotKit
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Simple in-memory storage for demonstration
let notes = [];
let todos = [];
let userPreferences = null;

// MCP Server Info
app.get('/mcp/info', (req, res) => {
  res.json({
    name: "example-mcp-server",
    version: "1.0.0",
    capabilities: {
      tools: {}
    }
  });
});

// List available tools
app.get('/mcp/tools', (req, res) => {
  res.json({
    tools: [
      {
        name: "create_note",
        description: "Create a new note with title and content",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title of the note"
            },
            content: {
              type: "string",
              description: "The content of the note"
            }
          },
          required: ["title", "content"]
        }
      },
      {
        name: "get_notes",
        description: "Get all notes",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "add_todo",
        description: "Add a new todo item",
        inputSchema: {
          type: "object",
          properties: {
            task: {
              type: "string",
              description: "The todo task description"
            }
          },
          required: ["task"]
        }
      },
      {
        name: "get_todos",
        description: "Get all todo items",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "collect_user_preferences",
        description: "Trigger collection of user preferences using interactive form. Use this when users want to set or update their preferences.",
        inputSchema: {
          type: "object",
          properties: {
            context: {
              type: "string",
              description: "Context for why preferences are being collected"
            },
            requiredFields: {
              type: "array",
              items: { type: "string" },
              description: "Specific preference fields to collect"
            }
          },
          required: ["context"]
        }
      },
      {
        name: "get_user_preferences",
        description: "Get the current user preferences",
        inputSchema: {
          type: "object",
          properties: {}
        }
      }
    ]
  });
});

// Execute tools
app.post('/mcp/tools/call', async (req, res) => {
  const { name, arguments: args } = req.body;

  try {
    let result;

    switch (name) {
      case 'create_note':
        const note = {
          id: Date.now().toString(),
          title: args.title,
          content: args.content,
          createdAt: new Date().toISOString()
        };
        notes.push(note);
        result = { success: true, note };
        break;

      case 'get_notes':
        result = { notes };
        break;

      case 'add_todo':
        const todo = {
          id: Date.now().toString(),
          task: args.task,
          completed: false,
          createdAt: new Date().toISOString()
        };
        todos.push(todo);
        result = { success: true, todo };
        break;

      case 'get_todos':
        result = { todos };
        break;

      case 'collect_user_preferences':
        // This signals to the AI that it should trigger the Human-in-the-Loop tool
        result = {
          message: "To collect user preferences, I need to show you an interactive form. Let me do that for you.",
          triggerHumanInTheLoop: true,
          context: args.context || "Setting up your preferences",
          requiredFields: args.requiredFields || ["theme", "notifications", "language"]
        };
        break;

      case 'get_user_preferences':
        result = {
          preferences: userPreferences || {
            message: "No preferences set yet. Use 'collect user preferences' to set them."
          }
        };
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`📝 Example MCP Server running on port ${PORT}`);
  console.log(`   Available tools: create_note, get_notes, add_todo, get_todos, collect_user_preferences, get_user_preferences`);
  console.log(`   Use in CopilotKit: { endpoint: "http://localhost:${PORT}" }`);
});
