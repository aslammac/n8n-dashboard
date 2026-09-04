import React from "react";
import Link from "next/link";
import { getNodeIcon } from "@/utils/nodeIcons";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

// key = manifest icon key, label = display + search term.
const INTEGRATIONS: { key: string; label: string }[] = [
  { key: "openAi", label: "OpenAI" },
  { key: "slack", label: "Slack" },
  { key: "googleSheets", label: "Google Sheets" },
  { key: "gmail", label: "Gmail" },
  { key: "notion", label: "Notion" },
  { key: "airtable", label: "Airtable" },
  { key: "hubspot", label: "HubSpot" },
  { key: "discord", label: "Discord" },
  { key: "telegram", label: "Telegram" },
  { key: "github", label: "GitHub" },
  { key: "postgres", label: "Postgres" },
  { key: "stripe", label: "Stripe" },
  { key: "shopify", label: "Shopify" },
  { key: "googleDrive", label: "Google Drive" },
];

export default function PopularIntegrations() {
  return (
    <section className="section border-b border-border" aria-labelledby="integrations">
      <div className="container mx-auto px-6">
        <Reveal>
          <p className="text-sm font-medium text-primary mb-3">Integrations</p>
          <h2 id="integrations" className="text-2xl md:text-3xl font-semibold tracking-tight max-w-lg">
            Workflows for the tools you already run on.
          </h2>
        </Reveal>

        <Stagger className="mt-10 flex flex-wrap gap-3">
          {INTEGRATIONS.map((it) => (
            <StaggerItem key={it.label}>
              <Link
                href={`/workflows?q=${encodeURIComponent(it.label)}`}
                className="flex items-center gap-2.5 rounded-full border border-border bg-card pl-2 pr-4 py-2 hover:border-primary/40 hover:text-primary transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-surface-2 border border-border flex items-center justify-center">
                  {getNodeIcon(it.key, 14)}
                </span>
                <span className="text-sm font-medium">{it.label}</span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
