import React, { forwardRef } from 'react';
import { cn, generateShadowClasses, generateBorderRadiusClasses } from './utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 0 | 1 | 2 | 3 | 4;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  children: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  elevation = 1,
  rounded = 'lg',
  padding = 'md',
  hover = false,
  className,
  children,
  ...props
}, ref) => {
  const shadowClasses = generateShadowClasses(elevation);
  const borderRadiusClasses = generateBorderRadiusClasses(rounded);

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  }[padding];

  const hoverClasses = hover
    ? 'hover:shadow-lg transition-shadow duration-200'
    : '';

  const baseClasses = cn(
    'bg-white border border-gray-200',
    shadowClasses,
    borderRadiusClasses,
    paddingClasses,
    hoverClasses,
    className
  );

  return (
    <div
      ref={ref}
      className={baseClasses}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card sub-components for better composition
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('mb-4', className)}
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('', className)}
    {...props}
  >
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn('mt-4 pt-4 border-t border-gray-100', className)}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(({
  className,
  children,
  ...props
}, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold text-gray-900', className)}
    {...props}
  >
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(({
  className,
  children,
  ...props
}, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600', className)}
    {...props}
  >
    {children}
  </p>
));

CardDescription.displayName = 'CardDescription';

// Export compound component
export default Object.assign(Card, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
  Title: CardTitle,
  Description: CardDescription,
});
