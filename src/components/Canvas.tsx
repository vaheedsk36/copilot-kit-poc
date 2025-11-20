import React, { useState, useRef, useMemo, useCallback, startTransition, useDeferredValue } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotKit, useFrontendTool } from "@copilotkit/react-core";
import { type GraphData } from "../LineGraph";
import ChartWidget, { type ChartType } from "./ChartWidget";
import MetricCard from "./MetricCard";
import DataTable from "./DataTable";
import { SkeletonCard, SkeletonChart, SkeletonTable } from "./SkeletonLoader";
import type { DashboardWidget, MetricCardData, TableData, WidgetType } from "./types";
import type { PinnedDashboard } from "./LiveboardSidebar";

// Runtime URL - points to your backend
const runtimeUrl = import.meta.env.VITE_COPILOT_RUNTIME_URL || "/cpk/copilotkit";

// Types for liveboard functionality
interface CanvasContentProps {
  pinnedDashboards: PinnedDashboard[];
  setPinnedDashboards: React.Dispatch<React.SetStateAction<PinnedDashboard[]>>;
  onPinDashboard: () => void;
}

interface CanvasViewProps {
  pinnedDashboards: PinnedDashboard[];
  setPinnedDashboards: React.Dispatch<React.SetStateAction<PinnedDashboard[]>>;
  onPinDashboard: () => void;
}

// Individual memoized widget components that only re-render when their specific data changes
const MemoizedMetricCard = React.memo(MetricCard, (prevProps, nextProps) => {
  // Deep comparison of card data - return true if props are equal (no re-render needed)
  const prev = prevProps.data;
  const next = nextProps.data;
  if (!prev || !next) return prev === next;

  return prev.title === next.title &&
         prev.value === next.value &&
         prev.subtitle === next.subtitle &&
         prev.icon === next.icon &&
         prev.color === next.color &&
         prev.trend?.value === next.trend?.value &&
         prev.trend?.isPositive === next.trend?.isPositive &&
         prev.trend?.label === next.trend?.label;
});

// Fallback empty data for different widget types
const createFallbackCardData = (title: string = "Metric"): MetricCardData => ({
  title: title || "Metric",
  value: "No data",
  subtitle: "Data unavailable",
  color: "gray"
});

const createFallbackChartData = (title: string = "Chart"): GraphData => ({
  title: title || "Chart",
  xAxis: {
    categories: [],
    title: "Categories"
  },
  yAxis: {
    title: "Values"
  },
  series: [{
    name: "No Data",
    data: [],
    color: "#cccccc"
  }]
});

const createFallbackTableData = (title: string = "Table"): TableData => ({
  title: title || "Table",
  columns: [
    { key: "status", label: "Status" }
  ],
  rows: [
    { status: "No data available" }
  ]
});

const MemoizedChartWidget = React.memo(ChartWidget, (prevProps, nextProps) => {
  // Only re-render if chart data actually changed - return true if props are equal
  if (prevProps.chartType !== nextProps.chartType) return false;
  if (!prevProps.data || !nextProps.data) return prevProps.data === nextProps.data;
  if (prevProps.data.title !== nextProps.data.title) return false;
  
  // Compare series data
  const prevSeries = prevProps.data.series;
  const nextSeries = nextProps.data.series;
  if (!prevSeries || !nextSeries) return prevSeries === nextSeries;
  if (prevSeries.length !== nextSeries.length) return false;
  
  for (let i = 0; i < prevSeries.length; i++) {
    if (prevSeries[i].name !== nextSeries[i].name) return false;
    const prevData = prevSeries[i].data;
    const nextData = nextSeries[i].data;
    if (prevData.length !== nextData.length) return false;
    for (let j = 0; j < prevData.length; j++) {
      if (prevData[j] !== nextData[j]) return false;
    }
  }
  
  // Compare categories
  const prevCategories = prevProps.data.xAxis?.categories || [];
  const nextCategories = nextProps.data.xAxis?.categories || [];
  if (prevCategories.length !== nextCategories.length) return false;
  for (let i = 0; i < prevCategories.length; i++) {
    if (prevCategories[i] !== nextCategories[i]) return false;
  }
  
  return true; // No re-render needed
});

const MemoizedDataTable = React.memo(DataTable, (prevProps, nextProps) => {
  // Only re-render if table data actually changed - return true if props are equal
  if (!prevProps.data || !nextProps.data) return prevProps.data === nextProps.data;
  if (prevProps.data.title !== nextProps.data.title) return false;
  if (prevProps.data.columns.length !== nextProps.data.columns.length) return false;
  if (prevProps.data.rows.length !== nextProps.data.rows.length) return false;
  
  // Deep comparison of columns
  const prevCols = prevProps.data.columns;
  const nextCols = nextProps.data.columns;
  for (let i = 0; i < prevCols.length; i++) {
    if (prevCols[i].key !== nextCols[i].key || prevCols[i].label !== nextCols[i].label) {
      return false;
    }
  }
  
  // Deep comparison of rows
  const prevRows = prevProps.data.rows;
  const nextRows = nextProps.data.rows;
  for (let i = 0; i < prevRows.length; i++) {
    const prevRow = prevRows[i];
    const nextRow = nextRows[i];
    const keys = Object.keys(prevRow);
    if (keys.length !== Object.keys(nextRow).length) return false;
    for (const key of keys) {
      if (prevRow[key] !== nextRow[key]) return false;
    }
  }
  
  return true; // No re-render needed
});

