"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Download, Tag, Share2, Sparkles, Star, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { WorkflowMetadata } from '@/types/workflow';
import WorkflowPreview from '@/components/WorkflowPreview';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import Reveal from '@/components/motion/Reveal';
import { getNodeIcon } from '@/utils/nodeIcons';
import api from '@/lib/api';
import { fetcher } from '@/lib/fetcher';
import useSWR from 'swr';
import RatingInput from '@/components/RatingInput';
import { track, EVENTS } from '@/lib/analytics';
import { categoryHref } from '@/data/categories';

interface WorkflowDetailsProps {
  workflow: WorkflowMetadata;
}

type ApiError = { response?: { status?: number; data?: { message?: string } } };

interface Recommendation {
  _id: string;
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
  isPremium?: boolean;
}

export default function WorkflowDetails({ workflow }: WorkflowDetailsProps) {
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showAllNodes, setShowAllNodes] = useState(false);
  const INITIAL_NODE_LIMIT = 5;

  const [downloading, setDownloading] = useState(false);
  // Premium access is account-level (Pro subscription or lifetime), not per
  // workflow. The SSR fetch is unauthenticated, so premium always arrives
  // locked — re-check the signed-in user's billing on the client.
  const [hasAccess, setHasAccess] = useState(!workflow?.locked);

  const isPremium = !!workflow?.isPremium;
  const locked = isPremium && !hasAccess;

  const { data: related } = useSWR<Recommendation[]>(
    workflow?.id ? `/workflows/${workflow.id}/recommendations` : null,
    fetcher,
  );

  useEffect(() => {
    track(EVENTS.workflowDetailView, {
      id: workflow.id,
      slug: workflow.slug,
      is_premium: isPremium,
      locked,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow.id]);

  useEffect(() => {
    if (!isPremium || !isAuthenticated || !workflow?.locked) return;
    let cancelled = false;
    api
      .get('/payments/billing')
      .then(({ data }) => {
        if (!cancelled && data?.hasPremium) setHasAccess(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, workflow?.id]);

  const handleDownload = async () => {
    if (!workflow || downloading) return;
    setDownloading(true);
    try {
      const response = await api.post(`/downloads/${workflow.id}`);
      const jsonString = JSON.stringify(response.data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workflow.title.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      track(EVENTS.downloadClick, {
        id: workflow.id,
        slug: workflow.slug,
        tier: isPremium ? 'premium' : 'free',
        result: 'ok',
      });
    } catch (error) {
      console.error('Download failed:', error);
      const status = (error as ApiError)?.response?.status;
      const serverMessage = (error as ApiError)?.response?.data?.message;
      track(EVENTS.downloadClick, {
        id: workflow.id,
        slug: workflow.slug,
        tier: isPremium ? 'premium' : 'free',
        result: status === 401 ? 'denied' : status === 403 ? 'capped' : 'error',
      });
      if (status === 401) {
        alert(serverMessage || 'Please sign in to download this workflow.');
      } else if (status === 403) {
        alert(serverMessage || 'Download limit reached. Sign in to keep downloading.');
      } else {
        alert('Download failed. Please try again.');
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = () => {
    if (!workflow) return;
    const jsonString = JSON.stringify(workflow.workflow, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRate = async (rating: number) => {
    if (!workflow || !isAuthenticated) return;
    try {
      await api.post(`/workflows/${workflow.id}/rate`, { rating });
      window.location.reload();
    } catch (error) {
      console.error('Rating failed:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  const statRow = (label: string, value: React.ReactNode) => (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-fg-subtle text-sm">{label}</span>
      <span className="font-medium text-fg text-sm">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-bg text-fg">
      <SiteHeader />

      {/* Hero */}
      <div className="border-b border-border grid-backdrop">
        <div className="container mx-auto px-6 pt-10 pb-14">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-fg-subtle mb-6 flex-wrap"
          >
            <Link href="/" className="hover:text-fg transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/workflows" className="hover:text-fg transition-colors">Workflows</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={categoryHref(workflow.category)} className="hover:text-fg transition-colors">
              {workflow.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-fg-muted truncate max-w-[16rem]">{workflow.title}</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-5 text-xs">
              <span className="px-2.5 py-1 rounded-full font-medium bg-primary-soft text-primary border border-primary/20">
                {workflow.category}
              </span>
              <span className="px-2.5 py-1 rounded-full font-medium bg-surface-2 text-fg-muted border border-border capitalize">
                {workflow.complexity}
              </span>
              {isPremium && (
                <span className="px-2.5 py-1 rounded-full font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                  PREMIUM
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-5 leading-tight">
              {workflow.title}
            </h1>
            <p className="text-lg text-fg-muted leading-relaxed max-w-2xl">
              {workflow.shortDescription}
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main content */}
          <div className="lg:col-span-8 space-y-10">
            <Reveal>
              <h2 className="text-lg font-semibold mb-4">Workflow preview</h2>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="h-[320px] bg-surface relative">
                  {workflow.workflow ? (
                    <WorkflowPreview
                      workflow={workflow.workflow || { nodes: [], connections: {} }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center px-6 gap-2">
                      <Lock className="w-6 h-6 text-fg-subtle" />
                      <p className="text-fg-muted text-sm">
                        The full workflow unlocks with Pro or Lifetime access.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>

            {workflow.setupSteps && workflow.setupSteps.length > 0 && (
              <Reveal>
                <h2 className="text-lg font-semibold mb-4">Setup guide</h2>
                <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                  {workflow.setupSteps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-semibold border border-primary/20">
                        {index + 1}
                      </div>
                      <p className="text-fg-muted leading-relaxed pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {workflow.detailedDescription && (
              <Reveal>
                <h2 className="text-lg font-semibold mb-4">Details</h2>
                <div className="bg-card border border-border rounded-2xl p-6 text-fg-muted leading-relaxed whitespace-pre-line">
                  {workflow.detailedDescription}
                </div>
              </Reveal>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              {isPremium && (
                <div className="mb-5 flex items-center gap-2 text-sm">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                    PREMIUM
                  </span>
                  {hasAccess ? (
                    <span className="text-success">Included in your plan</span>
                  ) : (
                    <span className="text-fg-subtle">Pro or Lifetime required</span>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3 mb-6">
                {locked ? (
                  <Link
                    href="/coming-soon"
                    className="w-full flex items-center justify-center px-4 py-3.5 bg-primary hover:bg-primary-hover text-primary-fg rounded-xl font-semibold transition-colors active:scale-[0.99]"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Unlock premium
                  </Link>
                ) : (
                  <>
                    {workflow.workflow && (
                      <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-center px-4 py-3.5 bg-primary hover:bg-primary-hover text-primary-fg rounded-xl font-semibold transition-colors active:scale-[0.99] group"
                      >
                        {copied ? (
                          <Tag className="w-5 h-5 mr-2" />
                        ) : (
                          <Share2 className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                        )}
                        {copied ? 'Copied!' : 'Copy Workflow JSON'}
                      </button>
                    )}
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="w-full flex items-center justify-center px-4 py-3.5 border border-border bg-surface hover:bg-surface-2 text-fg rounded-xl font-medium transition-colors active:scale-[0.99] disabled:opacity-60"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {downloading ? 'Preparing…' : 'Download JSON'}
                    </button>
                  </>
                )}
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between py-2.5 border-b border-border">
                  <span className="text-fg-subtle text-sm">Rating</span>
                  <span className="font-medium text-fg text-sm flex items-center">
                    {workflow.ratingAverage || '0.0'}
                    <Star className="w-3.5 h-3.5 ml-1 text-amber-500 fill-current" />
                    <span className="text-fg-subtle ml-1">
                      ({workflow.ratingCount || 0})
                    </span>
                  </span>
                </div>
                {statRow('Downloads', workflow.downloadsCount)}
                {statRow('Views', workflow.viewsCount)}
                {statRow('Updated', new Date(workflow.updated).toLocaleDateString())}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between">
                    <span className="text-fg-subtle text-sm">Rate this</span>
                    <RatingInput currentRating={0} onRate={handleRate} />
                  </div>
                ) : (
                  <p className="text-xs text-fg-subtle">Sign in to rate this workflow.</p>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-xs font-semibold text-fg-subtle uppercase tracking-wider mb-3">
                  Nodes used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(showAllNodes
                    ? workflow.nodes
                    : workflow.nodes.slice(0, INITIAL_NODE_LIMIT)
                  ).map((node) => (
                    <span
                      key={node}
                      className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 bg-surface border border-border rounded-lg text-xs text-fg-muted"
                    >
                      <span className="w-4 h-4 flex items-center justify-center">
                        {getNodeIcon(node, 16)}
                      </span>
                      {node}
                    </span>
                  ))}
                  {workflow.nodes.length > INITIAL_NODE_LIMIT && (
                    <button
                      onClick={() => setShowAllNodes(!showAllNodes)}
                      className="px-2.5 py-1 border border-border rounded-lg text-xs text-primary hover:bg-primary-soft transition-colors"
                    >
                      {showAllNodes
                        ? 'Show less'
                        : `+${workflow.nodes.length - INITIAL_NODE_LIMIT} more`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {related && related.length > 0 && (
          <Reveal className="mt-16">
            <h2 className="text-lg font-semibold mb-6">Related workflows</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 6).map((rec) => (
                <Link
                  key={rec._id}
                  href={`/workflow/${rec.slug}`}
                  className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary-soft text-primary border border-primary/20">
                      {rec.category}
                    </span>
                    {rec.isPremium && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                        PREMIUM
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
                    {rec.title}
                  </h3>
                  <p className="text-sm text-fg-muted line-clamp-2 leading-relaxed">
                    {rec.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </Reveal>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
