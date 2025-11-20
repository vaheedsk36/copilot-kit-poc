import React from 'react';

export interface PinnedDashboard {
  id: string;
  name: string;
  widgets: unknown[]; // Using unknown for flexibility
  createdAt: Date;
  reportName?: string;
}

export type ViewType = 'assistant' | 'dashboard' | 'dashboard-list' | 'individual-dashboard';

interface LiveboardSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  pinnedDashboards: PinnedDashboard[];
}

const LiveboardSidebar: React.FC<LiveboardSidebarProps> = ({
  currentView,
  onViewChange,
  pinnedDashboards
}) => {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Copilotkit POC</h1>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <button
            onClick={() => onViewChange('assistant')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${
              currentView === 'assistant'
                ? 'bg-blue-100 border border-blue-300 text-blue-700'
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            AI Assistant
          </button>

          <button
            onClick={() => onViewChange('dashboard-list')}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${
              currentView === 'dashboard-list' || currentView === 'individual-dashboard'
                ? 'bg-blue-100 border border-blue-300 text-blue-700'
                : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Dashboards
            {pinnedDashboards.length > 0 && (
              <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {pinnedDashboards.length}
              </span>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default LiveboardSidebar;
