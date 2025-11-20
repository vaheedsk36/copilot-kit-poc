import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Card, Button } from '../core/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="border-red-200 bg-red-50 max-w-2xl mx-auto">
          <Card.Content>
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Something went wrong
              </h2>

              <p className="text-red-600 mb-6 max-w-md mx-auto">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </p>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  color="error"
                  variant="solid"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  color="secondary"
                  variant="outline"
                >
                  Refresh Page
                </Button>
              </div>

              {this.props.showDetails && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-red-700 hover:text-red-800">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-4 bg-red-100 rounded-md">
                    <pre className="text-xs text-red-800 whitespace-pre-wrap break-all">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </Card.Content>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
  ...props
}) => (
  <ErrorBoundary {...props}>
    {children}
  </ErrorBoundary>
);

// Widget-specific error boundary
interface WidgetErrorBoundaryProps {
  children: ReactNode;
  widgetId?: string;
  widgetType?: string;
  onRetry?: () => void;
}

export const WidgetErrorBoundary: React.FC<WidgetErrorBoundaryProps> = ({
  children,
  widgetId,
  widgetType,
  onRetry,
}) => (
  <ErrorBoundary
    fallback={
      <Card className="border-red-200 bg-red-50">
        <Card.Content>
          <div className="text-center py-4">
            <div className="text-red-500 mb-2">
              <svg className="mx-auto h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-red-800 mb-1">
              Widget Error
            </p>
            <p className="text-xs text-red-600 mb-3">
              {widgetType && `Failed to load ${widgetType} widget`}
            </p>
            {onRetry && (
              <Button
                onClick={onRetry}
                size="xs"
                color="error"
                variant="outline"
              >
                Retry
              </Button>
            )}
          </div>
        </Card.Content>
      </Card>
    }
    onError={(error, errorInfo) => {
      console.error(`Widget error (${widgetId}):`, error, errorInfo);
      // Could send to error reporting service here
    }}
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;
