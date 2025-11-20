import React, { useState } from "react";
import "@copilotkit/react-ui/styles.css";
import "./style.css";
import ChatbotView from "./components/ChatbotView";
import CanvasView from "./components/Canvas";

const AgenticChat: React.FC = () => {
  return <Chat />;
};

const Chat = () => {
  const [viewMode, setViewMode] = useState<"chatbot" | "canvas">("chatbot");

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      {/* Header with View Selector */}
      <header className="w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">Agentic Chat</h1>
        <div className="flex items-center gap-3">
          <label htmlFor="view-select" className="text-sm font-medium text-gray-700">
            View Mode:
          </label>
          <select
            id="view-select"
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as "chatbot" | "canvas")}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            <option value="chatbot">Chatbot</option>
            <option value="canvas">Canvas</option>
          </select>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {viewMode === "chatbot" ? (
          <ChatbotView />
        ) : (
          <CanvasView />
        )}
      </div>
    </div>
  );
};

export default AgenticChat;