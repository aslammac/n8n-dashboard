import { Node, Edge } from 'reactflow';
import { N8nWorkflowData } from '@/types/workflow';

export function convertN8nToReactFlow(n8nWorkflow: N8nWorkflowData) {
  const nodes: Node[] = n8nWorkflow.nodes.map((node) => ({
    id: node.name,
    type: 'default', // Using default node type for now, can be custom
    position: { x: node.position[0], y: node.position[1] },
    data: {
      label: node.name,
      nodeType: node.type,
      parameters: node.parameters,
    },
    style: {
      background: '#fff',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '10px',
      minWidth: '150px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
  }));

  const edges: Edge[] = [];
  
  if (n8nWorkflow.connections) {
    Object.entries(n8nWorkflow.connections).forEach(([sourceName, connections]) => {
      connections.main?.forEach((targetArray, outputIndex) => {
        targetArray?.forEach((target) => {
          edges.push({
            id: `${sourceName}-${target.node}-${outputIndex}`,
            source: sourceName,
            target: target.node,
            sourceHandle: `output-${outputIndex}`, // Optional, if using handles
            targetHandle: `input-${target.index || 0}`, // Optional
            animated: true,
            style: { stroke: '#888' },
          });
        });
      });
    });
  }

  return { nodes, edges };
}
