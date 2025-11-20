import React, { useState, useEffect } from "react";
import "@copilotkit/react-ui/styles.css";
import "./style.css";
import ChatbotView from "./components/ChatbotView";
import CanvasView from "./components/Canvas";
import LiveboardSidebar, { type PinnedDashboard, type ViewType } from "./components/LiveboardSidebar";
import DashboardRenderer from "./components/DashboardRenderer";

// Simple routing utilities
const getCurrentRoute = () => {
  const hash = window.location.hash.slice(1); // Remove the '#'
  const [path, queryString] = hash.split('?');

  const params = new URLSearchParams(queryString || '');
  const queryParams: Record<string, string> = {};
  for (const [key, value] of params) {
    queryParams[key] = value;
  }

  return { path: path || 'assistant', params: queryParams };
};

const navigateTo = (path: string, params?: Record<string, string>) => {
  let url = `#${path}`;
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }
  window.location.hash = url;
};

// Types for liveboard functionality
interface ParsedDashboard {
  id: string;
  name: string;
  widgets: any[]; // Using any for flexibility with dashboard widgets
  createdAt: string; // Date string from JSON
  reportName?: string;
}

const AgenticChat: React.FC = () => {
  return <Chat />;
};

const Chat = () => {
  // Route state
  const [currentRoute, setCurrentRoute] = useState(() => {
    const route = getCurrentRoute();
    // Default to assistant if no route is set
    if (!window.location.hash || window.location.hash === '#') {
      navigateTo('assistant', { mode: 'chatbot' });
      return { path: 'assistant', params: { mode: 'chatbot' } };
    }
    return route;
  });
  const [pinnedDashboards, setPinnedDashboards] = useState<PinnedDashboard[]>([]);

  // View mode for assistant (chatbot vs canvas) - from URL params
  const [assistantViewMode, setAssistantViewMode] = useState<"chatbot" | "canvas">(
    (currentRoute.params.mode as "chatbot" | "canvas") || "chatbot"
  );

  // Handle route changes
  useEffect(() => {
    const handleHashChange = () => {
      const newRoute = getCurrentRoute();
      setCurrentRoute(newRoute);
      setAssistantViewMode((newRoute.params.mode as "chatbot" | "canvas") || "chatbot");
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Load pinned dashboards from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pinnedDashboards');
      if (saved) {
        const parsed: ParsedDashboard[] = JSON.parse(saved);
        // Convert date strings back to Date objects
        const dashboards: PinnedDashboard[] = parsed.map((dashboard) => ({
          ...dashboard,
          createdAt: new Date(dashboard.createdAt)
        }));
        setPinnedDashboards(dashboards);
      }
    } catch (error) {
      console.error('Failed to load pinned dashboards:', error);
    }
  }, []);

  // Save pinned dashboards to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('pinnedDashboards', JSON.stringify(pinnedDashboards));
    } catch (error) {
      console.error('Failed to save pinned dashboards:', error);
    }
  }, [pinnedDashboards]);

  const handleSidebarViewChange = (view: ViewType) => {
    if (view === 'assistant') {
      navigateTo('assistant', { mode: assistantViewMode });
    } else if (view === 'dashboard-list') {
      navigateTo('dashboards');
    }
  };

  const handleDashboardSelect = (dashboard: PinnedDashboard) => {
    navigateTo('dashboard', { id: dashboard.id });
  };

  const handleAssistantModeChange = (mode: "chatbot" | "canvas") => {
    setAssistantViewMode(mode);
    navigateTo('assistant', { mode });
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      {/* Content Area with Sidebar */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
        {/* Sidebar */}
        <LiveboardSidebar
          currentView={currentRoute.path === 'dashboard' ? 'individual-dashboard' : (currentRoute.path === 'dashboards' ? 'dashboard-list' : 'assistant') as ViewType}
          onViewChange={handleSidebarViewChange}
          pinnedDashboards={pinnedDashboards}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {currentRoute.path === 'dashboard' && currentRoute.params.id ? (
            // Individual Dashboard View
            (() => {
              const dashboard = pinnedDashboards.find(d => d.id === currentRoute.params.id);
              if (!dashboard) {
                return (
                  <div className="flex flex-col h-full">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-800">Dashboard Not Found</h2>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">The requested dashboard could not be found.</p>
                        <button
                          onClick={() => navigateTo('dashboards')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          View All Dashboards
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="flex flex-col h-full">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">{dashboard.name}</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateTo('dashboards')}
                        className="px-3 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        ← Back to Dashboards
                      </button>
                      <button
                        onClick={() => navigateTo('assistant', { mode: 'canvas' })}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create New
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-gray-50">
                    <div className="flex-1 w-full h-full bg-white border-2 border-dashed border-gray-300 rounded-lg m-4 overflow-auto relative">
                      <div className="absolute inset-0 p-8">
                        <div className="space-y-8">
                          {/* Report Header */}
                          <div className="border-b border-gray-200 pb-4 mb-6">
                            <div className="flex items-start justify-between">
                              <div>
                                <h1 className="text-3xl font-bold text-gray-900">{dashboard.reportName || dashboard.name}</h1>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Created at</p>
                                <p className="text-sm font-medium text-gray-700">
                                  {dashboard.createdAt.toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Dashboard Content */}
                          <DashboardRenderer widgets={dashboard.widgets} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : currentRoute.path === 'assistant' ? (
            // Assistant View - show chatbot or canvas with view selector
            <div className="flex flex-col h-full">
      {/* Header with View Selector */}
      <header className="w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
                <h1 className="text-xl font-semibold text-gray-800">AI Assistant</h1>
        <div className="flex items-center gap-3">
          <label htmlFor="view-select" className="text-sm font-medium text-gray-700">
                    Mode:
          </label>
          <select
            id="view-select"
                    value={assistantViewMode}
                    onChange={(e) => handleAssistantModeChange(e.target.value as "chatbot" | "canvas")}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            <option value="chatbot">Chatbot</option>
            <option value="canvas">Canvas</option>
          </select>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {assistantViewMode === "chatbot" ? (
          <ChatbotView />
        ) : (
                  <CanvasView
                    pinnedDashboards={pinnedDashboards}
                    setPinnedDashboards={setPinnedDashboards}
                    onPinDashboard={() => navigateTo('dashboards')}
                  />
        )}
              </div>
            </div>
          ) : currentRoute.path === 'dashboards' ? (
            // Dashboard List View
            <div className="flex flex-col h-full">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">My Dashboards</h2>
                <button
                  onClick={() => navigateTo('assistant', { mode: 'canvas' })}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Dashboard
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                {pinnedDashboards.length === 0 ? (
                  <div className="text-center text-gray-400 mt-20">
                    <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium">No Pinned Dashboards</p>
                    <p className="text-sm mt-2">Create a dashboard in Canvas mode and pin it here</p>
                    <button
                      onClick={() => navigateTo('assistant', { mode: 'canvas' })}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {pinnedDashboards.map((dashboard) => (
                      <div
                        key={dashboard.id}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleDashboardSelect(dashboard)}
                      >
                        <div className="flex">
                          {/* Dashboard Thumbnail/Preview */}
                          <div className="w-48 h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-l-lg flex items-center justify-center border-r border-gray-200">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                              </div>
                              <p className="text-xs text-gray-600 font-medium">Dashboard</p>
                            </div>
                          </div>

                          {/* Dashboard Info */}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">{dashboard.name}</h3>
                                <p className="text-sm text-gray-600 truncate">{dashboard.reportName || 'Dashboard Report'}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPinnedDashboards(prev => prev.filter(d => d.id !== dashboard.id));
                                }}
                                className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-500">
                                {dashboard.createdAt.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>{dashboard.widgets.length} widgets</span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  ID: {dashboard.id.slice(0, 8)}...
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Fallback - redirect to assistant
            <div className="flex flex-col h-full items-center justify-center">
              <p className="text-gray-600">Loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgenticChat;