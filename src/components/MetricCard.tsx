import React, { memo } from "react";
import type { MetricCardData } from "./types";

interface MetricCardProps {
  data: MetricCardData;
}

const MetricCard: React.FC<MetricCardProps> = memo(({ data }) => {
  const { title, value, subtitle, trend, icon, color = "blue" } = data;

  const colorConfig = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      border: "border-blue-300",
      text: "text-blue-900",
      title: "text-blue-600",
      accent: "bg-blue-500",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-green-100",
      border: "border-green-300",
      text: "text-green-900",
      title: "text-green-600",
      accent: "bg-green-500",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-purple-100",
      border: "border-purple-300",
      text: "text-purple-900",
      title: "text-purple-600",
      accent: "bg-purple-500",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100",
      border: "border-orange-300",
      text: "text-orange-900",
      title: "text-orange-600",
      accent: "bg-orange-500",
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-red-100",
      border: "border-red-300",
      text: "text-red-900",
      title: "text-red-600",
      accent: "bg-red-500",
    },
    indigo: {
      bg: "bg-gradient-to-br from-indigo-50 to-indigo-100",
      border: "border-indigo-300",
      text: "text-indigo-900",
      title: "text-indigo-600",
      accent: "bg-indigo-500",
    },
  };

  const config = colorConfig[color as keyof typeof colorConfig] || colorConfig.blue;

  const trendColorClasses = {
    positive: "text-green-700 bg-green-50",
    negative: "text-red-700 bg-red-50",
  };

  return (
    <div className={`relative p-6 rounded-xl border ${config.border} ${config.bg} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}>
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${config.accent}`}></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className={`text-xs font-semibold uppercase tracking-wider ${config.title} mb-2`}>{title}</p>
          <p className={`text-3xl font-bold ${config.text} mb-2`}>{value}</p>
          {subtitle && <p className={`text-sm ${config.text} opacity-80 mb-3`}>{subtitle}</p>}
          {trend && (
            <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-md">
              <span className={`text-xs font-semibold ${trend.isPositive ? trendColorClasses.positive : trendColorClasses.negative}`}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className={`text-xs ${config.text} opacity-70`}>{trend.label}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={`text-4xl ${config.text} opacity-30 ml-4`}>{icon}</div>
        )}
      </div>
    </div>
  );
});

MetricCard.displayName = 'MetricCard';

export default MetricCard;

