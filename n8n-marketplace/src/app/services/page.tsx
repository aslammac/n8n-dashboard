import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Brain,
  MessageSquareCode,
  DatabaseZap,
  Workflow,
  Cpu,
  Globe,
  ShieldCheck,
  ArrowRight,
  CalendarDays,
  Sparkles,
  CheckCircle2,
  Star,
} from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Custom AI & Automation Services | FlowStore",
  description:
    "We build custom AI systems — autonomous agents, RAG pipelines, LLM backends, intelligent chatbots, and automation workflows — scoped, designed, and delivered for your business.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Custom AI & Automation Services | FlowStore",
    description:
      "From AI agents and RAG systems to LLM fine-tuning and full automation pipelines — production-ready, delivered fast.",
    type: "website",
    url: `${SITE.url}/services`,
    siteName: "FlowStore",
  },
};

const SERVICES = [
  {
    icon: Brain,
    title: "Custom AI Agents",
    description:
      "Autonomous agents that reason, plan, and act — integrated directly into your product or internal tooling. We work with GPT-4o, Claude 3.5, Gemini, Llama 3, and open-source models.",
    bullets: [
      "Tool-using agents (web search, code execution, APIs)",
      "Multi-agent orchestration with LangChain / LangGraph",
      "Human-in-the-loop approval flows",
      "Structured output & JSON schema enforcement",
    ],
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    tag: "Most popular",
  },
  {
    icon: DatabaseZap,
    title: "RAG & Knowledge Systems",
    description:
      "Give your team an AI that knows your business. We build retrieval-augmented generation systems over your private docs, PDFs, Notion, Confluence, databases, or any custom data source.",
    bullets: [
      "Hybrid search (semantic + keyword)",
      "Chunking, embedding, and reranking pipelines",
      "Pinecone, Weaviate, pgvector, or Chroma",
      "Real-time indexing with incremental updates",
    ],
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    tag: null,
  },
  {
    icon: MessageSquareCode,
    title: "AI Chatbots & Assistants",
    description:
      "Intelligent chatbots for customer support, internal ops, or sales enablement — deeply trained on your data, not off-the-shelf templates.",
    bullets: [
      "Embedded on your website or product",
      "CRM & helpdesk integrations (HubSpot, Zendesk, Intercom)",
      "Handoff to human agents",
      "Conversation analytics & logging",
    ],
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    tag: null,
  },
  {
    icon: Workflow,
    title: "AI-Powered Automation",
    description:
      "End-to-end pipelines that combine LLMs with workflow orchestration (n8n, Make, Zapier, Python) so decisions and actions happen automatically — no human needed.",
    bullets: [
      "Lead enrichment & qualification pipelines",
      "Document processing & data extraction",
      "Multi-step approval & notification flows",
      "Any tool: n8n, Make, Zapier, or custom Python",
    ],
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    tag: null,
  },
  {
    icon: Cpu,
    title: "LLM Fine-tuning & Evaluation",
    description:
      "Fine-tune foundation models on your domain data and set up evaluation pipelines to measure accuracy, latency, and cost — so your AI actually improves over time.",
    bullets: [
      "Supervised fine-tuning (SFT) & RLHF",
      "Dataset curation and annotation pipelines",
      "Eval frameworks: DeepEval, RAGAS, custom",
      "A/B testing between model versions",
    ],
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    tag: null,
  },
  {
    icon: Globe,
    title: "AI API & Backend",
    description:
      "Production-ready AI microservices with auth, rate limiting, logging, and monitoring — deployable on your cloud, self-hosted, or as a standalone API.",
    bullets: [
      "FastAPI / Node.js AI service architecture",
      "Streaming responses & SSE",
      "Observability with LangSmith, Helicone, or custom",
      "Docker & Kubernetes-ready",
    ],
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    tag: null,
  },
];

const TECH = [
  "GPT-4o", "Claude 3.5", "Gemini 1.5", "Llama 3", "Mistral",
  "LangChain", "LangGraph", "LlamaIndex", "Pinecone", "pgvector",
  "n8n", "Make", "Zapier", "Python", "FastAPI", "Next.js",
];

const TESTIMONIALS = [
  {
    quote: "They built us a custom lead-scoring AI agent in 10 days. It reads inbound emails, scores them against our ICP, and routes hot leads straight into HubSpot. We went from 4-hour response times to under 8 minutes.",
    name: "Marcus Holloway",
    role: "Head of RevOps · Clearpath SaaS",
    initials: "MH",
    color: "from-violet-500 to-purple-600",
  },
  {
    quote: "The RAG system they built over our 6,000-page policy documentation is genuinely impressive. Our support team gets accurate answers in seconds instead of digging through Confluence for 20 minutes.",
    name: "Priya Nambiar",
    role: "Head of Customer Success · FinCore",
    initials: "PN",
    color: "from-emerald-500 to-teal-600",
  },
  {
    quote: "We needed an AI pipeline that could extract structured data from unstructured legal contracts at scale. They scoped it, built it, and delivered production-ready code in under 2 weeks. ROI was immediate.",
    name: "James Whitfield",
    role: "CTO · LegalEdge Technologies",
    initials: "JW",
    color: "from-amber-500 to-orange-600",
  },
];

