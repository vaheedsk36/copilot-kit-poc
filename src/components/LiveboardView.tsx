import React, { useState, useRef } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotKit, useFrontendTool } from "@copilotkit/react-core";
import { type GraphData } from "../LineGraph";
import ChartWidget, { type ChartType } from "./ChartWidget";
import MetricCard from "./MetricCard";
import DataTable from "./DataTable";
import { SkeletonCard, SkeletonChart, SkeletonTable } from "./SkeletonLoader";
import type { DashboardWidget, MetricCardData, TableData, WidgetType } from "./types";

// Runtime URL - points to your backend
const runtimeUrl = import.meta.env.VITE_COPILOT_RUNTIME_URL || "/cpk/copilotkit";

const LiveboardViewContent: React.FC = () => {
  // State for storing all dashboard widgets
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([]);
  // State for report metadata
  const [reportName, setReportName] = useState<string>("");
  const [reportGeneratedAt, setReportGeneratedAt] = useState<Date | null>(null);
  // State for loading widgets (stores widget metadata for loading state)
  const [loadingWidgets, setLoadingWidgets] = useState<Map<string, { type: WidgetType; title?: string }>>(new Map());
  // Counter for unique IDs
  const widgetIdCounter = useRef(0);

  // Helper function to generate unique ID
  const generateUniqueId = (prefix: string): string => {
    widgetIdCounter.current += 1;
    return `${prefix}-${Date.now()}-${widgetIdCounter.current}-${Math.random().toString(36).substr(2, 9)}`;
  };

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
  const createChartWidget = (chartType: ChartType, params: any): DashboardWidget | null => {
    try {
      const { title, xAxisCategories, xAxisTitle, yAxisTitle, series } = params;

      // Validate required parameters
      if (!title || !xAxisCategories || !xAxisTitle || !yAxisTitle) {
        console.error('Missing required parameters for chart:', { title, xAxisCategories, xAxisTitle, yAxisTitle });
        return null;
      }

      // Check if series is missing
      if (!series) {
        console.error('Missing series parameter for chart. Params received:', params);
        return null;
      }

      // Validate and normalize series data
      interface SeriesItem {
        name: string;
        data: number[];
        color?: string;
      }
      
      console.log('createChartWidget - raw series:', series, 'type:', typeof series, 'isArray:', Array.isArray(series));
      
      let normalizedSeries: SeriesItem[] = [];
      if (Array.isArray(series)) {
        console.log('Processing series as array, length:', series.length);
        const mapped = series
          .map((s: any, index: number): SeriesItem | null => {
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
        const s = series as any;
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
        console.error('No valid series data provided after normalization. Original series:', series);
        return null;
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
      return null;
    }
  };

  // Tool for rendering line charts
  useFrontendTool({
    name: "render_line_chart",
    description: "Render a line chart using Highcharts. The chart will appear on the liveboard canvas. Use this for time series data, trends over time, or continuous data visualization. REQUIRED: You MUST provide the 'series' parameter with at least one data series containing 'name' and 'data' (array of numbers).",
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
      setLoadingWidgets(prev => new Map(prev).set(loadingId, { type: 'line_chart', title: params.title }));
      
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        setTimeout(() => {
          const widget = createChartWidget('line', params);
          console.log('Line chart widget created:', widget);
          
          if (!widget) {
            console.error('Failed to create line chart widget, params:', params);
            setLoadingWidgets(prev => {
              const newMap = new Map(prev);
              newMap.delete(loadingId);
              return newMap;
            });
            return;
          }

          // Use functional update to avoid stale closures
          setDashboardWidgets(prev => {
            // Check for duplicates by title and type
            if (isDuplicateWidget(prev, widget)) {
              console.log('Duplicate line chart detected, skipping');
              setLoadingWidgets(loading => {
                const newMap = new Map(loading);
                newMap.delete(loadingId);
                return newMap;
              });
              return prev;
            }
            console.log('Adding line chart to dashboard, total widgets:', prev.length + 1);
            // Use spread to create new array reference only when needed
            return [...prev, widget];
          });
          
          // Remove loading state after a brief delay to ensure smooth transition
          requestAnimationFrame(() => {
            setLoadingWidgets(prev => {
              const newMap = new Map(prev);
              newMap.delete(loadingId);
              return newMap;
            });
          });
        }, 300); // Reduced delay for faster perceived performance
      });

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
    description: "Render a bar chart using Highcharts. The chart will appear on the liveboard canvas. Use this for comparing categories, sales by product, revenue by region, etc. REQUIRED: You MUST provide the 'series' parameter with at least one data series containing 'name' and 'data' (array of numbers).",
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
      setLoadingWidgets(prev => new Map(prev).set(loadingId, { type: 'bar_chart', title: params.title }));
      
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        setTimeout(() => {
          const widget = createChartWidget('bar', params);
          console.log('Bar chart widget created:', widget);
          
          if (!widget) {
            console.error('Failed to create bar chart widget, params:', params);
            setLoadingWidgets(prev => {
              const newMap = new Map(prev);
              newMap.delete(loadingId);
              return newMap;
            });
            return;
          }

          setDashboardWidgets(prev => {
            // Check for duplicates by title and type
            if (isDuplicateWidget(prev, widget)) {
              console.log('Duplicate bar chart detected, skipping');
              setLoadingWidgets(loading => {
                const newMap = new Map(loading);
                newMap.delete(loadingId);
                return newMap;
              });
              return prev;
            }
            console.log('Adding bar chart to dashboard, total widgets:', prev.length + 1);
            return [...prev, widget];
          });
          
          requestAnimationFrame(() => {
            setLoadingWidgets(prev => {
              const newMap = new Map(prev);
              newMap.delete(loadingId);
              return newMap;
            });
          });
        }, 300);
      });

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
    description: "Render a pie chart using Highcharts. The chart will appear on the liveboard canvas. Use this for showing proportions, market share, category distribution, etc.",
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
        setLoadingWidgets(prev => new Map(prev).set(widget.id, { type: 'pie_chart', title }));
        
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          setTimeout(() => {
            setDashboardWidgets(prev => {
              // Check for duplicates by title and type
              if (isDuplicateWidget(prev, widget)) {
                setLoadingWidgets(loading => {
                  const newMap = new Map(loading);
                  newMap.delete(widget.id);
                  return newMap;
                });
                return prev;
              }
              return [...prev, widget];
            });
            
            requestAnimationFrame(() => {
              setLoadingWidgets(prev => {
                const newMap = new Map(prev);
                newMap.delete(widget.id);
                return newMap;
              });
            });
          }, 300);
        });

        if (!reportGeneratedAt) {
          setReportGeneratedAt(new Date());
        }
        return `✅ Pie chart "${title}" has been added to the dashboard.`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create pie chart';
        setLoadingWidgets(prev => {
          const newMap = new Map(prev);
          newMap.delete(`pie-${title}`);
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
    description: "Render a metric card (KPI card) on the liveboard canvas. Use this for displaying key metrics like total revenue, number of orders, conversion rate, etc.",
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
        title,
        value,
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
        setLoadingWidgets(prev => new Map(prev).set(widget.id, { type: 'card', title }));
        
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          setTimeout(() => {
            setDashboardWidgets(prev => {
              // Check for duplicates by title
              if (isDuplicateWidget(prev, widget)) {
                setLoadingWidgets(loading => {
                  const newMap = new Map(loading);
                  newMap.delete(widget.id);
                  return newMap;
                });
                return prev;
              }
              // Limit to max 3 cards - if we already have 3 cards, don't add more
              const existingCards = prev.filter(w => w.type === 'card');
              if (existingCards.length >= 3) {
                setLoadingWidgets(loading => {
                  const newMap = new Map(loading);
                  newMap.delete(widget.id);
                  return newMap;
                });
                return prev;
              }
              return [...prev, widget];
            });
            
            requestAnimationFrame(() => {
              setLoadingWidgets(prev => {
                const newMap = new Map(prev);
                newMap.delete(widget.id);
                return newMap;
              });
            });
          }, 300);
        });

        if (!reportGeneratedAt) {
          setReportGeneratedAt(new Date());
        }
        return `✅ Metric card "${title}" has been added to the dashboard.`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create metric card';
        setLoadingWidgets(prev => {
          const newMap = new Map(prev);
          newMap.delete(`card-${title}`);
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
    description: "Render a data table on the liveboard canvas. Use this for displaying tabular data like product listings, order details, sales reports, etc. REQUIRED: You MUST provide 'columns' (array) and 'rows' (array) parameters.",
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
        title,
        columns,
        rows,
      };

      const widget: DashboardWidget = {
        id: generateUniqueId('table'),
        type: 'table',
        data: tableData,
      };

      try {
        setLoadingWidgets(prev => new Map(prev).set(widget.id, { type: 'table', title }));
        
        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          setTimeout(() => {
            setDashboardWidgets(prev => {
              // Check for duplicates by title
              if (isDuplicateWidget(prev, widget)) {
                console.log('Duplicate table detected, skipping');
                setLoadingWidgets(loading => {
                  const newMap = new Map(loading);
                  newMap.delete(widget.id);
                  return newMap;
                });
                return prev;
              }
              console.log('Adding table to dashboard, total widgets:', prev.length + 1);
              return [...prev, widget];
            });
            
            requestAnimationFrame(() => {
              setLoadingWidgets(prev => {
                const newMap = new Map(prev);
                newMap.delete(widget.id);
                return newMap;
              });
            });
          }, 300);
        });

        if (!reportGeneratedAt) {
          setReportGeneratedAt(new Date());
        }
        return `✅ Table "${title}" has been added to the dashboard.`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create table';
        console.error('Error creating table:', error);
        setLoadingWidgets(prev => {
          const newMap = new Map(prev);
          newMap.delete(`table-${title}`);
          return newMap;
        });
        return `❌ Error: ${errorMessage}`;
      }
    },
    render: () => <></>
  });

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      {/* Liveboard View - Split Layout */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
        {/* Left Side - Chat */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col min-h-0 overflow-hidden bg-white">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
          </div>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <CopilotChat
              className="flex-1 w-full min-h-0 liveboard-chat"
              labels={{
                title: "Chat",
                initial: "Hi! 👋 I'm an AI agent. How can I help you today?",
              }}
              instructions={`You are a helpful AI assistant for creating interactive dashboards. You can help users build comprehensive dashboards with charts, metric cards, and tables. All visualizations will appear on the liveboard canvas (right side) while our conversation stays in the chat (left side).

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

        {/* Right Side - Liveboard/Canvas */}
        <div className="w-1/2 flex flex-col min-h-0 overflow-hidden bg-white">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Liveboard</h2>
          </div>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-gray-50">
            <div className="flex-1 w-full h-full bg-white border-2 border-dashed border-gray-300 rounded-lg m-4 overflow-auto relative">
              {/* Canvas/Liveboard Area */}
              <div className="absolute inset-0 p-8">
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
                    {(() => {
                      // Filter out widgets with errors and validate chart data
                      const validWidgets = dashboardWidgets.filter(w => {
                        if (w.error) return false;
                        // Additional validation for charts
                        if (w.type === 'line_chart' || w.type === 'bar_chart' || w.type === 'pie_chart') {
                          const chartData = w.data as GraphData;
                          return chartData && 
                                 chartData.series && 
                                 Array.isArray(chartData.series) && 
                                 chartData.series.length > 0;
                        }
                        return true;
                      });
                      
                      // Separate widgets by type
                      const cards = validWidgets.filter(w => w.type === 'card').slice(0, 3); // Limit to max 3 cards
                      const lineCharts = validWidgets.filter(w => w.type === 'line_chart');
                      const barCharts = validWidgets.filter(w => w.type === 'bar_chart');
                      const pieCharts = validWidgets.filter(w => w.type === 'pie_chart');
                      const tables = validWidgets.filter(w => w.type === 'table');
                      
                      // Get loading widgets that aren't yet in dashboardWidgets
                      const loadingCards = Array.from(loadingWidgets.entries())
                        .filter(([id, meta]) => meta.type === 'card' && !validWidgets.some(w => w.id === id))
                        .map(([id, meta]) => ({ id, type: meta.type }));
                      const loadingLineCharts = Array.from(loadingWidgets.entries())
                        .filter(([id, meta]) => meta.type === 'line_chart' && !validWidgets.some(w => w.id === id))
                        .map(([id, meta]) => ({ id, type: meta.type }));
                      const loadingBarCharts = Array.from(loadingWidgets.entries())
                        .filter(([id, meta]) => meta.type === 'bar_chart' && !validWidgets.some(w => w.id === id))
                        .map(([id, meta]) => ({ id, type: meta.type }));
                      const loadingPieCharts = Array.from(loadingWidgets.entries())
                        .filter(([id, meta]) => meta.type === 'pie_chart' && !validWidgets.some(w => w.id === id))
                        .map(([id, meta]) => ({ id, type: meta.type }));
                      const loadingTables = Array.from(loadingWidgets.entries())
                        .filter(([id, meta]) => meta.type === 'table' && !validWidgets.some(w => w.id === id))
                        .map(([id, meta]) => ({ id, type: meta.type }));

                      // Get first bar and pie chart for Row 2
                      const firstBarChart = barCharts[0];
                      const firstPieChart = pieCharts[0];
                      const loadingBar = loadingBarCharts[0];
                      const loadingPie = loadingPieCharts[0];
                      
                      // Get first line chart for Row 3
                      const firstLineChart = lineCharts[0];
                      const loadingLine = loadingLineCharts[0];
                      
                      // Get first table for Row 4
                      const firstTable = tables[0];
                      const loadingTable = loadingTables[0];

                      return (
                        <>
                          {/* Row 1: Performance Overview - 3 Cards */}
                          <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Render cards with loading states */}
                              {Array.from({ length: 3 }, (_, index) => {
                                const loadingCard = loadingCards[index];
                                const card = cards[index];
                                
                                if (loadingCard) {
                                  return <SkeletonCard key={loadingCard.id} />;
                                }
                                if (card) {
                                  return <MetricCard key={card.id} data={card.data as MetricCardData} />;
                                }
                                return <div key={`empty-card-${index}`} />;
                              })}
                            </div>
                          </div>

                          {/* Row 2: Pie Chart and Bar Chart */}
                          <div className="mt-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Pie Chart (left) */}
                              {loadingPie ? (
                                <SkeletonChart key="loading-pie" />
                              ) : firstPieChart ? (
                                <ChartWidget
                                  key={firstPieChart.id}
                                  data={firstPieChart.data as GraphData}
                                  chartType="pie"
                                />
                              ) : (
                                <div key="empty-pie" />
                              )}
                              
                              {/* Bar Chart (right) */}
                              {loadingBar ? (
                                <SkeletonChart key="loading-bar" />
                              ) : firstBarChart ? (
                                <ChartWidget
                                  key={firstBarChart.id}
                                  data={firstBarChart.data as GraphData}
                                  chartType="bar"
                                />
                              ) : (
                                <div key="empty-bar" />
                              )}
                            </div>
                          </div>

                          {/* Row 3: Line Chart (Full Width) */}
                          <div className="mt-8">
                            {loadingLine ? (
                              <SkeletonChart key="loading-line" />
                            ) : firstLineChart ? (
                              <ChartWidget
                                key={firstLineChart.id}
                                data={firstLineChart.data as GraphData}
                                chartType="line"
                              />
                            ) : (
                              <div key="empty-line" />
                            )}
                          </div>

                          {/* Row 4: Table Data */}
                          <div className="mt-8">
                            {loadingTable ? (
                              <SkeletonTable key="loading-table" />
                            ) : firstTable ? (
                              <DataTable key={firstTable.id} data={firstTable.data as TableData} />
                            ) : (
                              <div key="empty-table" />
                            )}
                          </div>
                        </>
                      );
                    })()}
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

const LiveboardView: React.FC = () => {
  return (
    <CopilotKit
      runtimeUrl={runtimeUrl}
      showDevConsole={false}
    >
      <LiveboardViewContent />
    </CopilotKit>
  );
};

export default LiveboardView;

