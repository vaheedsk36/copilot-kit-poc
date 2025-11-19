import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export interface GraphData {
  title: string;
  xAxis: {
    categories: string[];
    title: string;
  };
  yAxis: {
    title: string;
  };
  series: Array<{
    name: string;
    data: number[];
    color?: string;
  }>;
}

interface LineGraphProps {
  data: GraphData | null;
}

const LineGraph: React.FC<LineGraphProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  // Debug logging
  console.log('LineGraph received data:', data);
  console.log('Data series:', data.series);

  // Validate data structure
  if (!data.series || !Array.isArray(data.series)) {
    console.error('Invalid series data:', data.series);
    return <div style={{ color: 'red', padding: '20px' }}>Error: Invalid chart data - series must be an array</div>;
  }

  const options: Highcharts.Options = {
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
    series: data.series.map((series) => ({
      type: 'line',
      name: series.name,
      data: series.data,
      color: series.color,
    })),
    chart: {
      height: 400,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    credits: {
      enabled: false,
    },
    legend: {
      enabled: true,
    },
    tooltip: {
      shared: true,
    },
  };

  return (
    <div className="w-full bg-white rounded-lg p-4 shadow-lg my-4">
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
};

export default LineGraph;
