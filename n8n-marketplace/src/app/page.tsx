"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { WorkflowMetadata } from '@/types/workflow';
import WorkflowGrid from '@/components/WorkflowGrid';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import { searchWorkflows } from '@/utils/searchEngine';
import workflowsData from '@/data/workflows.json';

export default function Home() {
  const [workflows, setWorkflows] = useState<WorkflowMetadata[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    complexity: '',
    nodeTypes: [] as string[]
  });
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setWorkflows(workflowsData as any); // Type assertion needed due to JSON import
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let results = workflows;

    // Apply search
    if (searchQuery) {
      results = searchWorkflows(searchQuery, results);
    }

    // Apply filters
    if (filters.category) {
      results = results.filter(w => w.category === filters.category);
    }
    if (filters.complexity) {
      results = results.filter(w => w.complexity === filters.complexity);
    }
    if (filters.nodeTypes && filters.nodeTypes.length > 0) {
      results = results.filter(w => 
        filters.nodeTypes!.every(node => w.nodes.includes(node))
      );
    }

    setFilteredWorkflows(results);
    setCurrentPage(1); // Reset to first page on filter change
  }, [workflows, searchQuery, filters]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredWorkflows.length / itemsPerPage);
  const currentWorkflows = filteredWorkflows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            <div className="w-full md:w-96">
              <SearchBar onSearch={setSearchQuery} />
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
            Showing <span className="text-white">{filteredWorkflows.length}</span> workflows
          </p>
        </div>
        
        {/* Grid */}
        <WorkflowGrid workflows={currentWorkflows} loading={loading} />

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
