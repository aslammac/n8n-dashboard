"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, Search, Brain, Workflow, DatabaseZap,
  MessageSquareCode, Cpu, Globe, CalendarDays, Zap,
} from "lucide-react";
import CountUp from "@/components/motion/CountUp";
import { useEntrance } from "@/components/motion/useEntrance";
import { track, EVENTS } from "@/lib/analytics";
import { CATEGORIES } from "@/data/categories";
import { SITE } from "@/data/site";

type HeroMode = "marketplace" | "services";

interface HeroStats {
  workflows: number;
  integrations: number;
  downloads?: number;
}

const SERVICES = [
  { icon: Brain,              title: "Custom AI Agents",       desc: "Autonomous agents on GPT-4o, Claude & Gemini",   color: "text-violet-300", bg: "bg-violet-500/15" },
  { icon: DatabaseZap,        title: "RAG & Knowledge AI",     desc: "AI search over your private docs & databases",   color: "text-emerald-300", bg: "bg-emerald-500/15" },
  { icon: MessageSquareCode,  title: "AI Chatbots",            desc: "Intelligent bots trained on your data",          color: "text-amber-300",  bg: "bg-amber-500/15"  },
  { icon: Workflow,           title: "Automation Pipelines",   desc: "LLMs + n8n, Make, Zapier & Python",             color: "text-sky-300",    bg: "bg-sky-500/15"    },
  { icon: Cpu,                title: "LLM Fine-tuning",        desc: "Domain models with eval & monitoring",          color: "text-pink-300",   bg: "bg-pink-500/15"   },
  { icon: Globe,              title: "AI API & Backend",       desc: "Production-ready AI microservices",             color: "text-orange-300", bg: "bg-orange-500/15" },
];

const USE_CASES = [
  "Lead Scoring Agent", "Customer Support Bot", "Document Extraction",
  "Knowledge Base AI", "Sales Automation", "HR Onboarding Flow",
  "Contract Analysis", "Email Triage Agent", "Inventory Automation", "Data Pipeline AI",
];

