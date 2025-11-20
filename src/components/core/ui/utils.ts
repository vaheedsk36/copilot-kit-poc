import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge and conditionally apply CSS classes
 * Combines clsx for conditional logic with tailwind-merge for proper Tailwind CSS class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate responsive grid classes based on breakpoints
 */
export function generateGridClasses(cols: {
  default?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}) {
  const classes: string[] = [];

  if (cols.default) classes.push(`grid-cols-${cols.default}`);
  if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);

  return classes.join(' ');
}

/**
 * Generate spacing classes with consistent naming
 */
export function generateSpacingClasses(spacing: {
  margin?: number | { x?: number; y?: number; top?: number; bottom?: number; left?: number; right?: number };
  padding?: number | { x?: number; y?: number; top?: number; bottom?: number; left?: number; right?: number };
}) {
  const classes: string[] = [];

  // Handle margin
  if (typeof spacing.margin === 'number') {
    classes.push(`m-${spacing.margin}`);
  } else if (spacing.margin) {
    const { x, y, top, bottom, left, right } = spacing.margin;
    if (x !== undefined) classes.push(`mx-${x}`);
    if (y !== undefined) classes.push(`my-${y}`);
    if (top !== undefined) classes.push(`mt-${top}`);
    if (bottom !== undefined) classes.push(`mb-${bottom}`);
    if (left !== undefined) classes.push(`ml-${left}`);
    if (right !== undefined) classes.push(`mr-${right}`);
  }

  // Handle padding
  if (typeof spacing.padding === 'number') {
    classes.push(`p-${spacing.padding}`);
  } else if (spacing.padding) {
    const { x, y, top, bottom, left, right } = spacing.padding;
    if (x !== undefined) classes.push(`px-${x}`);
    if (y !== undefined) classes.push(`py-${y}`);
    if (top !== undefined) classes.push(`pt-${top}`);
    if (bottom !== undefined) classes.push(`pb-${bottom}`);
    if (left !== undefined) classes.push(`pl-${left}`);
    if (right !== undefined) classes.push(`pr-${right}`);
  }

  return classes.join(' ');
}

/**
 * Generate color classes based on theme and variant
 */
export function generateColorClasses(theme: 'primary' | 'secondary' | 'success' | 'warning' | 'error', variant: 'solid' | 'outline' | 'ghost' = 'solid') {
  const colorMap = {
    primary: {
      solid: 'bg-blue-500 text-white hover:bg-blue-600',
      outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50',
      ghost: 'text-blue-500 bg-transparent hover:bg-transparent',
    },
    secondary: {
      solid: 'bg-gray-500 text-white hover:bg-gray-600',
      outline: 'border border-gray-500 text-gray-500 hover:bg-gray-50',
      ghost: 'text-gray-500 bg-transparent hover:bg-transparent',
    },
    success: {
      solid: 'bg-green-500 text-white hover:bg-green-600',
      outline: 'border border-green-500 text-green-500 hover:bg-green-50',
      ghost: 'text-green-500 bg-transparent hover:bg-transparent',
    },
    warning: {
      solid: 'bg-yellow-500 text-white hover:bg-yellow-600',
      outline: 'border border-yellow-500 text-yellow-500 hover:bg-yellow-50',
      ghost: 'text-yellow-500 bg-transparent hover:bg-transparent',
    },
    error: {
      solid: 'bg-red-500 text-white hover:bg-red-600',
      outline: 'border border-red-500 text-red-500 hover:bg-red-50',
      ghost: 'text-red-500 bg-transparent hover:bg-transparent',
    },
  };

  return colorMap[theme][variant];
}

/**
 * Generate size classes for consistent component sizing
 */
export function generateSizeClasses(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') {
  const sizeMap = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
    xl: 'text-xl px-8 py-4',
  };

  return sizeMap[size];
}

/**
 * Generate shadow classes based on elevation level
 */
export function generateShadowClasses(elevation: 0 | 1 | 2 | 3 | 4 = 1) {
  const shadowMap = {
    0: '',
    1: 'shadow-sm',
    2: 'shadow',
    3: 'shadow-md',
    4: 'shadow-lg',
  };

  return shadowMap[elevation];
}

/**
 * Generate border radius classes
 */
export function generateBorderRadiusClasses(radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md') {
  const radiusMap = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  return radiusMap[radius];
}

/**
 * Format widget values based on data type
 */
export function formatWidgetValue(value: any, format?: 'currency' | 'percentage' | 'number' | 'text'): string {
  if (value === null || value === undefined) return '-';

  switch (format) {
    case 'currency':
      return formatCurrency(Number(value));
    case 'percentage':
      return formatPercentage(Number(value));
    case 'number':
      return formatNumber(Number(value));
    default:
      return String(value);
  }
}

/**
 * Format currency values consistently across components
 */
export function formatCurrency(value: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format percentage values consistently across components
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format numbers consistently across components
 */
export function formatNumber(value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format large numbers with appropriate suffixes (K, M, B)
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Generate consistent ID for components (for accessibility and testing)
 */
export function generateComponentId(prefix: string, suffix?: string): string {
  const randomId = Math.random().toString(36).substr(2, 9);
  return suffix ? `${prefix}-${suffix}-${randomId}` : `${prefix}-${randomId}`;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
