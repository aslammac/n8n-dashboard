import React from 'react';
import { WorkflowMetadata } from '@/types/workflow';
import WorkflowCard from './WorkflowCard';
import SkeletonCard from './SkeletonCard';

interface WorkflowGridProps {
  workflows: WorkflowMetadata[];
  loading?: boolean;
}

export default function WorkflowGrid({ workflows, loading }: WorkflowGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className="text-center py-20 rounded-2xl border border-dashed border-border">
        <h3 className="text-lg font-medium text-fg">No workflows found</h3>
        <p className="text-fg-muted mt-2">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workflows.map((workflow) => (
        <WorkflowCard key={workflow.slug} workflow={workflow} />
      ))}
    </div>
  );
}
