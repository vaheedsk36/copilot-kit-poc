import React from "react";

interface TodoItem {
  id: number;
  task: string;
  status: "pending" | "in_progress" | "complete";
  progress: number;
}

interface ReportStep {
  step: number;
  todoId: number;
  action: string;
  message: string;
  status: "in_progress" | "complete";
  data?: any;
}

interface ReportData {
  reportType: string;
  timeRange: string;
  generatedAt: string;
  summary: {
    totalRevenue: number;
    totalUsers: number;
    conversionRate: number;
    growthRate: number;
  };
  insights: string[];
  todoList: TodoItem[];
  steps: ReportStep[];
}

interface ReportGenerationWidgetProps {
  status: "inProgress" | "complete" | "error" | "executing";
  result?: {
    success: boolean;
    report: ReportData;
    message: string;
  };
  args?: {
    reportType?: string;
    timeRange?: string;
  };
}

const ReportGenerationWidget: React.FC<ReportGenerationWidgetProps> = ({
  status,
  result,
  args,
}) => {
  if (status === "inProgress" || status === "executing") {
    return (
      <div className="p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <h3 className="text-lg font-semibold text-gray-800">
            Generating Report...
          </h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          {args?.reportType ? `Creating ${args.reportType} report` : "Preparing your report"}
          {args?.timeRange && ` for ${args.timeRange}`}
        </p>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded-full border-2 border-blue-300 flex items-center justify-center">
                {step <= 3 && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                )}
              </div>
              <span className="text-gray-600">
                {step === 1 && "Creating todo list..."}
                {step === 2 && "Fetching data..."}
                {step === 3 && "Processing data..."}
                {step === 4 && "Generating insights..."}
                {step === 5 && "Formatting report..."}
                {step === 6 && "Finalizing..."}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === "complete" && result?.report) {
    const { report } = result;
    const completedTodos = report.todoList.filter((t) => t.status === "complete").length;
    const totalTodos = report.todoList.length;

    return (
      <div className="p-6 border rounded-lg bg-white border-gray-200 shadow-lg">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-bold text-gray-900">
              📊 {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)} Report
            </h3>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✅ Complete
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Generated for {report.timeRange} • {new Date(report.generatedAt).toLocaleString()}
          </p>
        </div>

        {/* Todo List Progress */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Execution Steps ({completedTodos}/{totalTodos} completed)
          </h4>
          <div className="space-y-2">
            {report.todoList.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  {todo.status === "complete" ? (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  ) : todo.status === "in_progress" ? (
                    <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm ${
                        todo.status === "complete"
                          ? "text-gray-700 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {todo.task}
                    </span>
                    {todo.status === "complete" && (
                      <span className="text-xs text-green-600 font-medium">✓ Done</span>
                    )}
                  </div>
                  {todo.status === "in_progress" && (
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${todo.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-sm text-blue-600 font-medium mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-blue-900">
              ${report.summary.totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="text-sm text-purple-600 font-medium mb-1">Total Users</div>
            <div className="text-2xl font-bold text-purple-900">
              {report.summary.totalUsers.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="text-sm text-green-600 font-medium mb-1">Conversion Rate</div>
            <div className="text-2xl font-bold text-green-900">
              {(report.summary.conversionRate * 100).toFixed(1)}%
            </div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
            <div className="text-sm text-orange-600 font-medium mb-1">Growth Rate</div>
            <div className="text-2xl font-bold text-orange-900">
              {(report.summary.growthRate * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Insights</h4>
          <div className="space-y-2">
            {report.insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-100"
              >
                <span className="text-yellow-600 mt-0.5">💡</span>
                <span className="text-sm text-gray-700">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tool Call Steps (for debugging/transparency) */}
        <details className="mt-4">
          <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-800">
            View Tool Call Steps ({report.steps.length} steps)
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {report.steps.map((step, index) => (
                <div
                  key={index}
                  className="text-xs p-2 bg-white rounded border border-gray-200"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-gray-500">Step {step.step}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        step.status === "complete"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                  <div className="text-gray-700">{step.message}</div>
                  {step.data && (
                    <div className="mt-1 text-gray-500 font-mono text-xs">
                      {JSON.stringify(step.data, null, 2).slice(0, 100)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-4 border rounded-lg bg-red-50 border-red-200">
        <div className="flex items-center gap-2 text-red-800">
          <span>❌</span>
          <span className="font-medium">Error generating report</span>
        </div>
        {result && (
          <p className="mt-2 text-sm text-red-600">{JSON.stringify(result)}</p>
        )}
      </div>
    );
  }

  return null;
};

export default ReportGenerationWidget;

