import React, { memo, useCallback } from 'react';
import { Card } from '../../core/ui';
import { cn } from '../../core/ui/utils';
import type { DashboardWidget, WidgetRendererProps } from './types';

interface BaseWidgetProps extends WidgetRendererProps<DashboardWidget> {
  children: React.ReactNode;
  showTitle?: boolean;
  showError?: boolean;
  showLoading?: boolean;
  className?: string;
}

const BaseWidget: React.FC<BaseWidgetProps> = memo(({
  widget,
  children,
  showTitle = true,
  showError = true,
  showLoading = true,
  onError,
  onRefresh,
  className,
}) => {
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh(widget.id);
    }
  }, [onRefresh, widget.id]);

  const handleError = useCallback((error: Error) => {
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // Handle loading state
  if (widget.loading && showLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <Card.Header>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </Card.Header>
        <Card.Content>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </Card.Content>
      </Card>
    );
  }

  // Handle error state
  if (widget.error && showError) {
    return (
      <Card className={cn('border-red-200 bg-red-50', className)}>
        <Card.Content>
          <div className="text-center py-6">
            <div className="text-red-500 mb-2">
              <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-red-800 mb-1">
              Widget Error
            </h3>
            <p className="text-sm text-red-600 mb-4">
              {widget.error}
            </p>
            {onRefresh && (
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            )}
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card
      className={className}
      hover
    >
      {showTitle && widget.title && (
        <Card.Header>
          <Card.Title>{widget.title}</Card.Title>
        </Card.Header>
      )}
      <Card.Content>
        {children}
      </Card.Content>
    </Card>
  );
});

BaseWidget.displayName = 'BaseWidget';

export default BaseWidget;
