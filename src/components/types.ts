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

export interface LineGraphWidgetProps {
  data: any;
  status: string;
}

// Dashboard Widget Types
export type WidgetType = "line_chart" | "bar_chart" | "pie_chart" | "card" | "table";

export interface MetricCardData {
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

export interface TableColumn {
  key: string;
  label: string;
  type?: "string" | "number" | "currency" | "percentage" | "date";
}

export interface TableData {
  title: string;
  columns: TableColumn[];
  rows: Record<string, any>[];
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  data: any; // GraphData | MetricCardData | TableData
  error?: string; // Error message if widget failed to load
  position?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}
