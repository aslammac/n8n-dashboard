"use client";

import React from 'react';
import Link from 'next/link';
import { WorkflowMetadata } from '@/types/workflow';
import { getNodeIcon } from '@/utils/nodeIcons';
import { ArrowRight, Download, Eye, BadgeCheck, Star, Crown, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface WorkflowCardProps {
  workflow: WorkflowMetadata;
}

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Get unique node types for icons, limit to 4
  const uniqueNodes = Array.from(new Set(workflow.nodes));
  const displayNodes = uniqueNodes.slice(0, 4);
  const remainingCount = uniqueNodes.length - 4;

  // Mock verification logic (random for demo purposes if not in data)
  const isVerified = (workflow as any).verified || Math.random() > 0.7;
  const isPremium = workflow.isPremium;
  const hasAccess = !isPremium || (user && user.subscriptionTier !== 'free');

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push('/auth/login');
      return;
    }

    if (!hasAccess) {
      e.preventDefault();
      router.push('/plans');
    }
  };

  return (
    <Link 
      href={`/workflow/${workflow.slug}`} 
      onClick={handleClick}
      className="block h-full group"
    >
      <div className="glass-card rounded-2xl p-6 h-full flex flex-col relative border border-white/5 hover:border-white/10 transition-all duration-300 bg-[#151519]/50 hover:bg-[#151519]/80">
        
        {/* Top Row: Icons & Premium Badge */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
             {displayNodes.map((node, i) => (
               <div key={i} className="relative group/icon">
                 <div className="bg-[#25252b] p-2 rounded-full border border-gray-700/50 group-hover:border-gray-600 transition-colors">
                    {getNodeIcon(node)}
                 </div>
                 {/* Tooltip */}
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover/icon:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-800 z-20">
                    {node}
                 </div>
               </div>
             ))}
             {remainingCount > 0 && (
               <div className="bg-[#25252b] w-9 h-9 rounded-full border border-gray-700/50 text-xs font-medium text-gray-400 flex items-center justify-center">
                 +{remainingCount}
               </div>
             )}
          </div>

          {workflow.isPremium && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500/20 to-amber-600/20 text-yellow-500 border border-yellow-500/30 flex items-center">
              <Lock className="w-3 h-3 mr-1" />
              PREMIUM
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {workflow.category}
          </span>
        </div>

        {/* Title & Description */}
        <div className="mb-6 flex-grow">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
            {workflow.title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
            {workflow.shortDescription}
          </p>
        </div>

        {/* Footer: Stats */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-end">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
             <span className="flex items-center">
                <Download className="w-3 h-3 mr-1" />
                {workflow.downloadsCount}
             </span>
             <span className="flex items-center text-yellow-500/80">
                <Star className="w-3 h-3 mr-1 fill-current" />
                {workflow.ratingAverage || '0.0'}
             </span>
          </div>
        </div>

      </div>
    </Link>
  );
}
