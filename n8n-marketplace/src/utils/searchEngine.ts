import Fuse from 'fuse.js';
import { WorkflowMetadata } from '@/types/workflow';

const fuseOptions = {
  keys: [
    { name: 'name', weight: 2 },
    { name: 'description', weight: 1.5 },
    { name: 'tags', weight: 1.2 },
    { name: 'nodes', weight: 1 },
    { name: 'category', weight: 1 }
  ],
  threshold: 0.3,
  includeScore: true,
  ignoreLocation: true,
};

let fuseInstance: Fuse<WorkflowMetadata> | null = null;

export function initializeSearch(workflows: WorkflowMetadata[]) {
  fuseInstance = new Fuse(workflows, fuseOptions);
}

export function searchWorkflows(query: string, workflows: WorkflowMetadata[]): WorkflowMetadata[] {
  if (!query) return workflows;
  
  // Re-initialize if needed (e.g. data changed) or just use the instance
  if (!fuseInstance) {
    fuseInstance = new Fuse(workflows, fuseOptions);
  } else {
    fuseInstance.setCollection(workflows);
  }

  const results = fuseInstance.search(query);
  return results.map(result => result.item);
}
