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

// Helper function to simulate async delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Register backend tool for report generation
runtime.addTool({
  name: "generate_report",
  description: "Generate a comprehensive report by creating a todo list, fetching data from multiple sources, processing it, and rendering the final report. This demonstrates a multi-step workflow similar to Cursor's tool call system.",
  parameters: [
    {
      name: "reportType",
      type: "string",
      description: "Type of report to generate (e.g., 'sales', 'analytics', 'performance', 'summary')",
      required: true,
    },
    {
      name: "timeRange",
      type: "string",
      description: "Time range for the report (e.g., 'last 30 days', 'Q1 2024', 'this month')",
      required: false,
    },
  ],
  handler: async ({ reportType, timeRange = "last 30 days" }) => {
    console.log(`📊 Starting report generation: ${reportType} for ${timeRange}`);
    
    // Step 1: Create todo list
    const todoList = [
      { id: 1, task: "Fetch sales data", status: "pending", progress: 0 },
      { id: 2, task: "Fetch user analytics", status: "pending", progress: 0 },
      { id: 3, task: "Fetch performance metrics", status: "pending", progress: 0 },
      { id: 4, task: "Process and aggregate data", status: "pending", progress: 0 },
      { id: 5, task: "Generate insights", status: "pending", progress: 0 },
      { id: 6, task: "Format report", status: "pending", progress: 0 },
    ];

    // Simulate step-by-step execution
    const steps = [];
    
    // Step 1: Fetch sales data
    steps.push({
      step: 1,
      todoId: 1,
      action: "fetching_sales_data",
      message: "Fetching sales data from database...",
      status: "in_progress",
    });
    await delay(800);
    steps.push({
      step: 1,
      todoId: 1,
      action: "fetching_sales_data",
      message: "Sales data fetched successfully",
      status: "complete",
      data: { sales: 125000, transactions: 450, avgOrderValue: 277.78 },
    });
    todoList[0] = { ...todoList[0], status: "complete", progress: 100 };

    // Step 2: Fetch user analytics
    steps.push({
      step: 2,
      todoId: 2,
      action: "fetching_user_analytics",
      message: "Fetching user analytics from analytics service...",
      status: "in_progress",
    });
    await delay(1000);
    steps.push({
      step: 2,
      todoId: 2,
      action: "fetching_user_analytics",
      message: "User analytics fetched successfully",
      status: "complete",
      data: { activeUsers: 1250, newUsers: 180, retentionRate: 0.72 },
    });
    todoList[1] = { ...todoList[1], status: "complete", progress: 100 };

    // Step 3: Fetch performance metrics
    steps.push({
      step: 3,
      todoId: 3,
      action: "fetching_performance_metrics",
      message: "Fetching performance metrics from monitoring system...",
      status: "in_progress",
    });
    await delay(900);
    steps.push({
      step: 3,
      todoId: 3,
      action: "fetching_performance_metrics",
      message: "Performance metrics fetched successfully",
      status: "complete",
      data: { avgResponseTime: 145, uptime: 99.8, errorRate: 0.02 },
    });
    todoList[2] = { ...todoList[2], status: "complete", progress: 100 };

    // Step 4: Process and aggregate data
    steps.push({
      step: 4,
      todoId: 4,
      action: "processing_data",
      message: "Processing and aggregating data...",
      status: "in_progress",
    });
    await delay(1200);
    const processedData = {
      totalRevenue: 125000,
      totalUsers: 1250,
      conversionRate: 0.36,
      growthRate: 0.15,
    };
    steps.push({
      step: 4,
      todoId: 4,
      action: "processing_data",
      message: "Data processing completed",
      status: "complete",
      data: processedData,
    });
    todoList[3] = { ...todoList[3], status: "complete", progress: 100 };

    // Step 5: Generate insights
    steps.push({
      step: 5,
      todoId: 5,
      action: "generating_insights",
      message: "Analyzing data and generating insights...",
      status: "in_progress",
    });
    await delay(1000);
    const insights = [
      "Sales increased by 15% compared to previous period",
      "User retention rate is strong at 72%",
      "Average order value shows positive trend",
      "System performance is excellent with 99.8% uptime",
    ];
    steps.push({
      step: 5,
      todoId: 5,
      action: "generating_insights",
      message: "Insights generated successfully",
      status: "complete",
      data: { insights },
    });
    todoList[4] = { ...todoList[4], status: "complete", progress: 100 };

    // Step 6: Format report
    steps.push({
      step: 6,
      todoId: 6,
      action: "formatting_report",
      message: "Formatting final report...",
      status: "in_progress",
    });
    await delay(600);
    todoList[5] = { ...todoList[5], status: "complete", progress: 100 };

    // Final report
    const report = {
      reportType,
      timeRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue: processedData.totalRevenue,
        totalUsers: processedData.totalUsers,
        conversionRate: processedData.conversionRate,
        growthRate: processedData.growthRate,
      },
      insights,
      todoList,
      steps,
    };

    steps.push({
      step: 6,
      todoId: 6,
      action: "formatting_report",
      message: "Report generated successfully!",
      status: "complete",
      data: report,
    });

    console.log(`✅ Report generation completed: ${reportType}`);
    
    return {
      success: true,
      report,
      message: `Report "${reportType}" has been generated successfully for ${timeRange}`,
    };
  },
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

