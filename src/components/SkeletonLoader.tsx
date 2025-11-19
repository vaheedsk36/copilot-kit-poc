import React from "react";

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = "" }) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-lg animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
};

export const SkeletonChart: React.FC<SkeletonCardProps> = ({ className = "" }) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-lg animate-pulse ${className}`}>
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="h-80 bg-gray-100 rounded"></div>
    </div>
  );
};

export const SkeletonTable: React.FC<SkeletonCardProps> = ({ className = "" }) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-lg animate-pulse overflow-hidden ${className}`}>
      <div className="px-6 py-4 bg-gray-100">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
};

