/**
 * Workflow categories. `label` is the exact value stored on the backend
 * `workflow.category` field and passed as `?category=` to `/workflows`.
 * Lifted out of `FilterPanel` so the landing page can reuse it.
 */

export interface WorkflowCategory {
  label: string;
  /** lucide-react icon name */
  icon: string;
  blurb: string;
}

export const CATEGORIES: WorkflowCategory[] = [
  { label: "AI & ML", icon: "Sparkles", blurb: "LLM chains, embeddings, agents and enrichment." },
  { label: "Marketing", icon: "Megaphone", blurb: "Campaigns, lead capture and lifecycle nurture." },
  { label: "Sales", icon: "TrendingUp", blurb: "Pipeline sync, outreach and deal alerts." },
  { label: "Data Processing", icon: "Database", blurb: "ETL, transforms and scheduled batch jobs." },
  { label: "Productivity", icon: "Zap", blurb: "Notifications, reminders and personal automation." },
  { label: "Integration", icon: "Plug", blurb: "Glue between SaaS tools and internal APIs." },
  { label: "Communication", icon: "MessageSquare", blurb: "Slack, email and chat routing." },
  { label: "E-commerce", icon: "ShoppingCart", blurb: "Orders, inventory and storefront sync." },
  { label: "Finance", icon: "Wallet", blurb: "Invoicing, reconciliation and reporting." },
  { label: "HR", icon: "Users", blurb: "Onboarding, PTO and people-ops workflows." },
  { label: "Other", icon: "Boxes", blurb: "Everything that doesn't fit a box yet." },
];

export const CATEGORY_LABELS = CATEGORIES.map((c) => c.label);

export function categoryHref(label: string): string {
  return `/workflows?category=${encodeURIComponent(label)}`;
}
