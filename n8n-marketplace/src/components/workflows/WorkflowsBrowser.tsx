"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Search, SlidersHorizontal, X } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import WorkflowGrid from "@/components/WorkflowGrid";
import FilterPanel from "@/components/FilterPanel";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import Reveal from "@/components/motion/Reveal";
import { track, EVENTS } from "@/lib/analytics";

interface Props {
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
const PAGE_SIZE = 12;

function mapWorkflow(w: any) {
  return {
    id: w._id,
    title: w.title,
    slug: w.slug,
    shortDescription: w.shortDescription,
    detailedDescription: w.detailedDescription,
    category: w.category,
    tags: w.tags,
    author: w.creatorId
      ? { name: w.creatorId.fullName || w.creatorId.username, avatar: w.creatorId.avatarUrl }
      : { name: "Unknown" },
    downloadsCount: w.downloadsCount || 0,
    viewsCount: w.viewsCount || 0,
    rating: w.ratingAverage || 0,
    created: w.createdAt,
    updated: w.updatedAt,
    nodes: w.nodes || [],
    nodeCount: w.nodes?.length || 0,
    complexity: w.complexity || "intermediate",
    likesCount: w.likesCount || 0,
    isPremium: w.isPremium || false,
    ratingAverage: w.ratingAverage || 0,
  };
}

export default function WorkflowsBrowser({ initialWorkflows, initialMeta }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const filters: FilterState = {
    category: searchParams.get("category") ?? "",
    complexity: searchParams.get("complexity") ?? "",
    nodeTypes: searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [],
    isPremium: searchParams.get("isPremium") ?? "",
    sort: searchParams.get("sort") ?? "",
  };

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => setSearchInput(urlSearch), [urlSearch]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      if (resetPage) params.delete("page");
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
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
      tags: next.nodeTypes.length > 0 ? next.nodeTypes.join(",") : null,
      isPremium: next.isPremium || null,
      sort: next.sort || null,
    });
  };

  const goToPage = (nextPage: number) => {
    updateParams({ page: nextPage > 1 ? String(nextPage) : null }, false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveQuery =
    !!urlSearch ||
    !!filters.category ||
    !!filters.complexity ||
    filters.nodeTypes.length > 0 ||
    !!filters.isPremium ||
    !!filters.sort;

  const queryString = new URLSearchParams({
    page: page.toString(),
    limit: String(PAGE_SIZE),
    ...(urlSearch && { search: urlSearch }),
    ...(filters.category && { category: filters.category }),
    ...(filters.complexity && { complexity: filters.complexity }),
    ...(filters.nodeTypes.length > 0 && { tags: filters.nodeTypes.join(",") }),
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

  const workflows = data?.data ? data.data.map(mapWorkflow) : [];
  const meta = data?.meta || initialMeta;
  const total = meta?.total ?? workflows.length;

  // Analytics: report each settled search/filter result set once.
  const lastReported = useRef<string>("");
  useEffect(() => {
    if (isLoading || !data) return;
    if (!hasActiveQuery) return;
    const key = `${queryString}:${total}`;
    if (lastReported.current === key) return;
    lastReported.current = key;
    track(EVENTS.searchPerformed, {
      query: urlSearch || null,
      results_count: total,
      category: filters.category || null,
      complexity: filters.complexity || null,
      is_premium: filters.isPremium || null,
      sort: filters.sort || null,
    });
    if (total === 0) track(EVENTS.searchZeroResults, { query: urlSearch || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, data, queryString, total]);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-fg">
      <SiteHeader />

      <section className="border-b border-border grid-backdrop">
        <div className="container mx-auto px-6 pt-14 pb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Browse automation workflows
          </h1>
          <p className="text-fg-muted max-w-xl mb-8">
            Search {total.toLocaleString("en-US")} production-ready automations. Preview
            any workflow on the canvas, then import it in seconds.
          </p>

          <div className="max-w-xl flex items-center gap-2 bg-card border border-border rounded-full p-2 pl-4 focus-within:border-primary/60 transition-colors">
            <Search className="w-5 h-5 text-fg-subtle shrink-0" />
            <input
              type="text"
              placeholder="Search Shopify, Slack, CRM…"
              className="w-full bg-transparent border-none text-fg placeholder:text-fg-subtle focus:outline-none px-2 py-2"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearchNow()}
            />
            {searchInput && (
              <button
                onClick={() => handleSearchChange("")}
                className="p-1.5 text-fg-subtle hover:text-fg"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={submitSearchNow}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-primary-fg font-medium rounded-full transition-colors shrink-0"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 py-10 flex-1 w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <p className="text-sm text-fg-muted">
            {isLoading ? "Loading…" : `${total.toLocaleString("en-US")} workflow${total === 1 ? "" : "s"}`}
            {hasActiveQuery && !isLoading && " match your filters"}
          </p>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-fg-muted"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className={`mb-8 ${showFilters ? "block" : "hidden"} lg:block`}>
          <FilterPanel
            workflows={workflows}
            filters={filters}
            onFilterChange={handleFilterChange}
            className="bg-card border border-border p-4 rounded-2xl sticky top-20 z-30"
          />
        </div>

        {isLoading ? (
          <WorkflowGrid workflows={[]} loading />
        ) : (
          <Reveal key={queryString}>
            <WorkflowGrid workflows={workflows} />
          </Reveal>
        )}

        {meta && meta.totalPages > 1 && !isLoading && (
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
      </main>

      <SiteFooter />
    </div>
  );
}
