import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animation?: 'pulse' | 'wave' | 'shimmer';
}

export default function LoadingSkeleton({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
  animation = 'shimmer',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';

  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return `${baseClasses} rounded-full`;
      case 'rectangular':
        return `${baseClasses}`;
      case 'rounded':
        return `${baseClasses} rounded-lg`;
      case 'text':
      default:
        return `${baseClasses} rounded`;
    }
  };

  const getAnimation = () => {
    switch (animation) {
      case 'pulse':
        return {
          animate: { opacity: [0.6, 1, 0.6] },
          transition: { duration: 1.5, repeat: Infinity },
        };
      case 'wave':
        return {
          animate: { x: ['-100%', '100%'] },
          transition: { duration: 1.5, repeat: Infinity },
        };
      case 'shimmer':
      default:
        return {
          animate: { x: ['-100%', '100%'] },
          transition: { duration: 2, repeat: Infinity },
        };
    }
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : '40px'),
    height: height || (variant === 'text' ? '1rem' : '40px'),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="relative overflow-hidden rounded">
            <motion.div
              className="h-4 bg-gray-200 dark:bg-gray-700"
              style={{
                width: index === lines - 1 ? '60%' : '100%',
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                {...getAnimation()}
              />
            </motion.div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${getVariantClasses()} ${className}`} style={style}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
        {...getAnimation()}
      />
    </div>
  );
}

// Card skeleton component
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <LoadingSkeleton variant="text" width="120px" height="20px" />
          <LoadingSkeleton variant="text" width="80px" height="16px" />
        </div>
        <LoadingSkeleton variant="circular" width="40px" height="40px" />
      </div>
      
      <div className="space-y-3">
        <LoadingSkeleton variant="text" lines={2} />
        <LoadingSkeleton variant="rectangular" width="100%" height="60px" className="rounded-lg" />
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <LoadingSkeleton variant="text" width="60px" height="16px" />
        <LoadingSkeleton variant="rectangular" width="80px" height="32px" className="rounded-md" />
      </div>
    </div>
  );
}

// Table skeleton component
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <LoadingSkeleton key={index} variant="text" height="20px" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <LoadingSkeleton key={colIndex} variant="text" height="16px" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Dashboard skeleton component
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
      
      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <LoadingSkeleton variant="text" width="150px" height="24px" className="mb-4" />
          <LoadingSkeleton variant="rectangular" width="100%" height="300px" className="rounded-lg" />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <LoadingSkeleton variant="text" width="150px" height="24px" className="mb-4" />
          <LoadingSkeleton variant="rectangular" width="100%" height="300px" className="rounded-lg" />
        </div>
      </div>
      
      {/* Recent activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <LoadingSkeleton variant="text" width="150px" height="24px" className="mb-4" />
        <TableSkeleton rows={5} columns={3} />
      </div>
    </div>
  );
}

// List skeleton component
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <LoadingSkeleton variant="circular" width="40px" height="40px" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton variant="text" width="60%" height="16px" />
            <LoadingSkeleton variant="text" width="40%" height="14px" />
          </div>
          <LoadingSkeleton variant="rectangular" width="60px" height="24px" className="rounded-md" />
        </div>
      ))}
    </div>
  );
}

// Form skeleton component
export function FormSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <LoadingSkeleton variant="text" width="200px" height="28px" />
      
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <LoadingSkeleton variant="text" width="120px" height="16px" />
            <LoadingSkeleton variant="rectangular" width="100%" height="40px" className="rounded-md" />
          </div>
        ))}
      </div>
      
      <div className="flex space-x-3">
        <LoadingSkeleton variant="rectangular" width="120px" height="40px" className="rounded-md" />
        <LoadingSkeleton variant="rectangular" width="100px" height="40px" className="rounded-md" />
      </div>
    </div>
  );
}
