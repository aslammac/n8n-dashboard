import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center space-x-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-9 h-9 bg-surface-2 rounded-full animate-pulse" />
        ))}
      </div>

      <div className="flex-grow space-y-4">
        <div className="w-20 h-6 bg-surface-2 rounded-full animate-pulse" />
        <div className="h-7 bg-surface-2 rounded-md w-3/4 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-surface-2 rounded w-full animate-pulse" />
          <div className="h-4 bg-surface-2 rounded w-5/6 animate-pulse" />
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
        <div className="w-16 h-4 bg-surface-2 rounded animate-pulse" />
        <div className="w-20 h-4 bg-surface-2 rounded animate-pulse" />
      </div>
    </div>
  );
}