// Memoized widget slot components that only re-render when their specific widget changes
const CardSlot: React.FC<{ card?: DashboardWidget; loadingCard?: { id: string; type: WidgetType }; index: number }> = React.memo(({ card, loadingCard, index }) => {
  if (loadingCard) {
    return <SkeletonCard key={loadingCard.id} />;
  }
  if (card) {
    return <MemoizedMetricCard key={card.id} data={card.data as MetricCardData} />;
  }
  return <div key={`empty-card-${index}`} />;
}, (prevProps, nextProps) => {
  // Only re-render if the card object reference or loading state changed
  // Use object reference equality for widgets (same widget object = no re-render)
  if (prevProps.card !== nextProps.card) {
    // If references differ, check if it's the same widget by ID
    if (prevProps.card?.id !== nextProps.card?.id) return false;
    // Same ID but different reference - could be a new object with same data
    // Let the child component's memo handle the deep comparison
  }
  if (prevProps.loadingCard !== nextProps.loadingCard) {
    if (prevProps.loadingCard?.id !== nextProps.loadingCard?.id) return false;
  }
  
  return true; // No re-render needed - same widget references
});

const ChartSlot: React.FC<{ chart?: DashboardWidget; loadingChart?: { id: string; type: WidgetType }; chartType: ChartType; slotKey: string }> = React.memo(({ chart, loadingChart, chartType, slotKey }) => {
  if (loadingChart) {
    return <SkeletonChart key={`loading-${slotKey}`} />;
  }
  if (chart) {
    return <MemoizedChartWidget key={chart.id} data={chart.data as GraphData} chartType={chartType} />;
  }
  return <div key={`empty-${slotKey}`} />;
}, (prevProps, nextProps) => {
  // Only re-render if the chart object reference or loading state changed
  if (prevProps.chart !== nextProps.chart) {
    if (prevProps.chart?.id !== nextProps.chart?.id) return false;
    // Same ID but different reference - let child component handle deep comparison
  }
  if (prevProps.loadingChart !== nextProps.loadingChart) {
    if (prevProps.loadingChart?.id !== nextProps.loadingChart?.id) return false;
  }
  if (prevProps.chartType !== nextProps.chartType) return false;
  
  return true; // No re-render needed
});

const TableSlot: React.FC<{ table?: DashboardWidget; loadingTable?: { id: string; type: WidgetType } }> = React.memo(({ table, loadingTable }) => {
  if (loadingTable) {
    return <SkeletonTable key="loading-table" />;
  }
  if (table) {
    return <MemoizedDataTable key={table.id} data={table.data as TableData} />;
  }
  return <div key="empty-table" />;
}, (prevProps, nextProps) => {
  // Only re-render if the table object reference or loading state changed
  if (prevProps.table !== nextProps.table) {
    if (prevProps.table?.id !== nextProps.table?.id) return false;
    // Same ID but different reference - let child component handle deep comparison
  }
  if (prevProps.loadingTable !== nextProps.loadingTable) {
    if (prevProps.loadingTable?.id !== nextProps.loadingTable?.id) return false;
  }
  
  return true; // No re-render needed
});

CardSlot.displayName = 'CardSlot';
ChartSlot.displayName = 'ChartSlot';
TableSlot.displayName = 'TableSlot';

