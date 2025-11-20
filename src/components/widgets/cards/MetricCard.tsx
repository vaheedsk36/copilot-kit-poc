import React, { memo } from 'react';
import { cn, formatWidgetValue } from '../../core/ui/utils';
import { widgetColorSchemes } from '../shared/utils';
import BaseWidget from '../shared/BaseWidget';
import type { CardWidget, WidgetRendererProps } from '../shared/types';

interface MetricCardProps extends WidgetRendererProps<CardWidget> {
  showIcon?: boolean;
  showTrend?: boolean;
}

const MetricCardContent: React.FC<{ data: CardWidget['data'] }> = memo(({ data }) => {
  const { title, value, subtitle, trend, icon, color = 'blue', format } = data;
  const colorScheme = widgetColorSchemes[color];

  return (
    <div className={cn(
      'relative p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden',
      colorScheme.border,
      colorScheme.bg
    )}>
      {/* Accent bar */}
      <div className={cn('absolute top-0 left-0 right-0 h-1', colorScheme.accent)} />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className={cn('text-xs font-semibold uppercase tracking-wider mb-2', colorScheme.title)}>
            {title}
          </p>
          <p className={cn('text-3xl font-bold mb-2', colorScheme.text)}>
            {formatWidgetValue(value, format)}
          </p>
          {subtitle && (
            <p className={cn('text-sm mb-3 opacity-80', colorScheme.text)}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/50">
              <span className={cn(
                'text-xs font-semibold',
                trend.isPositive ? 'text-green-700' : 'text-red-700'
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className={cn('text-xs opacity-70', colorScheme.text)}>
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('text-4xl opacity-30 ml-4', colorScheme.text)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
});

MetricCardContent.displayName = 'MetricCardContent';

const MetricCard: React.FC<MetricCardProps> = memo(({
  widget,
  showIcon = true,
  showTrend = true,
  ...baseProps
}) => {
  return (
    <BaseWidget widget={widget} {...baseProps}>
      <MetricCardContent data={widget.data} />
    </BaseWidget>
  );
});

MetricCard.displayName = 'MetricCard';

export default MetricCard;
