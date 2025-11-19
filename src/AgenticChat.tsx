import React, { useState } from "react";
import "@copilotkit/react-ui/styles.css";
import "./style.css";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useFrontendTool, useHumanInTheLoop } from "@copilotkit/react-core";
import { type GraphData } from "./LineGraph";
import CampaignDaypartingForm from "./components/CampaignDaypartingForm";
import LineGraphWidget from "./components/LineGraphWidget";
import type { CampaignData } from "./components/types";

// Runtime URL - points to your backend
const runtimeUrl = import.meta.env.VITE_COPILOT_RUNTIME_URL || "/cpk/copilotkit";

const AgenticChat: React.FC = () => {
  return (
    <CopilotKit
      runtimeUrl={runtimeUrl}
      showDevConsole={true}
    >
      <Chat />
    </CopilotKit>
  );
};

const Chat = () => {
  const [background, setBackground] = useState<string>(
    "var(--copilot-kit-background-color, #ffffff)"
  );

  // Manual trigger for testing Human-in-the-Loop
  const [manualTrigger, setManualTrigger] = useState(false);

  // State for campaign dayparting
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: "",
    platform: "amazon",
    selectedDays: [] as string[],
    timeSlots: {} as Record<string, string[]>,
  });

  // Register action for AI to call
  useFrontendTool({
    name: "change_background",
    description:
      "Change the background color of the chat. Can be anything that the CSS background attribute accepts. Regular colors, linear or radial gradients etc.",
    parameters: [
      {
        name: "background",
        type: "string",
        description: "The background value. Prefer gradients. Only use when explicitly asked.",
        required: true,
      },
    ],
    handler: async ({ background }) => {
      setBackground(background);
      return `Successfully changed background to: ${background}`;
    },
  });

  // Register action to trigger campaign dayparting setup
  useFrontendTool({
    name: "collect_user_prefs",
    description: "Show an interactive form to set up campaign dayparting with platform selection, day selection, and time slot configuration",
    parameters: [
      {
        name: "reason",
        type: "string",
        description: "Why we're setting up dayparting",
        required: false,
      },
    ],
    handler: async ({ reason: _reason }) => {
      console.log("collect_user_prefs tool called");
      return "__SHOW_PREFERENCE_FORM__";
    },
    render: ({ status, result }) => {
      console.log("collect_user_prefs render called with:", { status, result });

      if (status === "inProgress") {
        return <div className="p-4 border rounded bg-gray-50">Loading preference form...</div>;
      }

      if (status === "complete" && result === "__SHOW_PREFERENCE_FORM__") {
        console.log("Rendering dayparting campaign form");

        return (
          <CampaignDaypartingForm
            campaignData={campaignData}
            setCampaignData={setCampaignData}
            onSubmit={() => {
              console.log("Campaign saved:", campaignData);
              alert(`✅ Campaign "${campaignData.name}" has been successfully added to ${campaignData.platform}!\n\n📅 Days: ${campaignData.selectedDays.join(', ')}\n⏰ Time slots configured for each selected day.`);
            }}
            isHumanInTheLoop={false}
          />
        );
      }

      return <></>;
    }
  });

  // Register action for rendering line graphs
  useFrontendTool({
    name: "render_line_graph",
    description: "Render a line graph using Highcharts. Provide data series with categories and values. Each series should have a name and data array.",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "The title of the graph",
        required: true,
      },
      {
        name: "xAxisCategories",
        type: "string[]",
        description: "Categories for the X-axis (e.g., months, years, etc.)",
        required: true,
      },
      {
        name: "xAxisTitle",
        type: "string",
        description: "Title for the X-axis",
        required: true,
      },
      {
        name: "yAxisTitle",
        type: "string",
        description: "Title for the Y-axis",
        required: true,
      },
      {
        name: "series",
        type: "object[]",
        description: "Array of data series. Each series object must have: name (string) and data (number array). Optional: color (string)",
        required: true,
      },
    ],
    handler: async (params) => {
      // Debug logging - log all parameters
      console.log('render_line_graph called with raw params:', params);
      console.log('render_line_graph called with keys:', Object.keys(params));

      const { title, xAxisCategories, xAxisTitle, yAxisTitle, series } = params;

      // Debug logging
      console.log('render_line_graph called with destructured:', {
        title,
        xAxisCategories,
        xAxisTitle,
        yAxisTitle,
        series,
        seriesType: typeof series,
        seriesIsArray: Array.isArray(series)
      });

      // Validate required parameters
      if (!title || !xAxisCategories || !xAxisTitle || !yAxisTitle) {
        console.error('Missing required parameters:', { title, xAxisCategories, xAxisTitle, yAxisTitle });
        return 'Error: Missing required parameters (title, xAxisCategories, xAxisTitle, yAxisTitle)';
      }

      if (!series) {
        console.error('Series parameter is undefined:', series);
        return 'Error: Series parameter is required and must be an array of data series';
      }

      if (!Array.isArray(series)) {
        console.error('Series parameter is not an array:', series, typeof series);
        return 'Error: Series parameter must be an array of data series';
      }

      if (series.length === 0) {
        console.error('Series parameter is empty array:', series);
        return 'Error: Series parameter must contain at least one data series';
      }

      const graphData: GraphData = {
        title,
        xAxis: {
          categories: xAxisCategories,
          title: xAxisTitle,
        },
        yAxis: {
          title: yAxisTitle,
        },
        series,
      };

      
      return graphData;
    },
    render: ({ args: _args, status, result }) => {
      return <LineGraphWidget data={result} status={status} />;
    }
  });

  useHumanInTheLoop({
    name: "collectUserPreferences",
    description: "Collect detailed preferences from the user",
    parameters: [
      {
        name: "context",
        type: "string",
        description: "Context for why preferences are needed",
        required: true,
      },
      {
        name: "requiredFields",
        type: "string[]",
        description: "Fields to collect",
        required: true,
      },
    ],
    render: ({ args: _args, status, respond }) => {
      console.log("Human-in-the-Loop render called with:", { args: _args, status, respond, manualTrigger });

      // Show campaign form for both AI-triggered execution and manual testing
      if ((status === "executing" && respond) || manualTrigger) {
        console.log("Human-in-the-Loop: showing campaign form");

        return (
          <CampaignDaypartingForm
            campaignData={campaignData}
            setCampaignData={setCampaignData}
            onSubmit={() => {
              if (respond) {
                respond(campaignData);
              } else {
                // Manual trigger case
                console.log("Manual trigger: campaign submitted", campaignData);
                alert(`✅ Campaign "${campaignData.name}" has been successfully added to ${campaignData.platform}!\n\n📅 Days: ${campaignData.selectedDays.join(', ')}\n⏰ Time slots configured for each selected day.`);
                setManualTrigger(false);
              }
            }}
            isHumanInTheLoop={true}
          />
        );
      }

      return <></>;
    },
  });

  return (
    <div
      className="flex flex-col h-full w-full"
      style={{ background }}
    >
      {/* Graph Display Area
      {graphData && (
        <div className="w-full p-4 bg-gray-50 border-b">
          <LineGraph data={graphData} />
        </div>
      )} */}

      {/* Chat Interface */}
      <div className="flex-1 flex justify-center items-center">
        <div className="h-full w-full md:w-8/10 md:h-8/10 rounded-lg">
          <CopilotChat
            className="h-full rounded-2xl max-w-6xl mx-auto"
            labels={{
              title: "Agentic Chat with Charts",
              initial: "Hi! 👋 I'm an AI agent. I can help you create beautiful charts and graphs! How can I assist you today?",
            }}
            instructions="You are a helpful AI assistant. You can chat with users and help them with various tasks. You can render line graphs using Highcharts. When users ask for charts or graphs, use the render_line_graph action with appropriate data. When asked to change the background, use the change_background action. When users mention setting up campaigns, dayparting, scheduling campaigns, platform advertising, or want to configure campaign timing on Amazon/Flipkart/Myntra etc., ALWAYS use the collect_user_prefs tool - this will immediately show an interactive form in the chat where users can set up campaign dayparting with platform selection, day selection, and time slot configuration."
          >
            <div className="p-4">
              <div className="text-sm text-gray-500 mb-2">
                Try asking me to:
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm"
                  onClick={() => {
                    // Test button - functionality can be added later
                  }}
                >
                  🧪 Test Chart (Click to see sample data)
                </button>
                <button
                  className="text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm"
                  onClick={() => {}}
                >
                  📊 Create a sales revenue chart for the last 6 months
                </button>
                <button
                  className="text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-sm"
                  onClick={() => {}}
                >
                  📈 Show me a temperature trend over the seasons
                </button>
                <button
                  className="text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm"
                  onClick={() => {}}
                >
                  💡 Change the background to a beautiful gradient
                </button>
                <button
                  className="text-left px-4 py-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-sm"
                  onClick={() => {}}
                >
                  📉 Create a comparison chart of multiple data series
                </button>
                <button
                  className="text-left px-4 py-2 bg-orange-50 hover:bg-orange-100 rounded-lg text-sm"
                  onClick={() => {
                    // Manual trigger for testing Human-in-the-Loop
                    setManualTrigger(true);
                    console.log("Manual trigger activated for Human-in-the-Loop");
                  }}
                >
                  🎯 [TEST] Manually trigger campaign dayparting form
                </button>
                <button
                  className="text-left px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm"
                  onClick={() => {
                    // This simulates what happens when AI calls collect_user_prefs
                    console.log("Simulating collect_user_prefs tool call");
                    // In a real scenario, the AI would call the tool and it would render
                  }}
                >
                  🚀 Test AI Tool Flow (simulates collect_user_prefs)
                </button>
              </div>
            </div>
          </CopilotChat>
        </div>
      </div>
    </div>
  );
};

export default AgenticChat;