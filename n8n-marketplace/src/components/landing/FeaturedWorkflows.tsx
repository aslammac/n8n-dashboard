import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import WorkflowCard from "@/components/WorkflowCard";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import type { WorkflowMetadata } from "@/types/workflow";

export default function FeaturedWorkflows({
  workflows,
}: {
  workflows: WorkflowMetadata[];
}) {
  if (!workflows.length) return null;

  return (
    <section className="section border-b border-border" aria-labelledby="featured">
      <div className="container mx-auto px-6">
        <Reveal className="flex items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-sm font-medium text-primary mb-3">Featured</p>
            <h2 id="featured" className="text-2xl md:text-3xl font-semibold tracking-tight">
              Most-downloaded workflows this month
            </h2>
          </div>
          <Link
            href="/workflows"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg transition-colors shrink-0"
          >
            Browse all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>

        <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((wf) => (
            <StaggerItem key={wf.slug}>
              <WorkflowCard workflow={wf} />
            </StaggerItem>
          ))}
        </Stagger>

        <Link
          href="/workflows"
          className="sm:hidden mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          Browse all workflows
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
