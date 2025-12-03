"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WorkflowMetadata } from '@/types/workflow';
import WorkflowGrid from '@/components/WorkflowGrid';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import { searchWorkflows } from '@/utils/searchEngine';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { LogIn, LogOut, User } from 'lucide-react';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    complexity: '',
    nodeTypes: [] as string[]
  });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Construct query string for SWR key
  const queryString = new URLSearchParams({
    page: currentPage.toString(),
    limit: '9',
    ...(searchQuery && { search: searchQuery }),
    ...(filters.category && { category: filters.category }),
    ...(filters.complexity && { complexity: filters.complexity }),
    ...(filters.nodeTypes.length > 0 && { tags: filters.nodeTypes.join(',') }),
  }).toString();

  const { data, error, isLoading } = useSWR(`/workflows?${queryString}`, fetcher);

  const workflows = data?.data ? data.data.map((w: any) => ({
    id: w._id,
    title: w.title,
    slug: w.slug,
    shortDescription: w.shortDescription,
    detailedDescription: w.detailedDescription,
    category: w.category,
    tags: w.tags,
    author: w.creatorId ? { name: w.creatorId.fullName || w.creatorId.username, avatar: w.creatorId.avatarUrl } : { name: 'Unknown' },
    downloads: w.downloadsCount || 0,
    views: w.viewsCount || 0,
    rating: w.ratingAverage || 0,
    created: w.createdAt,
    updated: w.updatedAt,
    nodes: w.nodes || [],
    nodeCount: w.nodes?.length || 0,
    complexity: w.complexity || 'intermediate',
  })) : [];

  const totalPages = data?.meta?.totalPages || 1;
  const totalItems = data?.meta?.total || 0;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  // Reset page when filters change
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [searchQuery, filters]);

  return (
    <div className="min-h-screen bg-[#0f0f11] font-sans text-gray-100">
      {/* Hero Section */}
      <header className="bg-[#151519] border-b border-gray-800 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg flex items-center justify-center">
                 <span className="font-bold text-white">n8n</span>
              </div>
              <h1 className="text-xl font-bold text-white">
                Marketplace
              </h1>
            </div>
            <div className="w-full md:w-auto flex items-center space-x-4">
              <div className="hidden md:block w-96">
                <SearchBar onSearch={setSearchQuery} />
              </div>
              
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
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        {/* Filters Bar */}
        <div className="mb-8 bg-[#151519] p-4 rounded-xl border border-gray-800">
          <FilterPanel 
            workflows={workflows} 
            filters={filters} 
            onFilterChange={setFilters} 
          />
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-400">
            Showing <span className="text-white">{workflows.length}</span> of <span className="text-white">{totalItems}</span> workflows
          </p>
        </div>
        
        {/* Grid */}
        <WorkflowGrid workflows={workflows} loading={isLoading} />

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-[#1c1c21] border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-[#1c1c21] border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