// Memoized dashboard content component to prevent unnecessary re-renders
const DashboardContent: React.FC<{
  dashboardWidgets: DashboardWidget[];
  loadingWidgets: Map<string, { type: WidgetType; title?: string }>;
}> = React.memo(({ dashboardWidgets, loadingWidgets }) => {
  // Create a stable Map of widgets by ID for O(1) lookup with fallback data
  const widgetsById = useMemo(() => {
    const map = new Map<string, DashboardWidget>();
    dashboardWidgets.forEach(w => {
      let processedWidget = w;

      // If widget has error or invalid data, create fallback
      if (w.error) {
        // Create fallback widget with same ID but valid fallback data
        processedWidget = {
          ...w,
          error: undefined, // Remove error flag
          data: w.type === 'card'
            ? createFallbackCardData((w.data as MetricCardData)?.title)
            : w.type === 'table'
            ? createFallbackTableData((w.data as TableData)?.title)
            : createFallbackChartData((w.data as GraphData)?.title)
        };
      } else if (w.type === 'line_chart' || w.type === 'bar_chart' || w.type === 'pie_chart') {
        // Validate chart data
        const chartData = w.data as GraphData;
        if (!chartData || !chartData.series || !Array.isArray(chartData.series) || chartData.series.length === 0) {
          // Create fallback chart data
          processedWidget = {
            ...w,
            data: createFallbackChartData(chartData?.title || 'Chart')
          };
        }
      } else if (w.type === 'card') {
        // Validate card data
        const cardData = w.data as MetricCardData;
        if (!cardData || !cardData.title || !cardData.value) {
          processedWidget = {
            ...w,
            data: createFallbackCardData(cardData?.title)
          };
        }
      } else if (w.type === 'table') {
        // Validate table data
        const tableData = w.data as TableData;
        if (!tableData || !tableData.columns || !tableData.rows) {
          processedWidget = {
            ...w,
            data: createFallbackTableData(tableData?.title)
          };
        }
      }

      map.set(w.id, processedWidget);
    });
    return map;
  }, [dashboardWidgets]);
  
  // Get widget IDs as a stable string for comparison
  const widgetIdsString = useMemo(() => {
    return Array.from(widgetsById.keys()).sort().join(',');
  }, [widgetsById]);
  
  // Separate widgets by type - memoized with stable references
  const widgetGroups = useMemo(() => {
    const widgets = Array.from(widgetsById.values());
    // All widgets in the map are now valid (with fallback data if needed)
    const cards = widgets.filter(w => w.type === 'card').slice(0, 3);
    const lineCharts = widgets.filter(w => w.type === 'line_chart');
    const barCharts = widgets.filter(w => w.type === 'bar_chart');
    const pieCharts = widgets.filter(w => w.type === 'pie_chart');
    const tables = widgets.filter(w => w.type === 'table');

    return { cards, lineCharts, barCharts, pieCharts, tables };
  }, [widgetIdsString, widgetsById]);
  
  // Get loading widgets - memoized with stable references
  const loadingGroups = useMemo(() => {
    const widgetIds = new Set(widgetsById.keys());
    const loadingCards = Array.from(loadingWidgets.entries())
      .filter(([id, meta]) => meta.type === 'card' && !widgetIds.has(id))
      .map(([id, meta]) => ({ id, type: meta.type }));
    const loadingLineCharts = Array.from(loadingWidgets.entries())
      .filter(([id, meta]) => meta.type === 'line_chart' && !widgetIds.has(id))
      .map(([id, meta]) => ({ id, type: meta.type }));
    const loadingBarCharts = Array.from(loadingWidgets.entries())
      .filter(([id, meta]) => meta.type === 'bar_chart' && !widgetIds.has(id))
      .map(([id, meta]) => ({ id, type: meta.type }));
    const loadingPieCharts = Array.from(loadingWidgets.entries())
      .filter(([id, meta]) => meta.type === 'pie_chart' && !widgetIds.has(id))
      .map(([id, meta]) => ({ id, type: meta.type }));
    const loadingTables = Array.from(loadingWidgets.entries())
      .filter(([id, meta]) => meta.type === 'table' && !widgetIds.has(id))
      .map(([id, meta]) => ({ id, type: meta.type }));

    return { loadingCards, loadingLineCharts, loadingBarCharts, loadingPieCharts, loadingTables };
  }, [loadingWidgets, widgetIdsString]);
  
  // Memoize individual widget references to prevent re-renders
  const { cards, lineCharts, barCharts, pieCharts, tables } = widgetGroups;
  const { loadingCards, loadingLineCharts, loadingBarCharts, loadingPieCharts, loadingTables } = loadingGroups;

  // Get widget IDs for stable memoization
  const barChartId = barCharts[0]?.id;
  const pieChartId = pieCharts[0]?.id;
  const lineChartId = lineCharts[0]?.id;
  const tableId = tables[0]?.id;
  const loadingBarId = loadingBarCharts[0]?.id;
  const loadingPieId = loadingPieCharts[0]?.id;
  const loadingLineId = loadingLineCharts[0]?.id;
  const loadingTableId = loadingTables[0]?.id;
  
  // Get first widgets for each row - memoize by widget ID to maintain stable references
  const firstBarChart = useMemo(() => barCharts[0], [barChartId]);
  const firstPieChart = useMemo(() => pieCharts[0], [pieChartId]);
  const loadingBar = useMemo(() => loadingBarCharts[0], [loadingBarId]);
  const loadingPie = useMemo(() => loadingPieCharts[0], [loadingPieId]);
  const firstLineChart = useMemo(() => lineCharts[0], [lineChartId]);
  const loadingLine = useMemo(() => loadingLineCharts[0], [loadingLineId]);
  const firstTable = useMemo(() => tables[0], [tableId]);
  const loadingTable = useMemo(() => loadingTables[0], [loadingTableId]);
  
  // Memoize card slots to prevent re-renders - update when card availability changes
  const cardSlots = useMemo(() => {
    return Array.from({ length: 3 }, (_, index) => {
      const card = cards[index];
      const loadingCard = loadingCards[index];
      // Show skeleton if no card is loaded yet
      const shouldShowSkeleton = !card;

      return {
        card,
        loadingCard: shouldShowSkeleton ? { id: `skeleton-card-${index}`, type: 'card' as WidgetType } : loadingCard,
        index,
        key: card?.id || `skeleton-card-${index}`
      };
    });
  }, [cards, loadingCards]);

  return (
    <>
      {/* Row 1: Performance Overview - Always show 3 card slots with skeletons until loaded */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardSlots.map(({ card, loadingCard, index, key }) => (
            <CardSlot
              key={key}
              card={card}
              loadingCard={loadingCard}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Row 2: Pie Chart and Bar Chart - Always show both slots with skeletons until loaded */}
      <div className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart (left) - Always show skeleton until loaded */}
          <ChartSlot
            chart={firstPieChart}
            loadingChart={!firstPieChart ? { id: 'skeleton-pie', type: 'pie_chart' } : loadingPie}
            chartType="pie"
            slotKey="pie"
          />

          {/* Bar Chart (right) - Always show skeleton until loaded */}
          <ChartSlot
            chart={firstBarChart}
            loadingChart={!firstBarChart ? { id: 'skeleton-bar', type: 'bar_chart' } : loadingBar}
            chartType="bar"
            slotKey="bar"
          />
        </div>
      </div>

      {/* Row 3: Line Chart - Always show skeleton until loaded */}
      <div className="mt-8">
        <ChartSlot
          chart={firstLineChart}
          loadingChart={!firstLineChart ? { id: 'skeleton-line', type: 'line_chart' } : loadingLine}
          chartType="line"
          slotKey="line"
        />
      </div>

      {/* Row 4: Table - Always show skeleton until loaded */}
      <div className="mt-8">
        <TableSlot
          table={firstTable}
          loadingTable={!firstTable ? { id: 'skeleton-table', type: 'table' } : loadingTable}
        />
      </div>
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  // Only re-render if widgets or loading states actually changed
  
  // Quick length check
  if (prevProps.dashboardWidgets.length !== nextProps.dashboardWidgets.length) {
    return false; // Re-render needed
  }
  if (prevProps.loadingWidgets.size !== nextProps.loadingWidgets.size) {
    return false; // Re-render needed
  }
  
  // Check if widget IDs changed - create sorted arrays for comparison
  const prevIds = prevProps.dashboardWidgets.map(w => w.id).sort().join(',');
  const nextIds = nextProps.dashboardWidgets.map(w => w.id).sort().join(',');
  if (prevIds !== nextIds) {
    return false; // Re-render needed
  }
  
  // Check if widget object references changed for existing widgets
  // This ensures we catch when a widget object is recreated with same ID
  const prevWidgetMap = new Map(prevProps.dashboardWidgets.map(w => [w.id, w]));
  for (const widget of nextProps.dashboardWidgets) {
    const prevWidget = prevWidgetMap.get(widget.id);
    if (!prevWidget || prevWidget !== widget) {
      // Widget object reference changed - but this is OK, child components will handle deep comparison
      // We only care if IDs changed
    }
  }
  
  // Check if loading widget IDs changed
  const prevLoadingIds = Array.from(prevProps.loadingWidgets.keys()).sort().join(',');
  const nextLoadingIds = Array.from(nextProps.loadingWidgets.keys()).sort().join(',');
  if (prevLoadingIds !== nextLoadingIds) {
    return false; // Re-render needed
  }
  
  return true; // No re-render needed
});

DashboardContent.displayName = 'DashboardContent';

const CanvasContent: React.FC<CanvasContentProps> = ({
  pinnedDashboards,
  setPinnedDashboards,
  onPinDashboard
}) => {
  // State for storing all dashboard widgets
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([]);
  // State for report metadata
  const [reportName, setReportName] = useState<string>("");
  const [reportGeneratedAt, setReportGeneratedAt] = useState<Date | null>(null);
  // State for loading widgets (stores widget metadata for loading state)
  const [loadingWidgets, setLoadingWidgets] = useState<Map<string, { type: WidgetType; title?: string }>>(new Map());
  // Counter for unique IDs
  const widgetIdCounter = useRef(0);

  // Deferred values must be called at the top level, never conditionally
  const deferredDashboardWidgets = useDeferredValue(dashboardWidgets);
  const deferredLoadingWidgets = useDeferredValue(loadingWidgets);

  // Helper function to batch widget updates (add widget and remove loading state in one update)
  const addWidgetWithLoadingState = useCallback((widget: DashboardWidget, loadingId: string) => {
    startTransition(() => {
      // Batch both state updates together
      setDashboardWidgets(prev => {
        // Check for duplicates by title and type
        if (isDuplicateWidget(prev, widget)) {
          // Remove loading state if duplicate
          setLoadingWidgets(loading => {
            const newMap = new Map(loading);
            newMap.delete(loadingId);
            return newMap;
          });
          return prev;
        }
        return [...prev, widget];
      });
      
      // Remove loading state after widget is added (batched with React 18)
      setLoadingWidgets(prev => {
        const newMap = new Map(prev);
        newMap.delete(loadingId);
        return newMap;
      });
    });
  }, []);

  // Helper function to generate unique ID
  const generateUniqueId = (prefix: string): string => {
    widgetIdCounter.current += 1;
    return `${prefix}-${Date.now()}-${widgetIdCounter.current}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Liveboard helper functions
  const pinCurrentDashboard = useCallback(() => {
    if (dashboardWidgets.length === 0) return;

    const dashboardName = reportName || `Dashboard ${pinnedDashboards.length + 1}`;
    const newPinnedDashboard: PinnedDashboard = {
      id: generateUniqueId('dashboard'),
      name: dashboardName,
      widgets: [...dashboardWidgets],
      createdAt: new Date(),
      reportName: reportName
    };

    setPinnedDashboards(prev => [...prev, newPinnedDashboard]);
    onPinDashboard();
    return newPinnedDashboard.id;
  }, [dashboardWidgets, reportName, pinnedDashboards.length, setPinnedDashboards, onPinDashboard]);


  // Helper function to check for duplicate widgets by title
  const isDuplicateWidget = (widgets: DashboardWidget[], newWidget: DashboardWidget): boolean => {
    if (newWidget.type === 'card') {
      const cardData = newWidget.data as MetricCardData;
      return widgets.some(w => 
        w.type === 'card' && 
        (w.data as MetricCardData).title === cardData.title
      );
    } else if (newWidget.type === 'line_chart' || newWidget.type === 'bar_chart' || newWidget.type === 'pie_chart') {
      const chartData = newWidget.data as GraphData;
      return widgets.some(w => 
        (w.type === 'line_chart' || w.type === 'bar_chart' || w.type === 'pie_chart') &&
        (w.data as GraphData).title === chartData.title &&
        w.type === newWidget.type
      );
    } else if (newWidget.type === 'table') {
      const tableData = newWidget.data as TableData;
      return widgets.some(w => 
        w.type === 'table' && 
        (w.data as TableData).title === tableData.title
      );
    }
    return false;
  };

  // Helper function to create chart widget
  interface ChartParams {
    title?: string;
    xAxisCategories?: string[];
    xAxisTitle?: string;
    yAxisTitle?: string;
    series?: unknown;
  }

  const createChartWidget = (chartType: ChartType, params: ChartParams): DashboardWidget => {
    try {
      const { title, xAxisCategories, xAxisTitle, yAxisTitle, series } = params;

      // Validate required parameters
      if (!title || !xAxisCategories || !xAxisTitle || !yAxisTitle) {
        console.warn('Missing required parameters for chart, using fallback:', { title, xAxisCategories, xAxisTitle, yAxisTitle });
        return {
          id: generateUniqueId('chart'),
          type: chartType === 'line' ? 'line_chart' : chartType === 'bar' ? 'bar_chart' : 'pie_chart',
          data: createFallbackChartData('Chart'),
        };
      }

      // Check if series is missing
      if (!series) {
        console.warn('Missing series parameter for chart, using fallback. Params received:', params);
        return {
          id: generateUniqueId('chart'),
          type: chartType === 'line' ? 'line_chart' : chartType === 'bar' ? 'bar_chart' : 'pie_chart',
          data: createFallbackChartData(title || 'Chart'),
        };
      }

      // Validate and normalize series data
      interface SeriesItem {
        name: string;
        data: number[];
        color?: string;
      }

      interface SeriesInput {
        name?: string;
        label?: string;
        data?: number[];
        values?: number[];
        value?: number;
        color?: string;
      }
      
      console.log('createChartWidget - raw series:', series, 'type:', typeof series, 'isArray:', Array.isArray(series));
      
      let normalizedSeries: SeriesItem[] = [];
      if (Array.isArray(series)) {
        console.log('Processing series as array, length:', series.length);
        const mapped = series
          .map((s: SeriesInput | number, index: number): SeriesItem | null => {
            console.log(`Processing series item ${index}:`, s);
            if (typeof s === 'object' && s !== null) {
              // More lenient: try to extract data even if not in expected format
              let dataArray: number[] = [];
              if (Array.isArray(s.data)) {
                dataArray = s.data;
              } else if (Array.isArray(s.values)) {
                dataArray = s.values;
              } else if (typeof s.value === 'number') {
                dataArray = [s.value];
              }
              
              if (dataArray.length > 0) {
                return {
                  name: s.name || s.label || `Series ${index + 1}`,
                  data: dataArray,
                  color: s.color,
                };
              }
            } else if (typeof s === 'number') {
              // Handle array of numbers directly
              return {
                name: `Series ${index + 1}`,
                data: [s],
                color: undefined,
              };
            }
            return null;
          });
        normalizedSeries = mapped.filter((s): s is SeriesItem => s !== null);
        console.log('Normalized series from array:', normalizedSeries);
      } else if (series && typeof series === 'object') {
        // Handle single series object
        console.log('Processing series as single object');
        const s = series as SeriesInput;
        let dataArray: number[] = [];
        if (Array.isArray(s.data)) {
          dataArray = s.data;
        } else if (Array.isArray(s.values)) {
          dataArray = s.values;
        } else if (typeof s.value === 'number') {
          dataArray = [s.value];
        }
        
        if (dataArray.length > 0) {
          normalizedSeries = [{
            name: s.name || s.label || 'Series',
            data: dataArray,
            color: s.color,
          }];
          console.log('Normalized series from object:', normalizedSeries);
        }
      }

      if (normalizedSeries.length === 0) {
        console.warn('No valid series data provided after normalization, using fallback. Original series:', series);
        // Return fallback chart data instead of null
        const fallbackData: GraphData = {
          title: title || 'Chart',
          xAxis: {
            categories: ['No Data'],
            title: xAxisTitle || 'Categories',
          },
          yAxis: {
            title: yAxisTitle || 'Values',
          },
          series: [{
            name: 'No Data',
            data: [],
            color: '#cccccc'
          }],
        };

        return {
          id: generateUniqueId('chart'),
          type: chartType === 'line' ? 'line_chart' : chartType === 'bar' ? 'bar_chart' : 'pie_chart',
          data: { ...fallbackData, chartType },
        };
      }

      // Validate xAxisCategories
      const validCategories = Array.isArray(xAxisCategories) ? xAxisCategories : [];

      const graphData: GraphData = {
        title,
        xAxis: {
          categories: validCategories,
          title: xAxisTitle,
        },
        yAxis: {
          title: yAxisTitle,
        },
        series: normalizedSeries,
      };

      return {
        id: generateUniqueId('chart'),
        type: chartType === 'line' ? 'line_chart' : chartType === 'bar' ? 'bar_chart' : 'pie_chart',
        data: { ...graphData, chartType },
      };
    } catch (error) {
      console.error('Error creating chart widget:', error);
      // Return fallback widget instead of null
      return {
        id: generateUniqueId('chart'),
        type: chartType === 'line' ? 'line_chart' : chartType === 'bar' ? 'bar_chart' : 'pie_chart',
        data: createFallbackChartData(params?.title || 'Chart'),
      };
    }
  };

  // Tool for rendering line charts
  useFrontendTool({
    name: "render_line_chart",
    description: "Render a line chart using Highcharts. The chart will appear on the canvas canvas. Use this for time series data, trends over time, or continuous data visualization. REQUIRED: You MUST provide the 'series' parameter with at least one data series containing 'name' and 'data' (array of numbers).",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "The title of the chart",
        required: true,
      },
      {
        name: "xAxisCategories",
        type: "string[]",
        description: "Categories for the X-axis (e.g., months, years, dates, etc.). Must be an array of strings matching the length of data points.",
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
        description: "REQUIRED: Array of data series objects. Each series object MUST have: 'name' (string) and 'data' (number[]). Example: [{\"name\": \"Sales\", \"data\": [100, 200, 150, 300]}]",
        required: true,
      },
    ],
    handler: async (params) => {
      console.log('render_line_chart called with params:', params);
      
      // Validate series parameter before proceeding
      if (!params.series) {
        return '❌ Error: Missing required parameter "series". You must provide a series array. Example: {"series": [{"name": "Sales", "data": [100, 200, 150, 300]}]}';
      }
      
      if (!Array.isArray(params.series) && typeof params.series !== 'object') {
        return '❌ Error: "series" must be an array or object. Example: [{"name": "Sales", "data": [100, 200, 150]}]';
      }
      
      const loadingId = generateUniqueId('loading-line');
      
      // Set loading state
      setLoadingWidgets(prev => new Map(prev).set(loadingId, { type: 'line_chart', title: params.title }));
      
      // Create widget synchronously (will always succeed with fallback data if needed)
      const widget = createChartWidget('line', params);
      console.log('Line chart widget created:', widget);

      // Batch widget addition and loading state removal
      addWidgetWithLoadingState(widget, loadingId);

      if (!reportGeneratedAt) {
        setReportGeneratedAt(new Date());
      }
      return `✅ Line chart "${params.title}" has been added to the dashboard.`;
    },
    render: () => <></>
  });

  // Tool for rendering bar charts
  useFrontendTool({
    name: "render_bar_chart",
    description: "Render a bar chart using Highcharts. The chart will appear on the canvas canvas. Use this for comparing categories, sales by product, revenue by region, etc. REQUIRED: You MUST provide the 'series' parameter with at least one data series containing 'name' and 'data' (array of numbers).",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "The title of the chart",
        required: true,
      },
      {
        name: "xAxisCategories",
        type: "string[]",
        description: "Categories for the X-axis (e.g., product names, regions, months, etc.). Must be an array of strings matching the length of data points.",
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
        description: "REQUIRED: Array of data series objects. Each series object MUST have: 'name' (string) and 'data' (number[]). Example: [{\"name\": \"Revenue\", \"data\": [1000, 2000, 1500, 3000]}]",
        required: true,
      },
    ],
    handler: async (params) => {
      console.log('render_bar_chart called with params:', params);
      
      // Validate series parameter before proceeding
      if (!params.series) {
        return '❌ Error: Missing required parameter "series". You must provide a series array. Example: {"series": [{"name": "Revenue", "data": [1000, 2000, 1500, 3000]}]}';
      }
      
      if (!Array.isArray(params.series) && typeof params.series !== 'object') {
        return '❌ Error: "series" must be an array or object. Example: [{"name": "Revenue", "data": [1000, 2000, 1500]}]';
      }
      
      const loadingId = generateUniqueId('loading-bar');
      
      // Set loading state
      setLoadingWidgets(prev => new Map(prev).set(loadingId, { type: 'bar_chart', title: params.title }));
      
      // Create widget synchronously (will always succeed with fallback data if needed)
      const widget = createChartWidget('bar', params);
      console.log('Bar chart widget created:', widget);

      // Batch widget addition and loading state removal
      addWidgetWithLoadingState(widget, loadingId);

      if (!reportGeneratedAt) {
        setReportGeneratedAt(new Date());
      }
      return `✅ Bar chart "${params.title}" has been added to the dashboard.`;
    },
    render: () => <></>
  });

  // Tool for rendering pie charts
  useFrontendTool({
    name: "render_pie_chart",
    description: "Render a pie chart using Highcharts. The chart will appear on the canvas canvas. Use this for showing proportions, market share, category distribution, etc.",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "The title of the chart",
        required: true,
      },
      {
        name: "categories",
        type: "string[]",
        description: "Category labels for each slice (e.g., product names, regions, etc.)",
        required: true,
      },
      {
        name: "values",
        type: "number[]",
        description: "Values for each category slice (must match length of categories)",
        required: true,
      },
      {
        name: "seriesName",
        type: "string",
        description: "Name of the data series",
        required: false,
      },
    ],
    handler: async (params) => {
      const { title, categories, values, seriesName = "Data" } = params;
      
      if (!Array.isArray(categories) || !Array.isArray(values) || categories.length !== values.length) {
        return 'Error: Categories and values must be arrays of the same length';
      }

      const graphData: GraphData = {
        title,
        xAxis: {
          categories,
          title: "",
        },
        yAxis: {
          title: "",
        },
        series: [{
          name: seriesName,
          data: values,
        }],
      };

      const widget: DashboardWidget = {
        id: generateUniqueId('pie-chart'),
        type: 'pie_chart',
        data: { ...graphData, chartType: 'pie' },
      };

      try {
        const loadingId = widget.id;
        // Set loading state
        setLoadingWidgets(prev => new Map(prev).set(loadingId, { type: 'pie_chart', title }));

        // Batch widget addition and loading state removal
        addWidgetWithLoadingState(widget, loadingId);

        if (!reportGeneratedAt) {
          setReportGeneratedAt(new Date());
        }
        return `✅ Pie chart "${title}" has been added to the dashboard.`;
      } catch (error) {
        console.error('Error in pie chart handler:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create pie chart';
        setLoadingWidgets(prev => {
          const newMap = new Map(prev);
          newMap.delete(widget.id);
          return newMap;
        });
        return `❌ Error: ${errorMessage}`;
      }
    },
    render: () => <></>
  });

  // Tool for rendering metric cards
  useFrontendTool({
    name: "render_metric_card",
    description: "Render a metric card (KPI card) on the canvas canvas. Use this for displaying key metrics like total revenue, number of orders, conversion rate, etc.",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "The title/label of the metric (e.g., 'Total Revenue', 'Orders', 'Conversion Rate')",
        required: true,
      },
      {
        name: "value",
        type: "string",
        description: "The main value to display (can be formatted with currency, percentage, etc.)",
        required: true,
      },
      {
        name: "subtitle",
        type: "string",
        description: "Optional subtitle or additional context",
        required: false,
      },
      {
        name: "trendValue",
        type: "number",
        description: "Optional trend percentage (positive or negative)",
        required: false,
      },
      {
        name: "trendLabel",
        type: "string",
        description: "Optional label for the trend (e.g., 'vs last month')",
        required: false,
      },
      {
        name: "icon",
        type: "string",
        description: "Optional emoji icon to display",
        required: false,
      },
      {
        name: "color",
        type: "string",
        description: "Color theme: blue, green, purple, orange, red, indigo",
        required: false,
      },
    ],
    handler: async (params) => {
      const { title, value, subtitle, trendValue, trendLabel, icon, color } = params;
      
      const cardData: MetricCardData = {
        title: title || 'Metric',
        value: value || 'No data',
        subtitle,
        trend: trendValue !== undefined ? {
          value: Math.abs(trendValue),
          isPositive: trendValue >= 0,
          label: trendLabel,
        } : undefined,
        icon,
        color,
      };

      const widget: DashboardWidget = {
        id: generateUniqueId('card'),
        type: 'card',
        data: cardData,
      };

      try {
        const loadingId = widget.id;
        // Set loading state
        setLoadingWidgets(prev => new Map(prev).set(loadingId, { type: 'card', title }));
        
        // Batch widget addition with duplicate and limit checks
        startTransition(() => {
          setDashboardWidgets(prev => {
            // Check for duplicates by title
            if (isDuplicateWidget(prev, widget)) {
              setLoadingWidgets(loading => {
                const newMap = new Map(loading);
                newMap.delete(loadingId);
                return newMap;
              });
              return prev;
            }
            // Limit to max 3 cards - if we already have 3 cards, don't add more
            const existingCards = prev.filter(w => w.type === 'card');
            if (existingCards.length >= 3) {
              setLoadingWidgets(loading => {
                const newMap = new Map(loading);
                newMap.delete(loadingId);
                return newMap;
              });
              return prev;
            }
            return [...prev, widget];
          });
          
          // Remove loading state after widget is added
          setLoadingWidgets(prev => {
            const newMap = new Map(prev);
            newMap.delete(loadingId);
            return newMap;
          });
        });

        if (!reportGeneratedAt) {
          setReportGeneratedAt(new Date());
        }
        return `✅ Metric card "${title}" has been added to the dashboard.`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create metric card';
        setLoadingWidgets(prev => {
          const newMap = new Map(prev);
          newMap.delete(widget.id);
          return newMap;
        });
        return `❌ Error: ${errorMessage}`;
      }
    },
    render: () => <></>
  });

  // Tool for setting report name
  useFrontendTool({
    name: "set_report_name",
    description: "Set the name/title of the dashboard report. This will appear at the top of the report.",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "The name/title of the report (e.g., 'Product Analysis Report', 'Ecommerce Sales Dashboard')",
        required: true,
      },
    ],
    handler: async (params) => {
      setReportName(params.name);
      if (!reportGeneratedAt) {
        setReportGeneratedAt(new Date());
      }
      return `✅ Report name set to "${params.name}".`;
    },
    render: () => <></>
  });

  // Tool for rendering data tables
  useFrontendTool({
    name: "render_table",
    description: "Render a data table on the canvas canvas. Use this for displaying tabular data like product listings, order details, sales reports, etc. REQUIRED: You MUST provide 'columns' (array) and 'rows' (array) parameters.",
    parameters: [
      {
        name: "title",
        type: "string",
        description: "The title of the table",
        required: true,
      },
      {
        name: "columns",
        type: "object[]",
        description: "REQUIRED: Array of column definition objects. Each column object MUST have: 'key' (string) and 'label' (string). Optional: 'type' ('string', 'number', 'currency', 'percentage', 'date'). Example: [{\"key\": \"product\", \"label\": \"Product Name\", \"type\": \"string\"}, {\"key\": \"sales\", \"label\": \"Sales\", \"type\": \"currency\"}]",
        required: true,
      },
      {
        name: "rows",
        type: "object[]",
        description: "REQUIRED: Array of row objects. Each row object should have keys matching the column 'key' values. Example: [{\"product\": \"Widget A\", \"sales\": 1000}, {\"product\": \"Widget B\", \"sales\": 2000}]",
        required: true,
      },
    ],
    handler: async (params) => {
      console.log('render_table called with params:', params);
      const { title, columns, rows } = params;

      // Validate columns
      if (!columns) {
        console.error('Table validation failed - columns parameter is missing');
        return 'Error: Columns parameter is required and must be an array of column definitions. Example: [{"key": "name", "label": "Name"}]';
      }
      
      if (!Array.isArray(columns)) {
        console.error('Table validation failed - columns is not an array:', columns, typeof columns);
        return 'Error: Columns must be an array. Received: ' + typeof columns + '. Example: [{"key": "name", "label": "Name"}]';
      }

      // Validate rows
      if (!rows) {
        console.error('Table validation failed - rows parameter is missing');
        return 'Error: Rows parameter is required and must be an array of row objects. Example: [{"name": "Item 1"}]';
      }
      
      if (!Array.isArray(rows)) {
        console.error('Table validation failed - rows is not an array:', rows, typeof rows);
        return 'Error: Rows must be an array. Received: ' + typeof rows + '. Example: [{"name": "Item 1"}]';
      }

      const tableData: TableData = {
        title: title || 'Table',
        columns: columns && Array.isArray(columns) && columns.length > 0
          ? columns
          : [{ key: 'status', label: 'Status' }],
        rows: rows && Array.isArray(rows) && rows.length > 0
          ? rows
          : [{ status: 'No data available' }],
      };

      const widget: DashboardWidget = {
        id: generateUniqueId('table'),
        type: 'table',
        data: tableData,
      };

      try {
        const loadingId = widget.id;
        // Set loading state
        setLoadingWidgets(prev => new Map(prev).set(loadingId, { type: 'table', title }));
        
        // Batch widget addition and loading state removal
        addWidgetWithLoadingState(widget, loadingId);

        if (!reportGeneratedAt) {
          setReportGeneratedAt(new Date());
        }
        return `✅ Table "${title}" has been added to the dashboard.`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create table';
        console.error('Error creating table:', error);
        setLoadingWidgets(prev => {
          const newMap = new Map(prev);
          newMap.delete(widget.id);
          return newMap;
        });
        return `❌ Error: ${errorMessage}`;
      }
    },
    render: () => <></>
  });

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      {/* Original Split Layout for Assistant view */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
        {/* Left Side - Chat */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col min-h-0 overflow-hidden bg-white">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">AI Assistant</h2>
          </div>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <CopilotChat
              className="flex-1 w-full min-h-0 canvas-chat"
              labels={{
                title: "AI Assistant",
                initial: "Hi! 👋 I'm an AI agent. How can I help you today?",
              }}
              instructions={`You are a helpful AI assistant for creating interactive dashboards. You can help users build comprehensive dashboards with charts, metric cards, and tables. All visualizations will appear on the canvas canvas (right side) while our conversation stays in the chat (left side).

The dashboard has a FIXED 4-ROW LAYOUT structure:
- Row 1: Performance Overview - EXACTLY 3 metric cards
- Row 2: Pie chart (left) and Bar chart (right) side by side
- Row 3: Line chart (full width)
- Row 4: Table data (full width)

Available tools:
- set_report_name: Set the name/title of the dashboard report (should be called first when creating a dashboard)
- render_line_chart: For time series data, trends over time, continuous data (appears in Row 3)
- render_bar_chart: For comparing categories, sales by product, revenue by region (appears in Row 2, right side)
- render_pie_chart: For showing proportions, market share, category distribution (appears in Row 2, left side)
- render_metric_card: For displaying KPIs like total revenue, orders, conversion rate (appears in Row 1, max 3 cards)
- render_table: For displaying tabular data like product listings, order details, sales reports (appears in Row 4)

When users ask to create a dashboard (e.g., 'product analysis dashboard', 'ecommerce seller dashboard', 'sales dashboard'):
1. FIRST call set_report_name with an appropriate report name
2. Create EXACTLY 3 essential metric cards for the most important KPIs (e.g., Total Revenue, Total Orders, Conversion Rate) - Row 1
3. Create ONE pie chart for category distribution - Row 2 (left)
4. Create ONE bar chart for comparisons - Row 2 (right)
5. Create ONE line chart for trends over time - Row 3
6. Create ONE table for detailed data - Row 4

IMPORTANT: 
- Always create widgets in this exact order: cards → pie chart → bar chart → line chart → table
- Create EXACTLY 3 metric cards (no more, no less) for Row 1
- Create ONE of each chart type (pie, bar, line) and ONE table
- Do NOT create duplicate widgets - each widget should be unique
- Use realistic sample data if specific data isn't provided.`}
              suggestions={[]}
            >
            </CopilotChat>
          </div>
        </div>

        {/* Right Side - Canvas */}
        <div className="w-1/2 flex flex-col min-h-0 overflow-hidden bg-white">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Canvas</h2>
          </div>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-gray-50">
            <div className="flex-1 w-full h-full bg-white border-2 border-dashed border-gray-300 rounded-lg m-4 overflow-auto relative">
              {/* Canvas Area */}
              <div className="absolute inset-0 p-8">
                {/* Pin Dashboard Button - Show above dashboard when widgets exist */}
                {dashboardWidgets.length > 0 && (
                  <div className="mb-6 flex justify-end">
                    <button
                      onClick={() => {
                        pinCurrentDashboard();
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Pin Dashboard
                    </button>
                  </div>
                )}

                {dashboardWidgets.length === 0 ? (
                  <div className="text-center text-gray-400 mt-20">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-lg font-medium">Dashboard Canvas</p>
                    <p className="text-sm mt-2">Your dashboard widgets will appear here</p>
                    <p className="text-xs mt-1 text-gray-400">Ask me to create charts, cards, or tables!</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Report Header */}
                    {(reportName || reportGeneratedAt) && (
                      <div className="border-b border-gray-200 pb-4 mb-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h1 className="text-3xl font-bold text-gray-900">{reportName || "Dashboard Report"}</h1>
                          </div>
                          {reportGeneratedAt && (
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Generated at</p>
                              <p className="text-sm font-medium text-gray-700">
                                {reportGeneratedAt.toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Dashboard Content */}
                    <DashboardContent
                      dashboardWidgets={deferredDashboardWidgets}
                      loadingWidgets={deferredLoadingWidgets}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CanvasView: React.FC<CanvasViewProps> = ({
  pinnedDashboards,
  setPinnedDashboards,
  onPinDashboard
}) => {
  return (
    <CopilotKit
      runtimeUrl={runtimeUrl}
      showDevConsole={false}
    >
      <CanvasContent
        pinnedDashboards={pinnedDashboards}
        setPinnedDashboards={setPinnedDashboards}
        onPinDashboard={onPinDashboard}
      />
    </CopilotKit>
  );
};

export default CanvasView;