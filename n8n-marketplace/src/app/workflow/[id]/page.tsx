"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Calendar, User, Tag, Share2 } from 'lucide-react';
import { WorkflowMetadata } from '@/types/workflow';
import WorkflowPreview from '@/components/WorkflowPreview';
import workflowsData from '@/data/workflows.json';

export default function WorkflowPage() {
  const params = useParams();
  const [workflow, setWorkflow] = useState<WorkflowMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.id) {
      // Simulate fetch
      const found = (workflowsData as any[]).find(w => w.id === params.id);
      setWorkflow(found || null);
      setLoading(false);
    }
  }, [params.id]);

  const handleDownload = () => {
    if (!workflow) return;
    const jsonString = JSON.stringify(workflow.workflow, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!workflow) return;
    const jsonString = JSON.stringify(workflow.workflow, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
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
        <div className="container mx-auto px-6 py-4">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Link>
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
                {workflow.name}
              </h1>
              
              <p className="text-gray-400 leading-relaxed text-sm">
                {workflow.description}
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
                  {Math.floor(Math.random() * 2000) + 100}
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
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visualizer (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#1c1c21] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="h-[600px] bg-[#0f0f11] relative">
                <WorkflowPreview workflow={workflow.workflow} />
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
