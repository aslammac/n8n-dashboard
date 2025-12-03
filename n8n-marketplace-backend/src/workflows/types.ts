export interface WorkflowAnalysis {
  title: string;
  shortDescription: string;
  detailedDescription: string;
  useCase: string;
  category: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  nodes: string[];
  requirements: string[];
  benefits: string[];
  setupTime: string;
  triggerType: string;
}