export default function LandingHero({ stats }: { stats: HeroStats }) {
  const router = useRouter();
  const animateIn = useEntrance();
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<HeroMode>("marketplace");
  const isServices = mode === "services";

  const go = () => {
    const term = q.trim();
    track(EVENTS.ctaClicked, { location: "hero_search", query: term || null });
    router.push(term ? `/workflows?q=${encodeURIComponent(term)}` : "/workflows");
  };

  const fade = (delay: number) =>
    animateIn
      ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const } }
      : {};

  return (
    <section className="relative overflow-hidden border-b border-border" style={{ minHeight: "92vh" }}>

      {/* ── Cinematic background ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base dark layer */}
        <div className="absolute inset-0 bg-bg" />

        {/* Marketplace: warm amber / primary glow at bottom, cool at top */}
        <AnimatePresence>
          {!isServices && (
            <motion.div
              key="marketplace-bg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="absolute inset-0"
            >
              {/* top cool teal tint */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-primary/12 to-transparent" />
              {/* bottom warm amber glow */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-amber-500/8 to-transparent" />
              {/* central glow orb */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Services: deep violet theme */}
        <AnimatePresence>
          {isServices && (
            <motion.div
              key="services-bg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-violet-950/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-purple-900/15 to-transparent" />
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-violet-600/12 blur-[140px]" />
              <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] rounded-full bg-purple-500/8 blur-[100px]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--bg)_100%)]" style={{ "--bg": "hsl(var(--bg))" } as React.CSSProperties} />
      </div>

      {/* ── Content ── */}
      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center justify-center text-center pt-28 pb-24  md:pb-32" style={{ minHeight: "92vh" }}>

        {/* Mode toggle pill */}
        {/* <motion.div {...fade(0)} className="mb-12">
          <div className={`inline-flex items-center rounded-full p-1 border transition-colors duration-700 shadow-lg ${
            isServices
              ? "bg-violet-950/60 border-violet-500/30 shadow-violet-500/10"
              : "bg-surface/80 border-border shadow-black/10"
          }`}>
            <button
              onClick={() => setMode("marketplace")}
              className={`relative px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-400 ${
                !isServices
                  ? "bg-primary text-primary-fg shadow-md shadow-primary/30"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              Workflow Marketplace
            </button>
            <button
              onClick={() => setMode("services")}
              className={`relative px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-400 ${
                isServices
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/40"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              Custom AI &amp; Services
            </button>
          </div>
        </motion.div> */}

        {/* ── Animated content per mode ── */}
        <AnimatePresence mode="wait">
          {!isServices ? (
            /* ───── MARKETPLACE ───── */
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-3xl"
            >
              {/* <motion.span
                {...fade(0.05)}
                className="inline-flex items-center px-3 py-1 rounded-full bg-surface/80 backdrop-blur border border-border text-xs font-medium text-fg-muted mb-7"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 animate-pulse" />
                The automation library
              </motion.span> */}

              <motion.h1
                {...fade(0.1)}
                className="text-5xl md:text-6xl lg:text-[72px] font-extralight tracking-tight leading-[1.06] mb-6"
              >
                The automation you need
                <br />
                <span className="font-serif italic text-gradient text-[1.04em]">
                  is already built.
                </span>
              </motion.h1>

              <motion.p {...fade(0.15)} className="text-lg text-fg-muted mb-10 max-w-xl mx-auto leading-relaxed">
                Platform for ai workflows, automation templates and AI agents.
              </motion.p>

              {/* Search box */}
              <motion.div
                {...fade(0.2)}
                className="max-w-xl mx-auto flex items-center gap-2 bg-card/80 backdrop-blur border border-border rounded-full p-2 pl-5 focus-within:border-primary/60 transition-all shadow-xl shadow-black/10 mb-12"
              >
                <Search className="w-4 h-4 text-fg-subtle shrink-0" />
                <input
                  type="text"
                  placeholder="Search Shopify, Slack, OpenAI, CRM…"
                  className="w-full bg-transparent border-none text-fg placeholder:text-fg-subtle focus:outline-none px-2 py-1.5 text-sm"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && go()}
                  aria-label="Search workflows"
                />
                <button
                  onClick={go}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-primary-fg font-semibold rounded-full transition-colors shrink-0 flex items-center gap-1.5 text-sm"
                >
                  Search <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>

              {/* Stats */}
              {stats.workflows > 0 && (
                <motion.dl {...fade(0.25)} className="grid grid-cols-3 gap-8 max-w-sm mx-auto">
                  {[
                    { label: "Workflows",    value: stats.workflows,    suffix: ""  },
                    { label: "Integrations", value: stats.integrations, suffix: "+" },
                    { label: "Categories",   value: CATEGORIES.length,  suffix: ""  },
                  ].map((s) => (
                    <div key={s.label}>
                      <dd className="font-mono text-3xl font-semibold tracking-tight">
                        <CountUp value={s.value} suffix={s.suffix} />
                      </dd>
                      <dt className="text-[11px] uppercase tracking-widest text-fg-subtle mt-1.5">
                        {s.label}
                      </dt>
                    </div>
                  ))}
                </motion.dl>
              )}
            </motion.div>

          ) : (
            /* ───── SERVICES ───── */
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-4xl"
            >
              <motion.span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 text-xs font-semibold text-violet-300 mb-7"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
              >
                <Zap className="w-3 h-3" /> Custom AI &amp; Automation
              </motion.span>

              <motion.h1
                className="text-5xl md:text-6xl lg:text-[72px] font-semibold tracking-tight leading-[1.06] mb-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
              >
                We build custom
                <br />
                <span className="font-serif italic font-normal text-[1.04em] bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
                  AI systems.
                </span>
              </motion.h1>

              <motion.p
                className="text-lg text-fg-muted mb-8 max-w-lg mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.12 }}
              >
                Agents, RAG pipelines, LLM backends, automation — scoped, built,
                and delivered for your exact business needs.
              </motion.p>

              {/* Services 2×3 grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-7">
                {SERVICES.map((s, i) => (
                  <motion.div
                    key={i}
                    className="rounded-xl border border-white/8 bg-white/4 backdrop-blur-sm p-4 text-left hover:border-violet-400/30 hover:bg-white/6 transition-all cursor-default group"
                    initial={{ opacity: 0, scale: 0.88, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.14 + i * 0.055, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform`}>
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <p className="text-xs font-semibold text-fg mb-0.5">{s.title}</p>
                    <p className="text-[10px] text-fg-subtle leading-relaxed">{s.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Use-case pill buttons */}
              <motion.div
                className="flex flex-wrap justify-center gap-2 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                {USE_CASES.map((uc, i) => (
                  <motion.button
                    key={uc}
                    className="px-3.5 py-1.5 text-xs font-medium rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300 hover:bg-violet-500/22 hover:border-violet-400/40 hover:scale-105 transition-all duration-200"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.48 + i * 0.028 }}
                    onClick={() => track(EVENTS.ctaClicked, { location: "hero_use_case", label: uc })}
                  >
                    {uc}
                  </motion.button>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
              >
                <a
                  href={SITE.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="services-hero-demo-cta"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-full transition-all duration-200 shadow-xl shadow-violet-600/30 hover:shadow-violet-500/50 hover:scale-[1.03]"
                  onClick={() => track(EVENTS.ctaClicked, { location: "hero_services_demo" })}
                >
                  <CalendarDays className="w-4 h-4" />
                  Book a free scoping call
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <p className="text-xs text-fg-subtle mt-3 tracking-wide">
                  No commitment &nbsp;·&nbsp; NDA available &nbsp;·&nbsp; Fixed-price quotes
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
