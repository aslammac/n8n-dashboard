"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { WorkflowMetadata } from '@/types/workflow';
import WorkflowGrid from '@/components/WorkflowGrid';
import FilterPanel from '@/components/FilterPanel';
import { useAuth } from '@/context/AuthContext';
import { Search, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import ThemeToggle from '@/components/ThemeToggle';

interface HomeClientProps {
  initialWorkflows: any[];
  initialMeta: any;
}

interface FilterState {
  category: string;
  complexity: string;
  nodeTypes: string[];
  isPremium: string;
  sort: string;
}

const SEARCH_DEBOUNCE_MS = 400;

export default function HomeClient({ initialWorkflows, initialMeta }: HomeClientProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // All search/filter/pagination state lives in the URL so it survives
  // client navigation (open a workflow, hit Back) and is shareable.
  const urlSearch = searchParams.get('q') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const filters: FilterState = {
    category: searchParams.get('category') ?? '',
    complexity: searchParams.get('complexity') ?? '',
    nodeTypes: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : [],
    isPremium: searchParams.get('isPremium') ?? '',
    sort: searchParams.get('sort') ?? '',
  };

  // Local mirror of the search box for instant typing feedback; the URL (and
  // therefore the request) is only updated after the debounce settles.
  const [searchInput, setSearchInput] = useState(urlSearch);
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      if (resetPage) params.delete('page');
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') params.delete(key);
        else params.set(key, value);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const commitSearch = useDebouncedCallback((value: string) => {
    updateParams({ q: value || null });
  }, SEARCH_DEBOUNCE_MS);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    commitSearch(value);
  };

  const submitSearchNow = () => {
    commitSearch.cancel();
    updateParams({ q: searchInput || null });
  };

  const handleFilterChange = (next: FilterState) => {
    updateParams({
      category: next.category || null,
      complexity: next.complexity || null,
      tags: next.nodeTypes.length > 0 ? next.nodeTypes.join(',') : null,
      isPremium: next.isPremium || null,
      sort: next.sort || null,
    });
  };

  const goToPage = (nextPage: number) => {
    updateParams({ page: nextPage > 1 ? String(nextPage) : null }, false);
  };

  const hasActiveQuery =
    !!urlSearch ||
    !!filters.category ||
    !!filters.complexity ||
    filters.nodeTypes.length > 0 ||
    !!filters.isPremium ||
    !!filters.sort;

  // Construct query string for SWR key
  const queryString = new URLSearchParams({
    page: page.toString(),
    limit: '9',
    ...(urlSearch && { search: urlSearch }),
    ...(filters.category && { category: filters.category }),
    ...(filters.complexity && { complexity: filters.complexity }),
    ...(filters.nodeTypes.length > 0 && { tags: filters.nodeTypes.join(',') }),
    ...(filters.isPremium && { isPremium: filters.isPremium }),
    ...(filters.sort && { sort: filters.sort }),
  }).toString();

  const { data, isLoading } = useSWR(`/workflows?${queryString}`, fetcher, {
    keepPreviousData: true,
    fallbackData:
      page === 1 && !hasActiveQuery
        ? { data: initialWorkflows, meta: initialMeta }
        : undefined,
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

  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-primary">flow</span><span className="">store</span><span className="text-fg-subtle font-light">.dev</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* <Link
              href="/coming-soon"
              className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-fg-muted hover:text-fg transition-colors"
            >
              Pricing
            </Link> */}
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                {user?.roles?.includes('admin') && (
                  <Link
                    href="/admin"
                    className="px-3.5 py-2 border border-border bg-surface text-sm font-medium rounded-full hover:bg-surface-2 transition-colors flex items-center"
                  >
                    <LayoutDashboard className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <div className="flex items-center gap-3 border-l border-border pl-3">
                  <div className="hidden sm:flex flex-col items-end leading-tight">
                    <span className="text-sm font-medium">{user?.firstName}</span>
                    <span className="text-xs text-fg-subtle capitalize">
                      {user?.subscriptionTier}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign out"
                    className="p-2 text-fg-muted hover:text-fg hover:bg-surface-2 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-fg text-sm font-medium rounded-lg transition-colors flex items-center"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
          style={{
            background:
              'radial-gradient(600px circle at 20% 0%, var(--primary-soft), transparent 60%), radial-gradient(500px circle at 90% 20%, color-mix(in srgb, var(--grad-to) 12%, transparent), transparent 60%)',
          }}
        />
        <div className="container mx-auto px-6 relative z-10 pt-20 pb-16 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface border border-border text-xs font-medium text-fg-muted mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
            Production-ready n8n workflows
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-5">
            Ship automations, <br className="hidden sm:block" />
            <span className="text-gradient">Not</span> boilerplate
          </h1>

          <p className="text-lg text-fg-muted mb-10 max-w-xl mx-auto leading-relaxed">
            Production-ready n8n workflows, built by the community and vetted by
            experts. Import in seconds.
          </p>

          <div className="max-w-xl mx-auto flex items-center gap-2 bg-card border border-border rounded-full p-2 pl-4 focus-within:border-primary/60 transition-colors">
            <Search className="w-5 h-5 text-fg-subtle shrink-0" />
            <input
              type="text"
              placeholder="Search Shopify, Slack, CRM…"
              className="w-full bg-transparent border-none text-fg placeholder:text-fg-subtle focus:outline-none px-2 py-2"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitSearchNow();
              }}
            />
            <button
              onClick={submitSearchNow}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-primary-fg font-medium rounded-full transition-colors shrink-0"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <FilterPanel
            workflows={workflows}
            filters={filters}
            onFilterChange={handleFilterChange}
            className="bg-card border border-border p-4 rounded-2xl"
          />
        </div>

        {isLoading ? (
          <WorkflowGrid workflows={[]} loading />
        ) : (
          <>
            <WorkflowGrid workflows={workflows} />

            {meta && meta.totalPages > 1 && (
              <div className="mt-14 flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-border bg-surface rounded-lg text-sm disabled:opacity-40 hover:bg-surface-2 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 text-sm text-fg-muted">
                  Page {page} of {meta.totalPages}
                </span>
                <button
                  onClick={() => goToPage(Math.min(meta.totalPages, page + 1))}
                  disabled={page === meta.totalPages}
                  className="px-4 py-2 border border-border bg-surface rounded-lg text-sm disabled:opacity-40 hover:bg-surface-2 transition-colors"
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
