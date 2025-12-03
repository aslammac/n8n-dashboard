import React, { useState, useRef, useEffect } from 'react';
import { WorkflowMetadata } from '@/types/workflow';
import { Search, Filter, X, ChevronDown, Check } from 'lucide-react';

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

const CATEGORIES = [
  "AI & ML",
  "Marketing",
  "Sales",
  "Data Processing",
  "Productivity",
  "Integration",
  "Communication",
  "E-commerce",
  "Finance",
  "HR",
  "Other"
];

export default function FilterPanel({ workflows, filters, onFilterChange, className = '' }: FilterPanelProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategorySelect = (category: string) => {
    onFilterChange({ ...filters, category: category === filters.category ? '' : category });
    setIsCategoryOpen(false);
  };

  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      
      {/* Category Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
            filters.category 
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20' 
              : 'bg-[#1c1c21] border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
          }`}
        >
          <span>{filters.category || 'All Categories'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
        </button>

        {isCategoryOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-[#1c1c21] border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="max-h-80 overflow-y-auto py-1 custom-scrollbar">
              <button
                onClick={() => handleCategorySelect('')}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group ${
                  filters.category === '' ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>All Categories</span>
                {filters.category === '' && <Check className="w-4 h-4" />}
              </button>
              
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group ${
                    filters.category === category ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{category}</span>
                  {filters.category === category && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        )}
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
