#!/bin/bash

# Test GraphQL mutation for CopilotKit

curl -X POST 'http://localhost:3006/copilotkit/' \
  -H 'accept: application/graphql-response+json, application/json, text/event-stream' \
  -H 'content-type: application/json' \
  --data-raw '{
    "operationName": "generateCopilotResponse",
    "query": "mutation generateCopilotResponse($data: GenerateCopilotResponseInput!) { generateCopilotResponse(data: $data) { threadId runId messages { __typename ... on TextMessageOutput { id content role } } } }",
    "variables": {
      "data": {
        "agentSession": {
          "agentName": "agentic_chat"
        },
        "agentStates": [],
        "context": [],
        "frontend": {
          "actions": [{
            "name": "change_background",
            "description": "Change the background color of the chat.",
            "jsonSchema": "{\"type\":\"object\",\"properties\":{\"background\":{\"type\":\"string\",\"description\":\"CSS background string\"}},\"required\":[\"background\"]}",
            "available": "enabled"
          }]
        },
        "messages": [
          {
            "id": "test-msg-1",
            "textMessage": {
              "content": "hi",
              "role": "user"
            }
          }
        ],
        "threadId": "test-thread-123"
      }
    }
  }' 2>&1

