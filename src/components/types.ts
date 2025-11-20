/**
 * Consolidated Type Definitions
 * Single source of truth for all component types
 */

// Re-export widget types from the new architecture
export type {
  WidgetType,
  DashboardWidget,
  CardWidget,
  ChartWidget,
  TableWidget,
  MetricCardData,
  TableColumn,
  TableData,
  WidgetColor,
  LoadingWidget,
  WidgetError,
  WidgetRendererProps,
  WidgetContainerProps,
  WidgetEvents,
  WidgetConfig,
  WidgetTheme,
} from './widgets';

// Legacy types for backward compatibility (will be deprecated)
export type LegacyWidgetType = "line_chart" | "bar_chart" | "pie_chart" | "card" | "table";

export interface LegacyMetricCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon?: string;
  color?: string;
}

export interface LegacyTableColumn {
  key: string;
  label: string;
  type?: "string" | "number" | "currency" | "percentage" | "date";
}

export interface LegacyTableData {
  title: string;
  columns: LegacyTableColumn[];
  rows: Record<string, any>[];
}

export interface LegacyDashboardWidget {
  id: string;
  type: LegacyWidgetType;
  data: any; // GraphData | LegacyMetricCardData | LegacyTableData
  error?: string; // Error message if widget failed to load
  position?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

// Form-related types
export interface CampaignData {
  name: string;
  platform: string;
  selectedDays: string[];
  timeSlots: Record<string, string[]>;
}

export interface CampaignDaypartingFormProps {
  campaignData: CampaignData;
  setCampaignData: React.Dispatch<React.SetStateAction<CampaignData>>;
  onSubmit: () => void;
  isHumanInTheLoop?: boolean;
}

// Legacy component props (for backward compatibility)
export interface LineGraphWidgetProps {
  data: any;
  status: string;
}

// AI and Chat types
export interface PinnedDashboard {
  id: string;
  name: string;
  widgets: unknown[]; // Using unknown for flexibility
  createdAt: Date;
  reportName?: string;
}

export type ViewType = 'assistant' | 'dashboard' | 'dashboard-list' | 'individual-dashboard';

// Report generation types
export interface TodoItem {
  id: number;
  task: string;
  status: "pending" | "in_progress" | "complete";
  progress: number;
}

export interface ReportStep {
  step: number;
  todoId: number;
  action: string;
  message: string;
  status: "in_progress" | "complete";
  data?: any;
}

export interface ReportData {
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

export interface ReportGenerationWidgetProps {
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
