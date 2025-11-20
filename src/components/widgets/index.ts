// Widget Components - Unified Dashboard Widget System
export { default as MetricCard } from './cards/MetricCard';
export { default as ChartWidget, type ChartType } from './charts/ChartWidget';
export { default as DataTable } from './tables/DataTable';

// Shared widget utilities and types
export type { GraphData } from './shared/types';
export * from './shared/types';
export * from './shared/utils';

// Legacy component exports (for backward compatibility)
export { default as LegacyMetricCard } from '../MetricCard';
export { default as LegacyChartWidget } from '../ChartWidget';
export { default as LegacyDataTable } from '../DataTable';
