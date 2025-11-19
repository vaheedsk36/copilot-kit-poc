import React from 'react';
import LineGraph, { type GraphData } from '../LineGraph';
import type { LineGraphWidgetProps } from './types';

const LineGraphWidget: React.FC<LineGraphWidgetProps> = ({ data, status }) => {
  if (status === "inProgress") {
    return <div>Loading graph...</div>;
  }

  if (!data) {
    return <div className="text-gray-500">No graph data available</div>;
  }

  return <LineGraph data={data as GraphData} />;
};

export default LineGraphWidget;
