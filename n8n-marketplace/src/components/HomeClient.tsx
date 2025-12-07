"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WorkflowMetadata } from '@/types/workflow';
import WorkflowGrid from '@/components/WorkflowGrid';
import FilterPanel from '@/components/FilterPanel';
import { useAuth } from '@/context/AuthContext';
import { Search, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

interface HomeClientProps {
  initialWorkflows: any[];
  initialMeta: any;
}

export default function HomeClient({ initialWorkflows, initialMeta }: HomeClientProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    complexity: '',
    nodeTypes: [] as string[],
    isPremium: '',
    sort: ''
  });
  
  // Pagination State
  const [page, setPage] = useState(1);

  // Construct query string for SWR key
  const queryString = new URLSearchParams({
    page: page.toString(),
    limit: '9',
    ...(searchQuery && { search: searchQuery }),
    ...(filters.category && { category: filters.category }),
    ...(filters.complexity && { complexity: filters.complexity }),
    ...(filters.nodeTypes.length > 0 && { tags: filters.nodeTypes.join(',') }),
    ...(filters.isPremium && { isPremium: filters.isPremium }),
    ...(filters.sort && { sort: filters.sort }),
  }).toString();

  // Use SWR for client-side updates (filtering, pagination)
  // Fallback to initial data if query matches initial state
  const { data, error, isLoading } = useSWR(`/workflows?${queryString}`, fetcher, {
    fallbackData: (page === 1 && !searchQuery && !filters.category && !filters.complexity && filters.nodeTypes.length === 0 && !filters.isPremium && !filters.sort) 
      ? { data: initialWorkflows, meta: initialMeta } 
      : undefined
  });

  const workflows = data?.data ? data.data.map((w: any) => ({
    id: w._id,
    title: w.title,
    slug: w.slug,
    shortDescription: w.shortDescription,
    detailedDescription: w.detailedDescription,
    category: w.category,
    tags: w.tags,
    author: w.creatorId ? { name: w.creatorId.fullName || w.creatorId.username, avatar: w.creatorId.avatarUrl } : { name: 'Unknown' },
    downloadsCount: w.downloadsCount || 0,
    viewsCount: w.viewsCount || 0,
    rating: w.ratingAverage || 0,
    created: w.createdAt,
    updated: w.updatedAt,
    nodes: w.nodes || [],
    nodeCount: w.nodes?.length || 0,
    complexity: w.complexity || 'intermediate',
    likesCount: w.likesCount || 0,
    isPremium: w.isPremium || false,
    ratingAverage: w.ratingAverage || 0,
  })) : [];

  const meta = data?.meta || initialMeta;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filters]);

  return (
    <div className="min-h-screen bg-[#0f0f11] font-sans text-gray-100 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 border-b-0">
        <div className="container mx-auto px-6 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
                FlowStore
              </h1>
            </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.roles?.includes('admin') && (
                  <Link 
                    href="/admin"
                    className="px-5 py-2.5 glass-card text-white text-sm font-medium rounded-full hover:bg-white/10 transition-all flex items-center"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                
                <div className="flex items-center space-x-3 border-l border-gray-700/50 pl-4">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-medium text-white">{user?.firstName}</span>
                    <span className="text-xs text-gray-400 capitalize">{user?.subscriptionTier}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="px-5 py-2.5 glass-card text-white text-sm font-medium rounded-xl hover:bg-white/10 transition-all flex items-center"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative pt-20 pb-24 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full glass-panel text-xs font-medium text-blue-400 mb-8 border border-blue-500/20">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            The #1 Marketplace for n8n Workflows
          </div>
          
          <h2 className="text-5xl md:text-6xl font-medium text-white mb-6 tracking-tight leading-tight">
            Automate your work with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-600">FlowStore</span>
          </h2>
          
          <p className="text-xl font-extralight text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover, share, and deploy powerful n8n automation workflows. 
            Join thousands of developers building the future of automation.
          </p>

          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center glass-panel rounded-full p-2 pl-6 ">
              <Search className="w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search for workflows, nodes, or categories..."
                className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 focus:outline-0 px-4 py-3 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 pb-24 relative z-10">
        <div className="mb-12">
          <FilterPanel 
            workflows={workflows} 
            filters={filters} 
            onFilterChange={setFilters} 
            className="glass-panel p-4 rounded-2xl"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl h-[400px] animate-pulse bg-white/5"></div>
            ))}
          </div>
        ) : (
          <>
            <WorkflowGrid workflows={workflows} />

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-16 flex justify-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 glass-card rounded-lg text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center px-4">
                  <span className="text-gray-400">Page {page} of {meta.totalPages}</span>
                </div>
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="px-4 py-2 glass-card rounded-lg text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
