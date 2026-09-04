"use client";

import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Quote } from "lucide-react";

const QUOTES = [
  {
    quote: "FlowStore cut our onboarding setup from 3 days to 2 hours. Grabbed the HubSpot-to-Slack workflow, swapped credentials, and it was live before lunch.",
    name: "Marcus Holloway",
    role: "Head of RevOps · Clearpath SaaS",
    initials: "MH",
    color: "from-violet-500 to-purple-600",
  },
  {
    quote: "I bill by value, not hours. FlowStore lets me deliver polished automations to clients in a fraction of the time. The canvas preview alone saves me from nasty surprises mid-deployment.",
    name: "Priya Nambiar",
    role: "Freelance Automation Consultant",
    initials: "PN",
    color: "from-emerald-500 to-teal-600",
  },
  {
    quote: "We deployed our entire lead enrichment pipeline in an afternoon. ROI was immediate — saving $4k/month on manual data entry. Can't recommend it enough.",
    name: "James Whitfield",
    role: "Growth Engineer · Modera Labs",
    initials: "JW",
    color: "from-amber-500 to-orange-600",
  },
  {
    quote: "Nothing comes close to the depth here. The AI agent flows are genuinely production-grade — not toy examples you'd find elsewhere.",
    name: "Sophia Chen",
    role: "Product Manager · Nexus AI",
    initials: "SC",
    color: "from-pink-500 to-rose-600",
  },
];

// Each card gets its own scatter: rotation + entry direction
const SCATTER = [
  { rotate: -3,   initial: { x: -60, y: 40,  rotate: -8,  opacity: 0 } },
  { rotate:  2,   initial: { x:  40, y: -50, rotate:  6,  opacity: 0 } },
  { rotate: -1.5, initial: { x:  60, y:  30, rotate:  5,  opacity: 0 } },
  { rotate:  3,   initial: { x: -40, y: -40, rotate: -7,  opacity: 0 } },
];

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      className="section border-b border-border overflow-hidden"
      aria-labelledby="testimonials-title"
    >
      <div className="container mx-auto px-6" ref={ref}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <p className="text-sm font-medium text-primary mb-3">Loved by builders</p>
          <h2 id="testimonials-title" className="text-2xl md:text-3xl font-semibold tracking-tight max-w-xl">
            Teams ship faster when they don&apos;t start from scratch.
          </h2>
        </motion.div>

        {/* Scattered card grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {QUOTES.map((t, i) => {
            const s = SCATTER[i];
            return (
              <motion.div
                key={i}
                initial={s.initial}
                animate={inView ? { x: 0, y: 0, rotate: s.rotate, opacity: 1 } : s.initial}
                transition={{
                  duration: 0.7,
                  delay: 0.1 + i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ rotate: 0, y: -6, scale: 1.02, transition: { duration: 0.25 } }}
                className="rounded-2xl border border-border bg-card p-5 flex flex-col cursor-default shadow-sm hover:shadow-lg hover:shadow-primary/8 hover:border-primary/30 transition-shadow"
                style={{ transformOrigin: "center bottom" }}
              >
                <Quote className="w-5 h-5 text-primary/25 mb-3 flex-shrink-0" />
                <p className="text-sm text-fg leading-relaxed flex-1 mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight">{t.name}</p>
                    <p className="text-[10px] text-fg-subtle mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
