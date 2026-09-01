"use client";

import React from 'react';
import Link from 'next/link';
import { WorkflowMetadata } from '@/types/workflow';
import { getNodeIcon } from '@/utils/nodeIcons';
import { Download, Star, Lock } from 'lucide-react';

interface WorkflowCardProps {
  workflow: WorkflowMetadata;
}

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  const uniqueNodes = Array.from(new Set(workflow.nodes));
  const displayNodes = uniqueNodes.slice(0, 4);
  const remainingCount = uniqueNodes.length - 4;

  return (
    <Link href={`/workflow/${workflow.slug}`} className="block h-full group">
      <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
        {/* Top row: node icons + premium badge */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center -space-x-1">
            {displayNodes.map((node, i) => (
              <div
                key={i}
                title={node}
                className="w-9 h-9 rounded-full bg-surface-2 border border-border flex items-center justify-center"
              >
                {getNodeIcon(node)}
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="w-9 h-9 rounded-full bg-surface-2 border border-border text-xs font-medium text-fg-subtle flex items-center justify-center">
                +{remainingCount}
              </div>
            )}
          </div>

          {workflow.isPremium && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center">
              <Lock className="w-3 h-3 mr-1" />
              PREMIUM
            </span>
          )}
        </div>

        <span className="self-start px-2.5 py-1 mb-3 rounded-full text-[11px] font-medium bg-primary-soft text-primary border border-primary/20">
          {workflow.category}
        </span>

        <div className="mb-6 flex-grow">
          <h3 className="text-lg font-semibold text-fg mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
            {workflow.title}
          </h3>
          <p className="text-fg-muted text-sm line-clamp-2 leading-relaxed">
            {workflow.shortDescription}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-xs text-fg-subtle">
          <span className="capitalize">{workflow.complexity}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center">
              <Download className="w-3.5 h-3.5 mr-1" />
              {workflow.downloadsCount}
            </span>
            <span className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 mr-1 fill-current" />
              {workflow.ratingAverage || '0.0'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
