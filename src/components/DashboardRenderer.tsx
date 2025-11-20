import React from 'react';
import ChartWidget, { type ChartType } from './ChartWidget';
import MetricCard from './MetricCard';
import DataTable from './DataTable';

export interface DashboardWidget {
  id: string;
  type: string;
  data: any;
}

interface DashboardRendererProps {
  widgets: unknown[];
  showHeaders?: boolean;
}

const DashboardRenderer: React.FC<DashboardRendererProps> = ({
  widgets,
  showHeaders = true
}) => {
  const cards = widgets.filter((w: any) => w.type === 'card').slice(0, 3);
  const charts = widgets.filter((w: any) => w.type === 'line_chart' || w.type === 'bar_chart' || w.type === 'pie_chart');
  const tables = widgets.filter((w: any) => w.type === 'table');

  return (
    <>
      {/* Row 1: Performance Overview - Cards */}
      {cards.length > 0 && (
        <div className="space-y-4">
          {showHeaders && (
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Overview</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card: any) => (
              <MetricCard key={card.id} data={card.data} />
            ))}
          </div>
        </div>
      )}

      {/* Row 2: Pie Chart and Bar Chart */}
      {charts.length >= 2 && (
        <div className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.slice(0, 2).map((chart: any) => {
              const chartType = chart.type === 'pie_chart' ? 'pie' : chart.type === 'bar_chart' ? 'bar' : 'line';
              return (
                <ChartWidget
                  key={chart.id}
                  data={chart.data}
                  chartType={chartType as ChartType}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Row 3: Line Chart (if more than 2 charts) */}
      {charts.length > 2 && (
        <div className="mt-8">
          {(() => {
            const chart = charts[2] as any;
            return (
              <ChartWidget
                key={chart.id}
                data={chart.data}
                chartType="line"
              />
            );
          })()}
        </div>
      )}

      {/* Row 4: Tables */}
      {tables.map((table: any) => (
        <div key={table.id} className="mt-8">
          <DataTable key={table.id} data={table.data} />
        </div>
      ))}
    </>
  );
};

export default DashboardRenderer;
