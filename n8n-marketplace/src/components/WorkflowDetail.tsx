"use client";

import React, { useMemo } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { N8nWorkflowData } from '@/types/workflow';
import { convertN8nToReactFlow } from '@/utils/n8nToReactFlow';

interface WorkflowDetailProps {
  workflow: N8nWorkflowData;
}

export default function WorkflowDetail({ workflow }: WorkflowDetailProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => convertN8nToReactFlow(workflow),
    [workflow]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-[600px] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <Background color="#aaa" gap={16} />
        <MiniMap 
          nodeStrokeColor={(n) => {
            if (n.style?.background) return n.style.background as string;
            if (n.type === 'input') return '#0041d0';
            if (n.type === 'output') return '#ff0072';
            if (n.type === 'default') return '#1a192b';
            return '#eee';
          }}
          nodeColor={(n) => {
            if (n.style?.background) return n.style.background as string;
            return '#fff';
          }}
          nodeBorderRadius={2}
        />
      </ReactFlow>
    </div>
  );
}
