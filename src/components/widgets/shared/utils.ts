import { useMemo } from 'react';
import type {
  DashboardWidget,
  MetricCardData,
  GraphData,
  TableData,
  WidgetColor,
  WidgetType
} from './types';

/**
 * Widget Utility Functions
 * Shared logic for widget operations and data transformations
 */

// Color scheme mappings
export const widgetColorSchemes: Record<WidgetColor, {
  bg: string;
  border: string;
  text: string;
  title: string;
  accent: string;
}> = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-900',
    title: 'text-blue-600',
    accent: 'bg-blue-500',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    border: 'border-green-300',
    text: 'text-green-900',
    title: 'text-green-600',
    accent: 'bg-green-500',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
    border: 'border-purple-300',
    text: 'text-purple-900',
    title: 'text-purple-600',
    accent: 'bg-purple-500',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-900',
    title: 'text-orange-600',
    accent: 'bg-orange-500',
  },
  red: {
    bg: 'bg-gradient-to-br from-red-50 to-red-100',
    border: 'border-red-300',
    text: 'text-red-900',
    title: 'text-red-600',
    accent: 'bg-red-500',
  },
  indigo: {
    bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
    border: 'border-indigo-300',
    text: 'text-indigo-900',
    title: 'text-indigo-600',
    accent: 'bg-indigo-500',
  },
  gray: {
    bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-900',
    title: 'text-gray-600',
    accent: 'bg-gray-500',
  },
};

// Data validation utilities
export function isValidMetricCardData(data: any): data is MetricCardData {
  return data &&
    typeof data.title === 'string' &&
    (typeof data.value === 'string' || typeof data.value === 'number');
}

export function isValidChartData(data: any): data is GraphData {
  return data &&
    data.series &&
    Array.isArray(data.series) &&
    data.series.length > 0 &&
    data.xAxis &&
    data.yAxis;
}

export function isValidTableData(data: any): data is TableData {
  return data &&
    Array.isArray(data.columns) &&
    Array.isArray(data.rows) &&
    data.columns.length > 0;
}

// Fallback data generators
export function createFallbackCardData(title = 'Metric', color: WidgetColor = 'gray'): MetricCardData {
  return {
    title,
    value: 'No data',
    subtitle: 'Data unavailable',
    color,
  };
}

export function createFallbackChartData(title = 'Chart'): GraphData {
  return {
    title,
    xAxis: {
      categories: [],
      title: 'Categories',
    },
    yAxis: {
      title: 'Values',
    },
    series: [{
      name: 'No Data',
      data: [],
      color: '#cccccc',
    }],
  };
}

export function createFallbackTableData(title = 'Table'): TableData {
  return {
    title,
    columns: [
      { key: 'status', label: 'Status' },
    ],
    rows: [
      { status: 'No data available' },
    ],
  };
}

// Widget filtering and grouping utilities
export function groupWidgetsByType(widgets: DashboardWidget[]) {
  return widgets.reduce((groups, widget) => {
    if (!groups[widget.type]) {
      groups[widget.type] = [];
    }
    groups[widget.type].push(widget);
    return groups;
  }, {} as Record<WidgetType, DashboardWidget[]>);
}

export function filterWidgetsByType<T extends DashboardWidget>(
  widgets: DashboardWidget[],
  type: WidgetType
): T[] {
  return widgets.filter(w => w.type === type) as T[];
}

// Data formatting utilities
export function formatWidgetValue(value: any, format?: MetricCardData['format']): string {
  if (value === null || value === undefined) return '-';

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(Number(value));
    case 'percentage':
      return `${Number(value).toFixed(1)}%`;
    case 'number':
      return new Intl.NumberFormat('en-US').format(Number(value));
    default:
      return String(value);
  }
}

// Widget ID generation
export function generateWidgetId(type: WidgetType): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 6);
  return `${type}_${timestamp}_${random}`;
}

// Performance optimization utilities
export function useStableWidgetData(widget: DashboardWidget) {
  return useMemo(() => {
    // Create a stable reference for widget data to prevent unnecessary re-renders
    return {
      ...widget,
      data: { ...widget.data },
      position: widget.position ? { ...widget.position } : undefined,
      metadata: widget.metadata ? { ...widget.metadata } : undefined,
    };
  }, [widget.id, widget.type, widget.error, widget.loading]);
}

// Error handling utilities
export function createWidgetError(message: string, code?: string): Error {
  const error = new Error(message);
  (error as any).code = code;
  return error;
}

export function isRetryableError(error: Error): boolean {
  const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT'];
  return retryableCodes.includes((error as any).code);
}

// Loading state utilities
export function createLoadingWidget(id: string, type: WidgetType, title?: string) {
  return {
    id: `loading_${id}`,
    type,
    title: title || 'Loading...',
    loading: true,
  };
}

// Widget positioning utilities
export function calculateWidgetPosition(
  widgets: DashboardWidget[],
  type: WidgetType,
  preferredPosition?: { x: number; y: number }
) {
  if (preferredPosition) {
    return preferredPosition;
  }

  // Simple grid-based positioning
  const existingWidgets = widgets.filter(w => w.type === type);
  const gridSize = 300; // Approximate widget width
  const maxPerRow = 3;

  const row = Math.floor(existingWidgets.length / maxPerRow);
  const col = existingWidgets.length % maxPerRow;

  return {
    x: col * gridSize,
    y: row * gridSize,
    w: gridSize,
    h: 200, // Default height
  };
}
