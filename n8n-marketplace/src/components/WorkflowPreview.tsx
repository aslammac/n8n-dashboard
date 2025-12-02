import React, { useEffect, useRef, useState, memo } from 'react';
import { N8nWorkflowData } from '@/types/workflow';

interface WorkflowPreviewProps {
  workflow: N8nWorkflowData;
  className?: string;
}

const WorkflowPreview = memo(function WorkflowPreview({ workflow, className }: WorkflowPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const demoRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isVisible && demoRef.current) {
      try {
        // @ts-ignore
        demoRef.current.workflow = JSON.stringify(workflow);
      } catch (e) {
        console.error("Error setting workflow data", e);
      }
    }
  }, [isVisible, workflow]);

  return (
    <div ref={containerRef} className={`w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900 ${className}`}>
      {!isVisible ? (
        <div className="w-full h-full flex items-center justify-center animate-pulse">
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
             <span className="text-gray-300 dark:text-gray-600 text-xs">Loading Preview...</span>
          </div>
        </div>
      ) : (
        React.createElement('n8n-demo', {
          ref: demoRef,
          style: { width: '100%', height: '100%' }
        })
      )}
    </div>
  );
});

export default WorkflowPreview;
