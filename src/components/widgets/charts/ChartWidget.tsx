import React, { memo, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { type GraphData } from '../../../LineGraph';
import BaseWidget from '../shared/BaseWidget';
import { isValidChartData, createFallbackChartData } from '../shared/utils';
import type { ChartWidget, WidgetRendererProps } from '../shared/types';

export type ChartType = 'line' | 'bar' | 'pie';

interface ChartWidgetProps extends WidgetRendererProps<ChartWidget> {
  chartType?: ChartType;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
}

const ChartWidgetContent: React.FC<{
  data: GraphData;
  chartType: ChartType;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
}> = memo(({
  data,
  chartType,
  height = 400,
  showLegend = true,
  showTooltip = true,
}) => {
  // Validate and prepare chart data
  const validData = useMemo(() => {
    if (!isValidChartData(data)) {
      return createFallbackChartData(data?.title);
    }
    return data;
  }, [data]);

  // Validate series data
  const validSeries = useMemo(() => {
    return validData.series.filter(series =>
      series &&
      typeof series === 'object' &&
      series.name &&
      Array.isArray(series.data) &&
      series.data.length > 0
    );
  }, [validData.series]);

  const options: Highcharts.Options = useMemo(() => {
    if (chartType === 'pie' && validSeries.length > 0) {
      // For pie charts, use the first series and categories as labels
      const pieData = validData.series[0]?.data.map((value, index) => ({
        name: validData.xAxis.categories[index] || `Item ${index + 1}`,
        y: value,
      })) || [];

      return {
        chart: {
          type: 'pie',
          height,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
        title: {
          text: validData.title,
        },
        series: [{
          name: validData.series[0]?.name || 'Data',
          data: pieData,
          type: 'pie',
        }],
        credits: {
          enabled: false,
        },
        legend: {
          enabled: showLegend,
        },
        tooltip: showTooltip ? {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
        } : undefined,
      };
    } else {
      // For line and bar charts
      return {
        chart: {
          type: chartType,
          height,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
        title: {
          text: validData.title,
        },
        xAxis: {
          categories: validData.xAxis.categories,
          title: {
            text: validData.xAxis.title,
          },
        },
        yAxis: {
          title: {
            text: validData.yAxis.title,
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
          enabled: showLegend,
        },
        tooltip: showTooltip ? {
          shared: chartType === 'line',
        } : undefined,
      };
    }
  }, [validData, chartType, height, showLegend, showTooltip, validSeries]);

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
});

ChartWidgetContent.displayName = 'ChartWidgetContent';

const ChartWidget: React.FC<ChartWidgetProps> = memo(({
  widget,
  chartType = 'line',
  height,
  showLegend,
  showTooltip,
  ...baseProps
}) => {
  // Determine chart type from widget type if not explicitly provided
  const actualChartType = chartType || (
    widget.type === 'pie_chart' ? 'pie' :
    widget.type === 'bar_chart' ? 'bar' : 'line'
  );

  return (
    <BaseWidget widget={widget} {...baseProps}>
      <ChartWidgetContent
        data={widget.data}
        chartType={actualChartType}
        height={height}
        showLegend={showLegend}
        showTooltip={showTooltip}
      />
    </BaseWidget>
  );
});

ChartWidget.displayName = 'ChartWidget';

export default ChartWidget;
