"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useEntrance } from "@/components/motion/useEntrance";

const BULLETS = [
  "Thousands of production-ready automations",
  "Preview every workflow on an interactive canvas",
  "Import in seconds — free workflows need no card",
];

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** small print under the card, e.g. the sign-in / sign-up switch link */
  footer?: React.ReactNode;
}

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  const animate = useEntrance();
  const enter = animate
    ? {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
      }
    : {};

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg text-fg">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-border grid-backdrop">
        <Link href="/" className="text-xl font-semibold tracking-tight relative z-10">
          <span className="text-primary">Flow</span>
          <span>Store</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="text-2xl font-semibold tracking-tight mb-6">
            The marketplace for automation workflows.
          </h2>
          <ul className="space-y-3">
            {BULLETS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-fg-muted">
                <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-primary-soft text-primary border border-primary/20 flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* TODO: swap for a real testimonial */}
        <figure className="relative z-10 max-w-md">
          <blockquote className="text-sm text-fg leading-relaxed">
            &ldquo;I stopped rebuilding the same flow for every client. Grab it, swap
            credentials, done.&rdquo;
          </blockquote>
          <figcaption className="mt-2 text-xs text-fg-subtle">
            Placeholder Name — Automation consultant
          </figcaption>
        </figure>
      </div>

      {/* Form panel */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-6 h-16 border-b border-border lg:border-0">
          <Link href="/" className="text-lg font-semibold tracking-tight lg:hidden">
            <span className="text-primary">Flow</span>
            <span>Store</span>
          </Link>
          <span className="hidden lg:block" />
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div {...enter} className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-fg-muted">{subtitle}</p>}
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
              {children}
            </div>

            {footer && (
              <p className="mt-6 text-center text-sm text-fg-muted">{footer}</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
