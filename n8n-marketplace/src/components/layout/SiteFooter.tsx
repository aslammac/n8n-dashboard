import React from "react";
import Link from "next/link";
import { BookText, Github, Linkedin, type LucideIcon } from "lucide-react";
import { MAKER_PROFILES, SITE } from "@/data/site";
import { CATEGORIES, categoryHref } from "@/data/categories";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Browse workflows", href: "/workflows" },
      { label: "Popular this month", href: "/workflows?sort=downloads" },
      { label: "Pricing", href: "/coming-soon" },
    ],
  },
  {
    title: "Categories",
    links: CATEGORIES.slice(0, 6).map((c) => ({
      label: c.label,
      href: categoryHref(c.label),
    })),
  },
  {
    title: "Resources",
    links: [
      { label: "What is n8n?", href: "https://n8n.io" },
      { label: "FAQ", href: "/#faq" },
      { label: "Sitemap", href: "/sitemap.xml" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/coming-soon" },
      { label: "Privacy", href: "/coming-soon" },
      { label: "Terms", href: "/coming-soon" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-1">
            <span className="text-lg font-semibold tracking-tight">
              <span className="text-primary">Flow</span>
              <span>Store</span>
            </span>
            <p className="mt-3 text-sm text-fg-muted leading-relaxed max-w-xs">
              Production-ready automation workflows, built by the community and
              vetted by experts.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle mb-3">
                {col.title}
              </h2>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-fg-muted hover:text-fg transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-fg-subtle">
            Built by{" "}
            <span className="text-fg-muted font-medium">{SITE.maker.name}</span>
          </p>
          <div className="flex items-center gap-2">
            {MAKER_PROFILES.map((p) => {
              const icons: Record<string, LucideIcon> = {
                LinkedIn: Linkedin,
                GitHub: Github,
                Medium: BookText,
              };
              const Icon = icons[p.label] ?? Github;
              return (
                <a
                  key={p.label}
                  href={p.href}
                  target="_blank"
                  rel="me noopener noreferrer"
                  aria-label={p.label}
                  className="p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
