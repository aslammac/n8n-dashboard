import React from "react";
import { Search, Workflow, Download } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

const STEPS = [
  {
    icon: Search,
    title: "Search the marketplace",
    body: "Find a workflow by the app you use — Slack, Shopify, OpenAI, Postgres — or by outcome, like lead routing or report generation.",
  },
  {
    icon: Workflow,
    title: "Preview it on the canvas",
    body: "Every workflow renders as an interactive node graph, so you see exactly what it does and which credentials it needs before you commit.",
  },
  {
    icon: Download,
    title: "Import into n8n",
    body: "Download the JSON and drop it into your n8n instance. Free workflows need no account; premium unlocks with Pro or Lifetime.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section border-b border-border" aria-labelledby="how-it-works">
      <div className="container mx-auto px-6">
        <Reveal>
          <p className="text-sm font-medium text-primary mb-3">How it works</p>
          <h2 id="how-it-works" className="text-2xl md:text-3xl font-semibold tracking-tight max-w-lg">
            From search to running automation in three steps.
          </h2>
        </Reveal>

        <Stagger className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <StaggerItem
              key={step.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-primary-soft text-primary border border-primary/20 flex items-center justify-center">
                  <step.icon className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono text-fg-subtle">
                  0{i + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-fg-muted leading-relaxed">{step.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
