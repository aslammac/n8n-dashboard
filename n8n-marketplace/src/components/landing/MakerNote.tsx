import React from "react";
import { BookText, Github, Linkedin, type LucideIcon } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { SITE } from "@/data/site";

const LINKS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "LinkedIn", href: SITE.maker.linkedin, icon: Linkedin },
  { label: "GitHub", href: SITE.maker.github, icon: Github },
  { label: "Medium", href: SITE.maker.medium, icon: BookText },
];

const initials = SITE.maker.name
  .split(" ")
  .map((w) => w[0])
  .slice(0, 2)
  .join("");

export default function MakerNote() {
  return (
    <section className="section border-b border-border" aria-labelledby="maker">
      <div className="container mx-auto px-6">
        <Reveal className="rounded-3xl border border-border bg-card p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary text-lg font-semibold border border-primary/20">
                {initials}
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-fg-subtle">
                  Built by
                </p>
                <h2 id="maker" className="text-xl font-semibold tracking-tight">
                  {SITE.maker.name}
                </h2>
                <p className="text-sm text-fg-muted">
                  Product designer &amp; engineer. FlowStore is a solo project.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-fg-muted transition-colors hover:border-primary/40 hover:text-fg"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
