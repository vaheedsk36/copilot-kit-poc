import React from 'react';
import { Card } from '../core/ui';
import { cn } from '../core/ui/utils';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, animate = true, style }) => (
  <div
    className={cn(
      'bg-gray-200 rounded',
      animate && 'animate-pulse',
      className
    )}
    style={style}
  />
);

// Card skeleton components
interface SkeletonCardProps {
  className?: string;
  showHeader?: boolean;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = "",
  showHeader = true,
  lines = 3
}) => (
  <Card className={cn('animate-pulse', className)}>
    {showHeader && (
      <Card.Header>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </Card.Header>
    )}
    <Card.Content>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-4 ${i === lines - 1 ? 'w-4/6' : 'w-full'}`}
          />
        ))}
      </div>
    </Card.Content>
  </Card>
);

// Chart skeleton
interface SkeletonChartProps {
  className?: string;
  height?: number;
}

export const SkeletonChart: React.FC<SkeletonChartProps> = ({
  className = "",
  height = 400
}) => (
  <Card className={cn('animate-pulse', className)}>
    <Card.Header>
      <Skeleton className="h-6 w-1/4 mb-4" />
    </Card.Header>
    <Card.Content>
      <Skeleton className={`w-full`} style={{ height }} />
    </Card.Content>
  </Card>
);

// Table skeleton
interface SkeletonTableProps {
  className?: string;
  rows?: number;
  columns?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  className = "",
  rows = 5,
  columns = 4
}) => (
  <Card className={cn('animate-pulse overflow-hidden', className)}>
    <Card.Header>
      <Skeleton className="h-6 w-1/4" />
    </Card.Header>
    <Card.Content>
      <div className="space-y-3">
        {/* Table header */}
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 flex-1" />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                className={`h-4 flex-1 ${colIndex === columns - 1 ? 'w-3/4' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
    </Card.Content>
  </Card>
);

// Form skeleton
interface SkeletonFormProps {
  className?: string;
  fields?: number;
}

export const SkeletonForm: React.FC<SkeletonFormProps> = ({
  className = "",
  fields = 4
}) => (
  <Card className={cn('animate-pulse', className)}>
    <Card.Header>
      <Skeleton className="h-6 w-1/3 mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </Card.Header>
    <Card.Content>
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <div className="flex space-x-3 pt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </Card.Content>
  </Card>
);

// List skeleton
interface SkeletonListProps {
  className?: string;
  items?: number;
  showAvatar?: boolean;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  className = "",
  items = 5,
  showAvatar = false
}) => (
  <div className={cn('animate-pulse space-y-3', className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// Generic loading spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = "",
  color = 'text-blue-600'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <svg
      className={cn('animate-spin', color, sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Loading overlay for existing content
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = "Loading...",
  className = "",
  children
}) => (
  <div className={cn('relative', className)}>
    {children}
    {isVisible && (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-2" />
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    )}
  </div>
);

// Export all skeleton components
export {
  Skeleton,
};
