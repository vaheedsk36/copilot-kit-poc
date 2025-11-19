import React, { memo, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { type GraphData } from '../LineGraph';

export type ChartType = 'line' | 'bar' | 'pie';

interface ChartWidgetProps {
  data: GraphData;
  chartType?: ChartType;
}

const ChartWidget: React.FC<ChartWidgetProps> = memo(({ data, chartType = 'line' }) => {
  if (!data) {
    return null;
  }

  // Validate data structure - return null if invalid (will be filtered out)
  if (!data.series || !Array.isArray(data.series) || data.series.length === 0) {
    console.error('Invalid series data:', data.series);
    return null;
  }
  
  // Validate series data structure - memoized to prevent recalculation
  const validSeries = useMemo(() => {
    return data.series.filter(series => 
      series && 
      typeof series === 'object' && 
      series.name && 
      Array.isArray(series.data) && 
      series.data.length > 0
    );
  }, [data.series]);
  
  if (validSeries.length === 0) {
    console.error('No valid series found:', data.series);
    return null;
  }

  const options: Highcharts.Options = useMemo(() => {
    if (chartType === 'pie') {
      // For pie charts, use the first series and categories as labels
      const pieData = data.series[0]?.data.map((value, index) => ({
        name: data.xAxis.categories[index] || `Item ${index + 1}`,
        y: value,
      })) || [];

      return {
        chart: {
          type: 'pie',
          height: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
        title: {
          text: data.title,
        },
        series: [{
          name: data.series[0]?.name || 'Data',
          data: pieData,
          type: 'pie',
        }],
        credits: {
          enabled: false,
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
        },
      };
    } else {
      // For line and bar charts
      return {
        chart: {
          type: chartType,
          height: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
        title: {
          text: data.title,
        },
        xAxis: {
          categories: data.xAxis.categories,
          title: {
            text: data.xAxis.title,
          },
        },
        yAxis: {
          title: {
            text: data.yAxis.title,
          },
        },
        series: validSeries.map((series) => ({
          type: chartType,
          name: series.name,
          data: series.data,
          color: series.color,
        })),
        credits: {
          enabled: false,
        },
        legend: {
          enabled: true,
        },
        tooltip: {
          shared: chartType === 'line',
        },
      };
    }
  }, [data, chartType, validSeries]);

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
});

ChartWidget.displayName = 'ChartWidget';

export default ChartWidget;

