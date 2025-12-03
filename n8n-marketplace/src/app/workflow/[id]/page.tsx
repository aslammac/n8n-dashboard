"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Calendar, User, Tag, Share2, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { WorkflowMetadata } from '@/types/workflow';
import WorkflowPreview from '@/components/WorkflowPreview';
import api from '@/lib/api';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export default function WorkflowPage() {
  const params = useParams();
  const { user, isAuthenticated, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: apiData, error, isLoading } = useSWR(
    params.id ? `/workflows/${params.id}` : null,
    fetcher
  );

  const workflow: WorkflowMetadata | null = apiData ? {
    id: apiData._id,
    title: apiData.title,
    slug: apiData.slug,
    shortDescription: apiData.shortDescription,
    detailedDescription: apiData.detailedDescription,
    category: apiData.category,
    tags: apiData.tags,
    author: { name: 'Unknown' }, // Backend doesn't populate author name yet
    downloads: apiData.downloadsCount || 0,
    views: apiData.viewsCount || 0,
    rating: 0,
    created: apiData.createdAt,
    updated: apiData.updatedAt,
    nodes: apiData.nodes || [],
    nodeCount: apiData.nodes?.length || 0,
    complexity: apiData.complexity || 'intermediate',
    workflow: apiData.workflowJson,
  } : null;

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-white mb-4">Workflow not found</h2>
        <Link href="/" className="text-blue-500 hover:text-blue-400 font-medium">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f11] text-gray-100 font-sans pb-12">
      {/* Header */}
      <header className="bg-[#151519] border-b border-gray-800 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/upload"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
                >
                  <span className="hidden sm:inline">Upload</span>
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

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Details (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {workflow.category}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {workflow.complexity}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
                {workflow.title}
              </h1>
              
              <p className="text-gray-400 leading-relaxed text-sm">
                {workflow.shortDescription}
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <button 
                onClick={handleCopy}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
              >
                {copied ? <Tag className="w-5 h-5 mr-2" /> : <Share2 className="w-5 h-5 mr-2" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Workflow JSON'}
              </button>
              
              <button 
                onClick={handleDownload}
                className="w-full flex items-center justify-center px-4 py-3 bg-[#1c1c21] hover:bg-[#25252b] text-gray-300 border border-gray-800 rounded-xl font-medium transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Download JSON File
              </button>
            </div>

            <div className="bg-[#1c1c21] rounded-xl border border-gray-800 p-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Rating</span>
                <span className="font-medium text-white flex items-center">
                  {workflow.rating} <span className="text-yellow-500 ml-1">★</span>
                </span>
              </div>
              <div className="h-px bg-gray-800" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-medium text-white">
                  {new Date(workflow.updated).toLocaleDateString()}
                </span>
              </div>
              <div className="h-px bg-gray-800" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Downloads</span>
                <span className="font-medium text-white">
                  {workflow.downloads}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {workflow.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-2.5 py-1 bg-[#1c1c21] border border-gray-800 rounded-lg text-xs text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visualizer (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#1c1c21] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="h-[600px] bg-[#0f0f11] relative">
                <WorkflowPreview workflow={workflow.workflow || { nodes: [], connections: {} }} />
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs text-gray-400 border border-white/10">
                  Interactive Preview
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Nodes Used</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {workflow.nodes.map((node) => (
                  <div 
                    key={node}
                    className="flex items-center space-x-2 px-3 py-2 bg-[#1c1c21] border border-gray-800 rounded-lg text-sm text-gray-300"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500/50"></div>
                    <span>{node}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
