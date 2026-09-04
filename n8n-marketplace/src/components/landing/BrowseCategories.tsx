import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Megaphone,
  TrendingUp,
  Database,
  Zap,
  Plug,
  MessageSquare,
  ShoppingCart,
  Wallet,
  Users,
  Boxes,
  type LucideIcon,
} from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { CATEGORIES, categoryHref } from "@/data/categories";

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Megaphone,
  TrendingUp,
  Database,
  Zap,
  Plug,
  MessageSquare,
  ShoppingCart,
  Wallet,
  Users,
  Boxes,
};

export default function BrowseCategories() {
  return (
    <section className="section border-b border-border" aria-labelledby="categories">
      <div className="container mx-auto px-6">
        <Reveal>
          <p className="text-sm font-medium text-primary mb-3">Categories</p>
          <h2 id="categories" className="text-2xl md:text-3xl font-semibold tracking-tight max-w-lg">
            Start from the kind of automation you need.
          </h2>
        </Reveal>

        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const Icon = ICONS[cat.icon] ?? Boxes;
            return (
              <StaggerItem key={cat.label}>
                <Link
                  href={categoryHref(cat.label)}
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors h-full"
                >
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-surface-2 text-fg-muted group-hover:bg-primary-soft group-hover:text-primary border border-border group-hover:border-primary/20 flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span>
                    <span className="block font-medium group-hover:text-primary transition-colors">
                      {cat.label}
                    </span>
                    <span className="block text-sm text-fg-muted mt-0.5 leading-relaxed">
                      {cat.blurb}
                    </span>
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
