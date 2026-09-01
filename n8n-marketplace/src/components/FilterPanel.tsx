import React, { useState, useRef, useEffect } from 'react';
import { WorkflowMetadata } from '@/types/workflow';
import { ChevronDown, Check, ArrowUpDown } from 'lucide-react';

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
  'AI & ML',
  'Marketing',
  'Sales',
  'Data Processing',
  'Productivity',
  'Integration',
  'Communication',
  'E-commerce',
  'Finance',
  'HR',
  'Other',
];

const SEGMENT_BASE =
  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors';

export default function FilterPanel({
  filters,
  onFilterChange,
  className = '',
}: FilterPanelProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectCategory = (category: string) => {
    onFilterChange({
      ...filters,
      category: category === filters.category ? '' : category,
    });
    setIsCategoryOpen(false);
  };

  const selectSort = (sort: string) => {
    onFilterChange({ ...filters, sort });
    setIsSortOpen(false);
  };

  const sortLabel =
    filters.sort === 'downloads'
      ? 'Most Popular'
      : filters.sort === 'rating'
        ? 'Top Rated'
        : 'Newest';

  return (
    <div
      className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Category */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsCategoryOpen((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              filters.category
                ? 'bg-primary border-primary text-primary-fg'
                : 'bg-surface border-border text-fg-muted hover:text-fg hover:border-border-strong'
            }`}
          >
            <span>{filters.category || 'All Categories'}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isCategoryOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
              <div className="max-h-80 overflow-y-auto py-1 custom-scrollbar">
                {['', ...CATEGORIES].map((category) => (
                  <button
                    key={category || 'all'}
                    onClick={() => selectCategory(category)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                      filters.category === category
                        ? 'bg-primary-soft text-primary'
                        : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
                    }`}
                  >
                    <span>{category || 'All Categories'}</span>
                    {filters.category === category && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price segment */}
        <div className="flex bg-surface rounded-lg border border-border p-1">
          {[
            { label: 'All', value: '' },
            { label: 'Free', value: 'false' },
            { label: 'Premium', value: 'true' },
          ].map((option) => (
            <button
              key={option.label}
              onClick={() => onFilterChange({ ...filters, isPremium: option.value })}
              className={`${SEGMENT_BASE} ${
                filters.isPremium === option.value
                  ? 'bg-surface-2 text-fg'
                  : 'text-fg-subtle hover:text-fg'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Complexity segment */}
        <div className="hidden sm:flex bg-surface rounded-lg border border-border p-1">
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <button
              key={level}
              onClick={() =>
                onFilterChange({
                  ...filters,
                  complexity: filters.complexity === level ? '' : level,
                })
              }
              className={`${SEGMENT_BASE} capitalize ${
                filters.complexity === level
                  ? 'bg-surface-2 text-fg'
                  : 'text-fg-subtle hover:text-fg'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="relative" ref={sortDropdownRef}>
        <button
          onClick={() => setIsSortOpen((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-fg-muted hover:text-fg hover:border-border-strong transition-colors"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>
            Sort: <span className="text-fg font-medium">{sortLabel}</span>
          </span>
        </button>
        {isSortOpen && (
          <div className="absolute top-full right-0 mt-2 w-44 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
            {[
              { label: 'Newest', value: '' },
              { label: 'Most Popular', value: 'downloads' },
              { label: 'Top Rated', value: 'rating' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => selectSort(option.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                  filters.sort === option.value
                    ? 'bg-primary-soft text-primary'
                    : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
                }`}
              >
                <span>{option.label}</span>
                {filters.sort === option.value && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
