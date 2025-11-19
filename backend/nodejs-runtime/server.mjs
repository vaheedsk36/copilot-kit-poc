/**
 * Official CopilotKit Runtime with LangGraph
 * Using @copilotkit/runtime (Node.js) - Compatible with React v1.10.6
 */

import express from 'express';
import {
  CopilotRuntime,
  copilotRuntimeNodeHttpEndpoint
} from '@copilotkit/runtime';
import { OpenAIAdapter } from '@copilotkit/runtime';
import { ChatOpenAI } from '@langchain/openai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

// Simple HTTP-based MCP client for demonstration
class SimpleMCPClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async tools() {
    try {
      const response = await fetch(`${this.endpoint}/mcp/tools`);
      const data = await response.json();

      const tools = {};
      for (const tool of data.tools || []) {
        tools[tool.name] = {
          schema: tool.inputSchema,
          execute: async (params) => {
            const response = await fetch(`${this.endpoint}/mcp/tools/call`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: tool.name,
                arguments: params
              })
            });
            const result = await response.json();
            return result;
          }
        };
      }
      return tools;
    } catch (error) {
      console.error('Failed to fetch MCP tools:', error);
      return {};
    }
  }
}
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS must be before other middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CopilotKit Runtime is running' });
});

// Verify OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in environment variables!');
  process.exit(1);
}

// Initialize OpenAI model with proper configuration
const model = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
  streaming: true,
});

// MCP Server Configuration
const mcpServers = [
  // Example MCP server - start the example-mcp-server.mjs to test
  {
    endpoint: "http://localhost:3002"
  }

  // Add more MCP servers as needed:
  // File System Server: { endpoint: "http://localhost:3002" }
  // Web Search Server: { endpoint: "http://localhost:3003" }
  // Git Server: { endpoint: "http://localhost:3004" }
];

// Create MCP Client function
const createMCPClient = async (config) => {
  return new SimpleMCPClient(config.endpoint);
};

// Initialize CopilotKit Runtime with MCP support
const runtime = new CopilotRuntime({
  mcpServers,
  createMCPClient,
});

// CopilotKit endpoint using official handler
// OpenAIAdapter provides the LLM capabilities
const handler = copilotRuntimeNodeHttpEndpoint({
  endpoint: '/copilotkit',
  runtime,
  serviceAdapter: new OpenAIAdapter(),
});

// Mount the handler
app.use('/copilotkit', handler);

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`✅ CopilotKit Runtime running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Runtime: http://localhost:${PORT}/copilotkit`);
});

