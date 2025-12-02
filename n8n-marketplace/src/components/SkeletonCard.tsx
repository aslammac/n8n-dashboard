import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-[#1c1c21] border border-gray-800 rounded-xl p-6 h-full flex flex-col relative overflow-hidden">
      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {/* Node Icons Header Skeleton */}
      <div className="flex items-center space-x-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-9 h-9 bg-gray-800/50 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="flex-grow space-y-4">
        {/* Category Pill */}
        <div className="w-20 h-6 bg-blue-900/20 rounded-md animate-pulse" />

        {/* Title */}
        <div className="h-7 bg-gray-800 rounded-md w-3/4 animate-pulse" />
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-800/50 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-800/50 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-800/50 rounded w-4/6 animate-pulse" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="mt-8 pt-4 border-t border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-4">
           <div className="w-12 h-4 bg-gray-800/50 rounded animate-pulse" />
           <div className="w-12 h-4 bg-gray-800/50 rounded animate-pulse" />
        </div>
        <div className="w-16 h-4 bg-blue-900/20 rounded animate-pulse" />
      </div>
    </div>
  );
}
