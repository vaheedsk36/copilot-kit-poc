/**
 * Components Public API
 * Clean, organized exports following the new architecture
 */

// Design System - Core UI Primitives
export * from './core/ui';

// Widgets - Dashboard Components
export * from './widgets';

// Feedback - Loading, Error, and User Feedback
export * from './feedback';

// Dashboard - High-level dashboard rendering
export * from './dashboard';

// Forms - Interactive Form Components
export { default as CampaignDaypartingForm } from './CampaignDaypartingForm';

// Legacy Components (for backward compatibility - will be deprecated)
export { default as LineGraphWidget } from './LineGraphWidget';
export { default as DashboardRenderer } from './DashboardRenderer';

// Navigation
export { default as LiveboardSidebar, type PinnedDashboard, type ViewType } from './LiveboardSidebar';

// AI-Powered Components
export { default as ChatbotView } from './ChatbotView';
export { default as CanvasView } from './Canvas';
export { default as ReportGenerationWidget } from './ReportGenerationWidget';

// Shared Types (consolidated)
export * from './types';

// Re-export commonly used utilities
export { cn, formatCurrency, formatPercentage, formatLargeNumber } from './core/ui';
