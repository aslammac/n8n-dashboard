"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { track, EVENTS } from "@/lib/analytics";

export default function FinalCta() {
  return (
    <section className="section" aria-labelledby="cta-title">
      <div className="container mx-auto px-6">
        <Reveal className="rounded-3xl border border-border bg-card grid-backdrop px-8 py-14 md:py-20 text-center">
          <h2 id="cta-title" className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Start automating with a head start.
          </h2>
          <p className="text-fg-muted max-w-md mx-auto mb-8">
            Thousands of production-ready automations, one search away.
          </p>
          <Link
            href="/workflows"
            onClick={() => track(EVENTS.ctaClicked, { location: "final_cta" })}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-primary-fg font-medium rounded-full transition-colors"
          >
            Browse workflows
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
