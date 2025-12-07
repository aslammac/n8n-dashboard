export interface N8nNode {
  parameters: Record<string, any>;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  id?: string; // Added for React Flow compatibility
}

export interface N8nConnection {
  node: string;
  type: string;
  index: number;
}

export interface N8nConnections {
  [key: string]: {
    main: N8nConnection[][];
  };
}

export interface N8nWorkflowData {
  nodes: N8nNode[];
  connections: N8nConnections;
  settings?: Record<string, any>;
  meta?: any;
}

export interface WorkflowAuthor {
  name: string;
  avatar?: string;
  url?: string;
}

export interface WorkflowMetadata {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  detailedDescription: string;
  category: string;
  tags: string[];
  author: WorkflowAuthor;
  downloadsCount: number;
  viewsCount: number;
  ratingAverage?: number;
  ratingCount?: number;
  likesCount: number;
  created: string;
  updated: string;
  nodes: string[]; // List of node types used
  nodeCount: number;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  setupSteps?: string[];
  isPremium?: boolean;
  workflow?: N8nWorkflowData;
}
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
