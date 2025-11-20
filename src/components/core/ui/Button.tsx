import React, { forwardRef } from 'react';
import { cn, generateColorClasses, generateSizeClasses } from './utils';

export type ButtonVariant = 'solid' | 'outline' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'solid',
  size = 'md',
  color = 'primary',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}, ref) => {
  const colorClasses = generateColorClasses(color, variant);
  const sizeClasses = generateSizeClasses(size);
  const widthClass = fullWidth ? 'w-full' : '';

  const baseClasses = cn(
    'inline-flex items-center justify-center',
    'font-medium rounded-md',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    colorClasses,
    sizeClasses,
    widthClass,
    className
  );

  return (
    <button
      ref={ref}
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
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
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
