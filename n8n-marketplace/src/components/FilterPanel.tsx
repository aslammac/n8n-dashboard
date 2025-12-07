import React, { useState, useRef, useEffect } from 'react';
import { WorkflowMetadata } from '@/types/workflow';
import { Search, Filter, X, ChevronDown, Check, ArrowUpDown, DollarSign } from 'lucide-react';

interface FilterState {
  category: string;
  complexity: string;
  nodeTypes: string[];
  isPremium: string; // 'true', 'false', or ''
  sort: string; // 'newest', 'downloads', 'rating'
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
  const [isSortOpen, setIsSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategorySelect = (category: string) => {
    onFilterChange({ ...filters, category: category === filters.category ? '' : category });
    setIsCategoryOpen(false);
  };

  const handleSortSelect = (sort: string) => {
    onFilterChange({ ...filters, sort });
    setIsSortOpen(false);
  };

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
      
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
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

        {/* Price Filter */}
        <div className="flex bg-[#1c1c21] rounded-lg border border-gray-800 p-1">
          {[
            { label: 'All', value: '' },
            { label: 'Free', value: 'false' },
            { label: 'Premium', value: 'true' }
          ].map((option) => (
            <button
              key={option.label}
              onClick={() => onFilterChange({ ...filters, isPremium: option.value })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filters.isPremium === option.value
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Complexity Filter */}
        <div className="flex bg-white/5 rounded-xl border border-white/10 p-1 hidden sm:flex">
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <button
              key={level}
              onClick={() => onFilterChange({ ...filters, complexity: filters.complexity === level ? '' : level })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filters.complexity === level
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Dropdown */}
      <div className="relative" ref={sortDropdownRef}>
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>Sort by: <span className="text-white font-medium capitalize">{filters.sort || 'Newest'}</span></span>
        </button>
        {isSortOpen && (
          <div className="absolute top-full right-0 mt-2 w-40 glass-card rounded-xl shadow-xl overflow-hidden z-50">
            {[
              { label: 'Newest', value: '' },
              { label: 'Most Popular', value: 'downloads' },
              { label: 'Top Rated', value: 'rating' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors flex items-center justify-between ${
                  (filters.sort === option.value || (!filters.sort && option.value === '')) ? 'text-blue-400 bg-blue-500/10' : 'text-gray-300'
                }`}
              >
                <span>{option.label}</span>
                {(filters.sort === option.value || (!filters.sort && option.value === '')) && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
