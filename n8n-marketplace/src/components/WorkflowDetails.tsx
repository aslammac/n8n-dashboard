"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Tag, Share2, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { WorkflowMetadata } from '@/types/workflow';
import WorkflowPreview from '@/components/WorkflowPreview';
import api from '@/lib/api';
import RatingInput from '@/components/RatingInput';
import { mutate } from 'swr';

interface WorkflowDetailsProps {
  workflow: WorkflowMetadata;
}

export default function WorkflowDetails({ workflow }: WorkflowDetailsProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showAllNodes, setShowAllNodes] = useState(false);
  const INITIAL_NODE_LIMIT = 5;

  const handleDownload = async () => {
    if (!workflow) return;
    try {
      const response = await api.post(`/downloads/${workflow.id}`);
      const jsonString = JSON.stringify(response.data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workflow.title.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleCopy = () => {
    if (!workflow) return;
    const jsonString = JSON.stringify(workflow.workflow, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRate = async (rating: number) => {
    if (!workflow || !isAuthenticated) return;
    try {
      await api.post(`/workflows/${workflow.id}/rate`, { rating });
      // We might want to trigger a server revalidation here or just alert success
      // Since this is a server component parent, swr mutate won't affect the server props directly
      // But for now, let's just alert or assume optimistic UI if we had local state for rating
      window.location.reload(); // Simple way to refresh data for now
    } catch (error) {
      console.error('Rating failed:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] text-gray-100 font-sans pb-20">
      {/* Header */}
      <header className="bg-[#151519]/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to FlowStore
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/upload"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center shadow-lg shadow-blue-900/20"
                >
                  <span className="hidden sm:inline">Upload Workflow</span>
                </Link>
                
                <div className="flex items-center space-x-3 border-l border-gray-700 pl-4">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-medium text-white">{user?.firstName}</span>
                    <span className="text-xs text-gray-400 capitalize">{user?.subscriptionTier}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-[#1c1c21] hover:bg-[#25252b] text-white text-sm font-medium rounded-lg border border-gray-700 transition-colors flex items-center"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-[#151519] border-b border-gray-800 pt-12 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-3 mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {workflow.category}
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {workflow.complexity}
              </span>
              {workflow.isPremium && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-500 border border-yellow-500/30 flex items-center">
                    PREMIUM
                  </span>
                </>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {workflow.title}
            </h1>
            
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
              {workflow.shortDescription}
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Interactive Preview */}
            <section>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
                Workflow Preview
              </h2>
              <div className="bg-[#1c1c21] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                <div className="h-[300px] bg-[#0f0f11] relative group">
                  <WorkflowPreview workflow={workflow.workflow || { nodes: [], connections: {} }} />
                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs text-gray-300 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    Interactive Preview
                  </div>
                </div>
              </div>
            </section>

            {/* Setup Steps */}
            {workflow.setupSteps && workflow.setupSteps.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="w-1 h-6 bg-green-500 rounded-full mr-3"></span>
                  Setup Guide
                </h2>
                <div className="bg-[#1c1c21] border border-gray-800 rounded-2xl p-8">
                  <div className="space-y-8">
                    {workflow.setupSteps.map((step, index) => (
                      <div key={index} className="flex gap-6">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm font-bold border border-blue-500/20 shadow-lg shadow-blue-900/10">
                          {index + 1}
                        </div>
                        <div className="pt-1">
                          <p className="text-gray-300 leading-relaxed text-base">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Detailed Description (if exists) */}
            {workflow.detailedDescription && (
              <section>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
                  Details
                </h2>
                <div className="prose prose-invert max-w-none text-gray-400">
                  <p>{workflow.detailedDescription}</p>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Actions Card */}
            <div className="bg-[#1c1c21] rounded-2xl border border-gray-800 p-6 shadow-xl sticky top-24">
              <div className="flex flex-col space-y-4 mb-8">
                <button 
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center px-4 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] group"
                >
                  {copied ? <Tag className="w-5 h-5 mr-2" /> : <Share2 className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />}
                  {copied ? 'Copied!' : 'Copy Workflow JSON'}
                </button>
                
                <button 
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center px-4 py-4 bg-[#25252b] hover:bg-[#2a2a30] text-gray-200 border border-gray-700 hover:border-gray-600 rounded-xl font-medium transition-all active:scale-[0.98]"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download JSON
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between p-3 bg-[#151519] rounded-xl border border-gray-800/50">
                  <span className="text-gray-500 text-sm">Rating</span>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-white flex items-center mb-1">
                      {workflow.ratingAverage || '0.0'} <span className="text-yellow-500 ml-1">★</span>
                    </span>
                    <span className="text-xs text-gray-500 mb-2">({workflow.ratingCount || 0} ratings)</span>
                    {isAuthenticated ? (
                      <RatingInput 
                        currentRating={0} 
                        onRate={handleRate} 
                      />
                    ) : (
                      <span className="text-xs text-gray-600">Sign in to rate</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#151519] rounded-xl border border-gray-800/50">
                  <span className="text-gray-500 text-sm">Downloads</span>
                  <span className="font-bold text-white">{workflow.downloadsCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#151519] rounded-xl border border-gray-800/50">
                  <span className="text-gray-500 text-sm">Views</span>
                  <span className="font-bold text-white">{workflow.viewsCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#151519] rounded-xl border border-gray-800/50">
                  <span className="text-gray-500 text-sm">Updated</span>
                  <span className="font-bold text-white text-sm">
                    {new Date(workflow.updated).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-800">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Nodes Used</h3>
                <div className="flex flex-wrap gap-2">
                  {(showAllNodes ? workflow.nodes : workflow.nodes.slice(0, INITIAL_NODE_LIMIT)).map((node) => (
                    <div 
                      key={node}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-[#151519] border border-gray-800 rounded-lg text-xs text-gray-300 hover:border-gray-700 transition-colors"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div>
                      <span>{node}</span>
                    </div>
                  ))}
                  {workflow.nodes.length > INITIAL_NODE_LIMIT && (
                    <button
                      onClick={() => setShowAllNodes(!showAllNodes)}
                      className="px-3 py-1.5 bg-[#1c1c21] border border-gray-700 rounded-lg text-xs text-blue-400 hover:text-blue-300 hover:border-blue-500/50 transition-colors"
                    >
                      {showAllNodes ? 'Show Less' : `+${workflow.nodes.length - INITIAL_NODE_LIMIT} More`}
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
