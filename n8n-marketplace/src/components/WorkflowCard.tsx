import React from 'react';
import Link from 'next/link';
import { ArrowDownToLine, Lock, Workflow } from 'lucide-react';
import { WorkflowMetadata } from '@/types/workflow';
import { getNodeIcon } from '@/utils/nodeIcons';

interface WorkflowCardProps {
  workflow: WorkflowMetadata;
}

/**
 * One accent colour per category. Used lightly — a tinted top glow, the kicker,
 * the icon chip and the complexity meter — over a clean themed card surface.
 * Keys match `data/categories.ts` labels.
 */
const CATEGORY_ACCENT: Record<string, string> = {
  'AI & ML': '#7c3aed',
  Marketing: '#e11d48', 
  Sales: '#0d9488',
  'Data Processing': '#2563eb',
  Productivity: '#ea580c',
  Integration: '#4338ca',
  Communication: '#0284c7',
  'E-commerce': '#dc2626',
  Finance: '#16a34a',
  HR: '#a21caf',
  Other: '#475569',
};

const DEFAULT_ACCENT = CATEGORY_ACCENT.Other;
const LEVELS = ['beginner', 'intermediate', 'advanced'];

function prettyNode(key: string): string {
  const tail = key.split(/[./]/).pop() || key;
  return tail
    .replace(/Trigger$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  const uniqueNodes = Array.from(new Set(workflow.nodes));
  const chipNodes = uniqueNodes.slice(0, 3);
  const moreNodes = uniqueNodes.length - chipNodes.length;
  const nodeCount = workflow.nodeCount || uniqueNodes.length;
  const accent = CATEGORY_ACCENT[workflow.category] || DEFAULT_ACCENT;
  const levelIdx = Math.max(0, LEVELS.indexOf(workflow.complexity));
  const rating = workflow.ratingAverage || 0;
  const downloads = workflow.downloadsCount || 0;

  return (
    <Link
      href={`/workflow/${workflow.slug}`}
      className="group relative flex aspect-[4.5/5] flex-col overflow-hidden rounded-[22px] border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_44px_-24px_rgba(0,0,0,0.35)]"
    >
      {/* soft category tint, top */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background: `radial-gradient(120% 80% at 50% -30%, ${accent}22 0%, transparent 150%)`,
        }}
      />

      {/* top bar */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-[7px]"
            style={{ backgroundColor: `${accent}1f`, color: accent }}
          >
            <Workflow className="h-3.5 w-3.5" />
          </span>
          <span
            className="font-mono text-[11px] font-medium uppercase tracking-[0.14em]"
            style={{ color: accent }}
          >
            {workflow.category}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-medium capitalize text-fg-muted">
          {workflow.isPremium && <Lock className="h-3 w-3" />}
          {workflow.isPremium ? 'Premium' : workflow.complexity}
        </span>
      </div>

      {/* node chips */}
      <div className="relative z-10 mt-5 flex flex-col gap-2">
        {chipNodes.map((node, i) => (
          <span key={i} className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2">
              {getNodeIcon(node, 12)}
            </span>
            <span className="min-w-0 truncate font-mono text-[11px] text-fg-muted">
              {prettyNode(node)}
            </span>
          </span>
        ))}
        {moreNodes > 0 && (
          <span className="pl-[34px] font-mono text-[11px] text-fg-subtle">
            +{moreNodes} more
          </span>
        )}
      </div>

      {/* title block */}
      <div className="relative z-10 mt-auto pt-6">
        <h3 className="text-[24px] font-semibold leading-[1.08] tracking-tight text-fg [text-wrap:balance] line-clamp-3">
          {workflow.title}
        </h3>
        <p className="mt-2 line-clamp-2 font-mono text-[12px] italic text-fg-muted">
          {workflow.shortDescription}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span
            className="flex items-center gap-1"
            aria-label={`Complexity: ${workflow.complexity}`}
          >
            {LEVELS.map((_, i) => (
              <span
                key={i}
                className="h-1 w-6 rounded-full"
                style={{
                  backgroundColor: i <= levelIdx ? accent : 'var(--border-strong)',
                }}
              />
            ))}
          </span>
          {(downloads > 0 || rating > 0) && (
            <span className="flex items-center gap-3 font-mono text-[12px] text-fg-muted">
              {downloads > 0 && (
                <span className="flex items-center gap-1">
                  <ArrowDownToLine className="h-3.5 w-3.5" />
                  {downloads.toLocaleString('en-US')}
                </span>
              )}
              {rating > 0 && <span>{rating.toFixed(1)}★</span>}
            </span>
          )}
        </div>

        <p className="mt-3 font-mono text-[11px] text-fg-subtle">
          {nodeCount.toString().padStart(2, '0')} nodes
        </p>
      </div>
    </Link>
  );
}
