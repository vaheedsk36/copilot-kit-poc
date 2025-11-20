import type { GraphData } from '../../../LineGraph';

/**
 * Unified Widget Type System
 * Consolidates all widget-related types for consistency
 */

// Re-export GraphData for convenience
export type { GraphData } from '../../../LineGraph';

// Core widget types
export type WidgetType = 'card' | 'line_chart' | 'bar_chart' | 'pie_chart' | 'table';

// Base widget interface
export interface BaseWidget {
  id: string;
  type: WidgetType;
  title?: string;
  error?: string;
  loading?: boolean;
  position?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  metadata?: {
    createdAt?: Date;
    updatedAt?: Date;
    source?: string;
    refreshInterval?: number;
  };
}

// Widget data types
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
  color?: WidgetColor;
  format?: 'currency' | 'percentage' | 'number' | 'text';
}

export interface TableColumn {
  key: string;
  label: string;
  type?: 'string' | 'number' | 'currency' | 'percentage' | 'date';
  sortable?: boolean;
  width?: number;
}

export interface TableData {
  title: string;
  columns: TableColumn[];
  rows: Record<string, any>[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// Specific widget interfaces
export interface CardWidget extends BaseWidget {
  type: 'card';
  data: MetricCardData;
}

export interface ChartWidget extends BaseWidget {
  type: 'line_chart' | 'bar_chart' | 'pie_chart';
  data: GraphData;
  chartConfig?: {
    height?: number;
    showLegend?: boolean;
    showTooltip?: boolean;
    colors?: string[];
  };
}

export interface TableWidget extends BaseWidget {
  type: 'table';
  data: TableData;
  tableConfig?: {
    striped?: boolean;
    hover?: boolean;
    compact?: boolean;
  };
}

// Union type for all widgets
export type DashboardWidget = CardWidget | ChartWidget | TableWidget;

// Widget rendering props
export interface WidgetRendererProps<T extends DashboardWidget> {
  widget: T;
  className?: string;
  onError?: (error: Error) => void;
  onRefresh?: (widgetId: string) => void;
}

// Widget container props
export interface WidgetContainerProps {
  widgets: DashboardWidget[];
  layout?: 'grid' | 'masonry' | 'flex';
  columns?: number;
  gap?: number;
  className?: string;
}

// Loading states
export interface LoadingWidget {
  id: string;
  type: WidgetType;
  title?: string;
}

// Error states
export interface WidgetError {
  id: string;
  message: string;
  code?: string;
  retryable?: boolean;
}

// Widget themes and colors
export type WidgetColor =
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'red'
  | 'indigo'
  | 'gray';

export interface WidgetTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  border: string;
}

// Widget configuration
export interface WidgetConfig {
  defaultHeight?: number;
  defaultWidth?: number;
  minHeight?: number;
  minWidth?: number;
  maxHeight?: number;
  maxWidth?: number;
  resizable?: boolean;
  draggable?: boolean;
}

// Widget events
export interface WidgetEvents {
  onWidgetClick?: (widget: DashboardWidget) => void;
  onWidgetResize?: (widgetId: string, size: { width: number; height: number }) => void;
  onWidgetMove?: (widgetId: string, position: { x: number; y: number }) => void;
  onWidgetDelete?: (widgetId: string) => void;
  onWidgetRefresh?: (widgetId: string) => void;
}
