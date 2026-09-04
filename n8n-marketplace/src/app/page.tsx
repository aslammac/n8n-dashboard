import React from "react";
import type { Metadata } from "next";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import LandingHero from "@/components/landing/LandingHero";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturedWorkflows from "@/components/landing/FeaturedWorkflows";
import BrowseCategories from "@/components/landing/BrowseCategories";
import PopularIntegrations from "@/components/landing/PopularIntegrations";
import Testimonials from "@/components/landing/Testimonials";
import Faq from "@/components/landing/Faq";
import MakerNote from "@/components/landing/MakerNote";
import FinalCta from "@/components/landing/FinalCta";
import { SITE } from "@/data/site";
import type { WorkflowMetadata } from "@/types/workflow";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export const metadata: Metadata = {
  title: "FlowStore | #1 n8n Workflow Marketplace — Browse & Import n8n Templates",
  description:
    "FlowStore is the largest marketplace for n8n automation workflows. Find production-ready n8n templates for Slack, Gmail, Google Sheets, AI agents, HubSpot, Notion, and 400+ apps. Preview on an interactive canvas and import into n8n in one click.",
  keywords: [
    "n8n workflow marketplace", "n8n templates", "n8n automation workflows",
    "buy n8n workflows", "free n8n workflows", "n8n workflow library",
    "n8n integrations", "automation workflow store", "n8n community workflows",
    "import n8n workflow", "n8n flow templates",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "FlowStore — The #1 n8n Workflow Marketplace",
    description:
      "Find, preview, and import production-ready n8n automation workflows. 400+ integrations. Free & premium templates.",
    type: "website",
    url: SITE.url,
    siteName: "FlowStore",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowStore — The #1 n8n Workflow Marketplace",
    description: "Find, preview, and import production-ready n8n automation workflows. 400+ integrations.",
    creator: "@aslam_mac",
  },
};

function mapWorkflow(w: any): WorkflowMetadata {
  return {
    id: w._id,
    title: w.title,
    slug: w.slug,
    shortDescription: w.shortDescription,
    detailedDescription: w.detailedDescription,
    category: w.category,
    tags: w.tags || [],
    author: w.creatorId
      ? { name: w.creatorId.fullName || w.creatorId.username, avatar: w.creatorId.avatarUrl }
      : { name: "Community" },
    downloadsCount: w.downloadsCount || 0,
    viewsCount: w.viewsCount || 0,
    ratingAverage: w.ratingAverage || 0,
    ratingCount: w.ratingCount || 0,
    likesCount: w.likesCount || 0,
    created: w.createdAt,
    updated: w.updatedAt,
    nodes: w.nodes || [],
    nodeCount: w.nodes?.length || 0,
    complexity: w.complexity || "intermediate",
    isPremium: w.isPremium || false,
  };
}

async function getFeatured() {
  try {
    const res = await fetch(`${API}/workflows?limit=6&sort=downloads`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error("bad response");
    const json = await res.json();
    return {
      workflows: (json.data || []).map(mapWorkflow),
      total: json.meta?.total ?? 0,
    };
  } catch (e) {
    console.error("landing: featured fetch failed", e);
    return { workflows: [], total: 0 };
  }
}

async function getStats(fallbackWorkflows: number) {
  try {
    const res = await fetch(`${API}/analytics/public-stats`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error("bad response");
    const s = await res.json();
    return {
      workflows: s.totalWorkflows || fallbackWorkflows,
      integrations: s.totalIntegrations || 80,
      downloads: s.totalDownloads || 0,
    };
  } catch {
    return { workflows: fallbackWorkflows, integrations: 80, downloads: 0 };
  }
}

export default async function HomePage() {
  const { workflows, total } = await getFeatured();
  const stats = await getStats(total);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-fg">
      <SiteHeader variant="transparent" />
      <main className="flex-1">
        <LandingHero stats={stats} />
        <HowItWorks />
        <FeaturedWorkflows workflows={workflows} />
        <BrowseCategories />
        <PopularIntegrations />
        <Testimonials />
        <Faq />
        {/* <MakerNote /> */}
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
