import React, { Suspense } from "react";
import type { Metadata } from "next";
import WorkflowsBrowser from "@/components/workflows/WorkflowsBrowser";
import { SITE } from "@/data/site";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

type SearchParams = Record<string, string | string[] | undefined>;

const REFINING_KEYS = ["q", "category", "complexity", "tags", "isPremium", "sort"];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const isRefined =
    REFINING_KEYS.some((k) => sp[k]) || (sp.page && sp.page !== "1");

  // Internal search-result permutations should not be indexed (Google
  // discourages "search results in search results"); the bare listing is the
  // canonical, indexable page.
  return {
    title: isRefined
      ? "Search n8n Workflows | FlowStore"
      : "Browse n8n Workflows & Templates | FlowStore",
    description:
      "Search 1000+ production-ready n8n automation workflows. Filter by app, category, complexity or integration. Preview on an interactive canvas and import into your n8n instance in one click.",
    keywords: [
      "n8n workflow templates", "n8n automation library", "browse n8n workflows",
      "n8n workflow search", "n8n template gallery", "download n8n workflows",
      "n8n Slack workflow", "n8n Gmail workflow", "n8n AI workflow",
    ],
    alternates: { canonical: "/workflows" },
    robots: isRefined ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: "Browse n8n Workflows & Templates | FlowStore",
      description:
        "1000+ production-ready n8n automation workflows. Filter by app, category, and complexity. Import into n8n in one click.",
      type: "website",
      url: `${SITE.url}/workflows`,
      siteName: "FlowStore",
    },
    twitter: {
      card: "summary_large_image",
      title: "Browse n8n Workflows & Templates | FlowStore",
      description: "1000+ n8n automation templates. Filter, preview, and import in one click.",
      creator: "@aslam_mac",
    },
  };
}

async function getWorkflows() {
  try {
    const res = await fetch(`${API}/workflows?page=1&limit=12`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch workflows");
    return res.json();
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return { data: [], meta: { total: 0, page: 1, totalPages: 1 } };
  }
}

export default async function WorkflowsPage() {
  const data = await getWorkflows();

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "n8n workflows on FlowStore",
    itemListElement: (data.data || []).map((w: any, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.url}/workflow/${w.slug}`,
      name: w.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <Suspense fallback={null}>
        <WorkflowsBrowser
          initialWorkflows={data.data || []}
          initialMeta={data.meta || {}}
        />
      </Suspense>
    </>
  );
}
