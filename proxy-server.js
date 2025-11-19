import express from "express";
import fetch from "node-fetch";
import { PassThrough } from "stream";

const app = express();
app.use(express.json({ limit: "10mb" }));

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Proxy server is running" });
});

// Handle all routes - Apache will strip /cpk prefix before forwarding
app.all("*", async (req, res) => {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    // Apache strips /cpk, so we need to add /api prefix
    // If path is /copilotkit/langgraph, it becomes /api/copilotkit/langgraph
    const dojoUrl = req.originalUrl.startsWith("/api") 
      ? req.originalUrl 
      : `/api${req.originalUrl}`;
    const target = `https://dojo.ag-ui.com${dojoUrl}`;

    // Log incoming request
    console.log(`\n[${timestamp}] [${requestId}] 📥 INCOMING REQUEST`);
    console.log(`  Method: ${req.method}`);
    console.log(`  Path: ${req.originalUrl}`);
    console.log(`  Target: ${target}`);
    
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyStr = JSON.stringify(req.body);
      const bodyPreview = bodyStr.length > 500 
        ? bodyStr.substring(0, 500) + `... (${bodyStr.length} chars total)`
        : bodyStr;
      console.log(`  Body: ${bodyPreview}`);
    }

    // Build headers to match browser request exactly
    const headers = {
      // GraphQL accept headers
      accept: "application/graphql-response+json, application/graphql+json, application/json, text/event-stream, multipart/mixed",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,te;q=0.7",
      
      // Cache control
      "cache-control": "no-cache",
      pragma: "no-cache",
      
      // Content type
      "content-type": "application/json",
      
      // Priority
      priority: "u=1, i",
      
      // Browser security headers (mimic Chrome)
      "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      
      // CopilotKit required header
      "x-copilotkit-runtime-client-gql-version": "1.10.6",
      
      // Referer
      Referer: "https://dojo.ag-ui.com/langgraph/feature/agentic_chat?file=agent.py",
      // Referer: "https://dojo.ag-ui.com/langgraph/feature/agentic_generative_ui?file=agent.py",
    };

    // Log outgoing request details
    console.log(`[${timestamp}] [${requestId}] 📤 OUTGOING REQUEST`);
    console.log(`  URL: ${target}`);
    console.log(`  Method: ${req.method}`);
    console.log(`  Headers:`, JSON.stringify(headers, null, 2));

    // 4. Build upstream request
    const requestBody = ["GET", "HEAD"].includes(req.method)
      ? undefined
      : JSON.stringify(req.body);
    
    if (requestBody) {
      const bodyPreview = requestBody.length > 500 
        ? requestBody.substring(0, 500) + `... (${requestBody.length} chars total)`
        : requestBody;
      console.log(`  Request Body: ${bodyPreview}`);
    }

    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: requestBody,
    });

    // Log response
    console.log(`[${timestamp}] [${requestId}] 📥 RESPONSE RECEIVED`);
    console.log(`  Status: ${upstream.status} ${upstream.statusText}`);
    console.log(`  Headers:`, Object.fromEntries(upstream.headers.entries()));

    // 5. Copy status + headers
    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (
        !["transfer-encoding", "content-length", "connection", "set-cookie"].includes(
          key
        )
      ) {
        res.setHeader(key, value);
      }
    });

    // 6. STREAM response properly
    const stream = new PassThrough();
    
    // Log when streaming starts
    console.log(`[${timestamp}] [${requestId}] 🔄 Streaming response to client...`);
    
    upstream.body.pipe(stream);
    stream.pipe(res);
    
    // Log when response is complete
    res.on('finish', () => {
      console.log(`[${new Date().toISOString()}] [${requestId}] ✅ Response completed\n`);
    });
    
  } catch (e) {
    const errorTimestamp = new Date().toISOString();
    console.error(`\n[${errorTimestamp}] [${requestId}] ❌ ERROR`);
    console.error(`  Error: ${e.message}`);
    console.error(`  Stack:`, e.stack);
    console.error(`  Details:`, e);
    res.status(500).json({ error: "proxy failed", details: e.message });
  }
});

app.listen(3006, () =>
  console.log(`Proxy running at http://localhost:3006/cpk/...`)
);
