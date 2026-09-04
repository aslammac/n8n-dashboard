"use client";

import React from "react";
import Link from "next/link";
import {
  Brain,
  MessageSquareCode,
  DatabaseZap,
  Workflow,
  ArrowRight,
  CalendarDays,
  Sparkles,
  Cpu,
  Globe,
  ShieldCheck,
} from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

const SERVICES = [
  {
    icon: Brain,
    title: "Custom AI Agents",
    description:
      "Autonomous agents that reason, plan, and act — integrated into your product or internal tools. Built on GPT-4o, Claude, Gemini, or open-source LLMs.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    tag: "Most popular",
  },
  {
    icon: DatabaseZap,
    title: "RAG & Knowledge Systems",
    description:
      "Retrieval-augmented generation over your private docs, PDFs, databases, or wikis. Give your team an AI that knows your business.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    tag: null,
  },
  {
    icon: MessageSquareCode,
    title: "AI Chatbots & Assistants",
    description:
      "Intelligent chatbots for customer support, internal ops, or sales — deeply trained on your data, not generic templates.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    tag: null,
  },
  {
    icon: Workflow,
    title: "AI-powered Automation",
    description:
      "End-to-end pipelines that combine LLMs with workflow tools (n8n, Make, Zapier, Python) so decisions and actions happen automatically.",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    tag: null,
  },
  {
    icon: Cpu,
    title: "LLM Fine-tuning & Evaluation",
    description:
      "Fine-tune foundation models on your domain data and set up evaluation pipelines to measure and improve accuracy over time.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    tag: null,
  },
  {
    icon: Globe,
    title: "AI API & Backend",
    description:
      "Production-ready AI microservices with auth, rate limiting, logging, and monitoring — deployable anywhere you run infrastructure.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    tag: null,
  },
];

const TECH = [
  "GPT-4o", "Claude 3.5", "Gemini", "Llama 3", "LangChain",
  "LlamaIndex", "n8n", "Make", "Zapier", "Python", "FastAPI", "Pinecone",
];

export default function CustomAutomation() {
  return (
    <section
      className="section border-b border-border"
      aria-labelledby="custom-ai-title"
      id="custom-ai"
    >
      <div className="container mx-auto px-6">

        {/* Header row */}
        <Reveal className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-14">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Custom AI &amp; Automation
            </div>
            <h2
              id="custom-ai-title"
              className="text-2xl md:text-3xl font-semibold tracking-tight"
            >
              We build custom{" "}
              <span className="text-primary">AI systems</span>{" "}
              tailored to your business.
            </h2>
            <p className="mt-3 text-fg-muted leading-relaxed">
              From intelligent agents and RAG pipelines to LLM fine-tuning and full AI backends —
              we scope, design, and ship production-ready AI for your exact use case.
              Automation is just one piece.
            </p>

            {/* Tech stack pills */}
            <div className="mt-5 flex flex-wrap gap-2">
              {TECH.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border border-border bg-card text-fg-subtle font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Book a Demo card */}
          <div className="flex-shrink-0 rounded-2xl border border-primary/30 bg-primary/5 px-7 py-7 flex flex-col items-center text-center gap-4 min-w-[230px]">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Free 30-min scoping call</p>
              <p className="text-xs text-fg-subtle mt-0.5">
                Tell us your problem. We&apos;ll propose a solution.
              </p>
            </div>
            <Link
              href="https://cal.com/flowstore/demo"
              target="_blank"
              rel="noopener noreferrer"
              id="book-demo-cta"
              className="group inline-flex items-center gap-2 w-full justify-center px-5 py-2.5 bg-primary hover:bg-primary-hover text-primary-fg text-sm font-semibold rounded-full transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02]"
            >
              Book a Demo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <div className="text-xs text-fg-subtle flex flex-col gap-1">
              <span className="flex items-center gap-1.5 justify-center">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                NDA available on request
              </span>
            </div>
          </div>
        </Reveal>

        {/* Services grid */}
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <StaggerItem
              key={i}
              className="relative rounded-2xl border border-border bg-card p-5 flex flex-col hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
            >
              {s.tag && (
                <span className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                  {s.tag}
                </span>
              )}
              <div
                className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
              >
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">{s.title}</h3>
              <p className="text-xs text-fg-subtle leading-relaxed">{s.description}</p>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Bottom trust bar */}
        <Reveal className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-fg-subtle">
          {[
            "50+ AI systems delivered",
            "Avg. delivery in 7–14 business days",
            "Any LLM, any cloud",
            "NDA available on request",
          ].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              {item}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