const PROCESS = [
  { step: "01", title: "Free scoping call", desc: "30 minutes. We learn your problem, stack, and goals. You get a clear recommendation — no sales pitch." },
  { step: "02", title: "Proposal & quote", desc: "Within 24 hours you receive a detailed scope, timeline, tech stack, and fixed-price quote." },
  { step: "03", title: "Build & iterate", desc: "We build in tight sprints with weekly demos. You see real progress, not just updates." },
  { step: "04", title: "Handover & support", desc: "Full documentation, source code handover, and optional ongoing maintenance." },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-fg">
      <SiteHeader variant="solid" />
      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="section border-b border-border grid-backdrop" aria-labelledby="services-hero-title">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Custom AI &amp; Automation
              </div>
              <h1
                id="services-hero-title"
                className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08] mb-5"
              >
                We build{" "}
                <span className="font-serif italic font-normal text-gradient text-[1.06em]">
                  AI systems
                </span>{" "}
                that actually work.
              </h1>
              <p className="text-lg text-fg-muted mb-8 max-w-xl mx-auto leading-relaxed">
                From intelligent agents and RAG pipelines to LLM fine-tuning and full automation backends —
                scoped, built, and delivered for your exact business needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={SITE.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="services-hero-cta"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-primary-fg font-semibold rounded-full transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]"
                >
                  <CalendarDays className="w-4 h-4" />
                  Book a free scoping call
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/workflows"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border bg-card hover:bg-surface-2 text-fg text-sm font-medium rounded-full transition-colors"
                >
                  Browse workflow library
                </Link>
              </div>

              {/* Tech pills */}
              <div className="mt-10 flex flex-wrap justify-center gap-2">
                {TECH.map((t) => (
                  <span key={t} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border border-border bg-card text-fg-subtle font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Services ── */}
        <section className="section border-b border-border" aria-labelledby="services-grid-title">
          <div className="container mx-auto px-6">
            <Reveal className="mb-12">
              <p className="text-sm font-medium text-primary mb-2">What we build</p>
              <h2 id="services-grid-title" className="text-2xl md:text-3xl font-semibold tracking-tight max-w-lg">
                Six specialisations. One team.
              </h2>
            </Reveal>
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((s, i) => (
                <StaggerItem
                  key={i}
                  className={`relative rounded-2xl border ${s.border} bg-card p-6 flex flex-col hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group`}
                >
                  {s.tag && (
                    <span className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                      {s.tag}
                    </span>
                  )}
                  <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <s.icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-fg-muted leading-relaxed mb-4">{s.description}</p>
                  <ul className="mt-auto space-y-1.5">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs text-fg-subtle">
                        <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${s.color}`} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="section border-b border-border" aria-labelledby="process-title">
          <div className="container mx-auto px-6">
            <Reveal className="mb-12 text-center">
              <p className="text-sm font-medium text-primary mb-2">How it works</p>
              <h2 id="process-title" className="text-2xl md:text-3xl font-semibold tracking-tight">
                From first call to production — fast.
              </h2>
            </Reveal>
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS.map((p, i) => (
                <StaggerItem key={i} className="rounded-2xl border border-border bg-card p-6">
                  <span className="text-3xl font-mono font-bold text-primary/20">{p.step}</span>
                  <h3 className="text-sm font-semibold mt-3 mb-1.5">{p.title}</h3>
                  <p className="text-xs text-fg-subtle leading-relaxed">{p.desc}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="section border-b border-border" aria-labelledby="services-testimonials-title">
          <div className="container mx-auto px-6">
            <Reveal className="mb-12">
              <p className="text-sm font-medium text-primary mb-2">Client results</p>
              <h2 id="services-testimonials-title" className="text-2xl md:text-3xl font-semibold tracking-tight max-w-lg">
                Built for teams who need results, not experiments.
              </h2>
            </Reveal>
            <Stagger className="grid gap-5 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <StaggerItem key={i} className="rounded-2xl border border-border bg-card p-6 flex flex-col hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-fg leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-5 pt-4 border-t border-border flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-fg-subtle">{t.role}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="section" aria-labelledby="services-cta-title">
          <div className="container mx-auto px-6">
            <Reveal className="rounded-3xl border border-border bg-card grid-backdrop px-8 py-14 md:py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6">
                <CalendarDays className="w-7 h-7 text-primary" />
              </div>
              <h2 id="services-cta-title" className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
                Ready to build something?
              </h2>
              <p className="text-fg-muted max-w-md mx-auto mb-8">
                Book a free 30-minute scoping call. Tell us your problem — we&apos;ll come back with a clear proposal and fixed price.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                <Link
                  href={SITE.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="services-bottom-cta"
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-primary-fg font-semibold rounded-full transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]"
                >
                  <CalendarDays className="w-4 h-4" />
                  Book a free scoping call
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-fg-subtle">
                {["No commitment", "NDA available", "Fixed-price quotes", "Avg. delivery 7–14 days"].map((i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />{i}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
