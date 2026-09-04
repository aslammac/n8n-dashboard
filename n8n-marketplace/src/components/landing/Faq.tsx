"use client";

import React, { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { track, EVENTS } from "@/lib/analytics";

// TODO: review wording with product owner.
const FAQ: { q: string; a: string }[] = [
  {
    q: "What is FlowStore?",
    a: "FlowStore is a marketplace for automation workflows. Each listing is a real, importable n8n workflow you can preview on an interactive canvas and download as JSON.",
  },
  {
    q: "Do I need an account to download workflows?",
    a: "No. Free workflows download without an account, subject to a per-IP monthly limit. Premium workflows require a signed-in account with Pro or Lifetime access.",
  },
  {
    q: "How do I use a workflow after downloading it?",
    a: "Open your n8n instance, choose Import from File (or paste the JSON), then add your own credentials for each connected app. The setup guide on each workflow page lists what you need.",
  },
  {
    q: "What does premium unlock?",
    a: "Premium is account-level: a Pro subscription or a one-time Lifetime purchase unlocks the full JSON for every premium workflow, not just one.",
  },
  {
    q: "Can I publish my own workflows?",
    a: "Yes. Signed-in users can submit workflows; they are analysed for category, complexity and node list, then published to the marketplace.",
  },
  {
    q: "Are the workflows verified?",
    a: "Workflows are community-contributed and reviewed for structure and metadata. Always read the node list and setup steps, and test in a non-production n8n environment first.",
  },
];

export default function Faq() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section id="faq" className="section border-b border-border" aria-labelledby="faq-title">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-6 max-w-3xl">
        <Reveal>
          <p className="text-sm font-medium text-primary mb-3">FAQ</p>
          <h2 id="faq-title" className="text-2xl md:text-3xl font-semibold tracking-tight">
            Questions, answered.
          </h2>
        </Reveal>

        <div className="mt-10 divide-y divide-border border-y border-border">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  onClick={() => {
                    const next = isOpen ? null : i;
                    setOpen(next);
                    if (next === i) track(EVENTS.faqOpened, { question: item.q });
                  }}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-fg-subtle transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm text-fg-muted leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
