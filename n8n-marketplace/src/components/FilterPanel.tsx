import React from 'react';
import { WorkflowMetadata } from '@/types/workflow';
import { Search, Filter, X } from 'lucide-react';

interface FilterState {
  category: string;
  complexity: string;
  nodeTypes: string[];
}

interface FilterPanelProps {
  workflows: WorkflowMetadata[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

export default function FilterPanel({ workflows, filters, onFilterChange, className = '' }: FilterPanelProps) {
  const categories = Array.from(new Set(workflows.map(w => w.category))).sort();
  
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      {/* Category Dropdown/Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 mask-linear-fade">
        <button
          onClick={() => onFilterChange({ ...filters, category: '' })}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border ${
            filters.category === '' 
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20' 
              : 'bg-[#1c1c21] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
          }`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onFilterChange({ ...filters, category: category === filters.category ? '' : category })}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border ${
              filters.category === category 
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-[#1c1c21] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-gray-800 hidden md:block" />

      {/* Complexity */}
      <div className="flex items-center space-x-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">Complexity</span>
        {['beginner', 'intermediate', 'advanced'].map(complexity => (
          <button
            key={complexity}
            onClick={() => onFilterChange({ ...filters, complexity: complexity === filters.complexity ? '' : complexity })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 capitalize ${
              filters.complexity === complexity 
                ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-sm' 
                : 'bg-[#1c1c21] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
            }`}
          >
            {complexity}
          </button>
        ))}
      </div>
    </div>
  );
}
