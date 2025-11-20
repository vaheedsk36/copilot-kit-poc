import React, { useMemo } from 'react';
import { MetricCard, ChartWidget, DataTable } from '../widgets';
import { WidgetErrorBoundary, SkeletonCard, SkeletonChart, SkeletonTable } from '../feedback';
import type {
  DashboardWidget,
  LoadingWidget,
  WidgetType,
  MetricCardData,
  GraphData,
  TableData
} from '../widgets';

interface DashboardProps {
  widgets: DashboardWidget[];
  loadingWidgets?: Map<string, LoadingWidget>;
  onWidgetError?: (widgetId: string, error: Error) => void;
  onWidgetRefresh?: (widgetId: string) => void;
  className?: string;
}

/**
 * Dashboard Component
 * Renders a collection of dashboard widgets in a responsive grid layout
 * Handles loading states, error boundaries, and widget positioning
 */
const Dashboard: React.FC<DashboardProps> = ({
  widgets,
  loadingWidgets = new Map(),
  onWidgetError,
  onWidgetRefresh,
  className = '',
}) => {
  // Group widgets by type for organized rendering
  const widgetGroups = useMemo(() => {
    const groups: Record<WidgetType, DashboardWidget[]> = {
      card: [],
      line_chart: [],
      bar_chart: [],
      pie_chart: [],
      table: [],
    };

    widgets.forEach(widget => {
      groups[widget.type].push(widget);
    });

    return groups;
  }, [widgets]);

  // Get loading widgets by type
  const loadingGroups = useMemo(() => {
    const groups: Record<WidgetType, LoadingWidget[]> = {
      card: [],
      line_chart: [],
      bar_chart: [],
      pie_chart: [],
      table: [],
    };

    loadingWidgets.forEach(loadingWidget => {
      groups[loadingWidget.type].push(loadingWidget);
    });

    return groups;
  }, [loadingWidgets]);

  // Render widget with error boundary and loading state
  const renderWidget = (widget: DashboardWidget, loadingWidget?: LoadingWidget) => {
    const key = widget.id;

    return (
      <WidgetErrorBoundary
        key={key}
        widgetId={widget.id}
        widgetType={widget.type}
        onRetry={() => onWidgetRefresh?.(widget.id)}
      >
        <WidgetRenderer
          widget={widget}
          loadingWidget={loadingWidget}
          onError={onWidgetError}
          onRefresh={onWidgetRefresh}
        />
      </WidgetErrorBoundary>
    );
  };

  // Render loading skeleton
  const renderSkeleton = (loadingWidget: LoadingWidget) => (
    <div key={`loading-${loadingWidget.id}`}>
      {loadingWidget.type === 'card' && <SkeletonCard />}
      {loadingWidget.type === 'line_chart' && <SkeletonChart />}
      {loadingWidget.type === 'bar_chart' && <SkeletonChart />}
      {loadingWidget.type === 'pie_chart' && <SkeletonChart />}
      {loadingWidget.type === 'table' && <SkeletonTable />}
    </div>
  );

  const { card: cards, line_chart: lineCharts, bar_chart: barCharts, pie_chart: pieCharts, table: tables } = widgetGroups;
  const { card: loadingCards, line_chart: loadingLineCharts, bar_chart: loadingBarCharts, pie_chart: loadingPieCharts, table: loadingTables } = loadingGroups;

  // Calculate total slots needed for cards (always show 3 slots)
  const cardSlots = Math.max(3, cards.length + loadingCards.length);
  const cardWidgets = [...cards, ...loadingCards.map(lw => ({ ...lw, loading: true } as any))].slice(0, cardSlots);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Performance Overview - Cards Row */}
      {cardSlots > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cardWidgets.map((widget, index) => (
              <div key={widget.id || `card-slot-${index}`}>
                {widget.loading ? renderSkeleton(widget as LoadingWidget) : renderWidget(widget)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row - Pie and Bar Charts */}
      {(pieCharts.length > 0 || barCharts.length > 0 || loadingPieCharts.length > 0 || loadingBarCharts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart Slot */}
          <div>
            {pieCharts[0] ? renderWidget(pieCharts[0], loadingPieCharts[0]) :
             loadingPieCharts[0] ? renderSkeleton(loadingPieCharts[0]) : null}
          </div>

          {/* Bar Chart Slot */}
          <div>
            {barCharts[0] ? renderWidget(barCharts[0], loadingBarCharts[0]) :
             loadingBarCharts[0] ? renderSkeleton(loadingBarCharts[0]) : null}
          </div>
        </div>
      )}

      {/* Line Chart Row */}
      {(lineCharts.length > 0 || loadingLineCharts.length > 0) && (
        <div>
          {lineCharts[0] ? renderWidget(lineCharts[0], loadingLineCharts[0]) :
           loadingLineCharts[0] ? renderSkeleton(loadingLineCharts[0]) : null}
        </div>
      )}

      {/* Tables Row */}
      {[...tables, ...loadingTables.map(lw => ({ ...lw, loading: true } as any))].map((widget, index) => (
        <div key={widget.id || `table-${index}`} className="mt-8">
          {widget.loading ? renderSkeleton(widget as LoadingWidget) : renderWidget(widget)}
        </div>
      ))}
    </div>
  );
};

/**
 * WidgetRenderer Component
 * Renders individual widgets based on their type
 */
interface WidgetRendererProps {
  widget: DashboardWidget;
  loadingWidget?: LoadingWidget;
  onError?: (widgetId: string, error: Error) => void;
  onRefresh?: (widgetId: string) => void;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widget,
  loadingWidget,
  onError,
  onRefresh,
}) => {
  const handleError = (error: Error) => {
    onError?.(widget.id, error);
  };

  const handleRefresh = () => {
    onRefresh?.(widget.id);
  };

  switch (widget.type) {
    case 'card':
      return (
        <MetricCard
          widget={widget}
          onError={handleError}
          onRefresh={handleRefresh}
        />
      );

    case 'line_chart':
      return (
        <ChartWidget
          widget={widget}
          chartType="line"
          onError={handleError}
          onRefresh={handleRefresh}
        />
      );

    case 'bar_chart':
      return (
        <ChartWidget
          widget={widget}
          chartType="bar"
          onError={handleError}
          onRefresh={handleRefresh}
        />
      );

    case 'pie_chart':
      return (
        <ChartWidget
          widget={widget}
          chartType="pie"
          onError={handleError}
          onRefresh={handleRefresh}
        />
      );

    case 'table':
      return (
        <DataTable
          widget={widget}
          onError={handleError}
          onRefresh={handleRefresh}
        />
      );

    default:
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <p className="text-red-600">Unknown widget type: {(widget as any).type}</p>
        </div>
      );
  }
};

export default Dashboard;
