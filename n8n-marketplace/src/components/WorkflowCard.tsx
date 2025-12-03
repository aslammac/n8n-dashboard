import React from 'react';
import Link from 'next/link';
import { WorkflowMetadata } from '@/types/workflow';
import { getNodeIcon } from '@/utils/nodeIcons';
import { ArrowRight, Download, Eye, BadgeCheck, Star } from 'lucide-react';

interface WorkflowCardProps {
  workflow: WorkflowMetadata;
}

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  // Get unique node types for icons, limit to 4
  const uniqueNodes = Array.from(new Set(workflow.nodes));
  const displayNodes = uniqueNodes.slice(0, 4);
  const remainingCount = uniqueNodes.length - 4;

  // Mock verification logic (random for demo purposes if not in data)
  const isVerified = (workflow as any).verified || Math.random() > 0.7;

  return (
    <Link href={`/workflow/${workflow.slug}`} className="block h-full group perspective-1000">
      <div className="bg-[#1c1c21] hover:bg-[#25252b] border border-gray-800 hover:border-blue-500/50 rounded-xl p-6 transition-all duration-300 h-full flex flex-col relative overflow-hidden transform-gpu group-hover:scale-[1.02] group-hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-blue-900/20">
        
        {/* Node Icons Header */}
        <div className="flex items-center space-x-3 mb-6">
          {displayNodes.map((node, index) => (
            <div key={index} className="relative group/icon">
              <div className="bg-gray-800/50 p-2 rounded-lg border border-gray-700/50 group-hover:border-gray-600 transition-colors">
                {getNodeIcon(node)}
              </div>
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover/icon:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-800">
                {node}
              </div>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="bg-gray-800/50 px-2 py-2 rounded-lg border border-gray-700/50 text-xs font-medium text-gray-400">
              +{remainingCount}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-3">
             <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md border border-blue-400/20">
              {workflow.category}
            </span>
            {isVerified && (
              <div className="flex items-center text-blue-400" title="Verified Workflow">
                <BadgeCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
            {workflow.title}
          </h3>
          
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4">
            {workflow.shortDescription}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
             <span className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>{workflow.rating}</span>
             </span>
             <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{workflow.views}</span>
             </span>
          </div>
          <div className="flex items-center text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium transform translate-x-2 group-hover:translate-x-0 duration-300">
            <span>Details</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
