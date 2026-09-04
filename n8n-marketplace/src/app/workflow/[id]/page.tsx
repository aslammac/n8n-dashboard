import React from 'react';
import { Metadata } from 'next';
import WorkflowDetails from '@/components/WorkflowDetails';
import { WorkflowMetadata } from '@/types/workflow';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getWorkflow(id: string): Promise<WorkflowMetadata | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/workflows/${id}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      return null;
    }
    
    const apiData = await res.json();
    
    return {
      id: apiData._id,
      title: apiData.title,
      slug: apiData.slug,
      shortDescription: apiData.shortDescription,
      detailedDescription: apiData.detailedDescription,
      category: apiData.category,
      tags: apiData.tags,
      author: { name: 'Unknown' },
      downloadsCount: apiData.downloadsCount || 0,
      viewsCount: apiData.viewsCount || 0,
      likesCount: apiData.likesCount || 0,
      isPremium: apiData.isPremium || false,
      ratingAverage: apiData.ratingAverage || 0,
      ratingCount: apiData.ratingCount || 0,
      created: apiData.createdAt,
      updated: apiData.updatedAt,
      nodes: apiData.nodes || [],
      nodeCount: apiData.nodes?.length || 0,
      complexity: apiData.complexity || 'intermediate',
      setupSteps: apiData.setupSteps || [],
      price: apiData.price ?? 0,
      currency: apiData.currency ?? 'USD',
      locked: apiData.locked ?? false,
      workflow: apiData.workflowJson,
    };
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const workflow = await getWorkflow(id);
  
  if (!workflow) {
    return {
      title: 'Workflow Not Found | FlowStore',
      description: 'The requested n8n workflow could not be found. Browse our library of automation templates.',
    };
  }

  const title = `${workflow.title} — n8n Workflow Template`;
  const description = `${workflow.shortDescription} Download this n8n automation workflow on FlowStore. Preview on an interactive canvas and import into n8n in one click.`;
  const keywords = [
    "n8n workflow", "n8n template", "n8n automation",
    ...(workflow.tags || []),
    workflow.category ? `${workflow.category} automation` : "",
    `${workflow.title} n8n`,
  ].filter(Boolean);
  
  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/workflow/${workflow.slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      tags: workflow.tags,
      siteName: 'FlowStore',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: workflow.shortDescription,
      creator: '@aslam_mac',
    },
  };
}

export default async function WorkflowPage({ params }: PageProps) {
  const { id } = await params;
  const workflow = await getWorkflow(id);

  if (!workflow) {
    return (
      <div className="min-h-screen bg-bg text-fg flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Workflow not found</h2>
        <a href="/workflows" className="text-primary hover:text-primary-hover font-medium">
          Back to workflows
        </a>
      </div>
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const canonical = `${appUrl}/workflow/${workflow.slug}`;
  const hasRatings = !!workflow.ratingCount && workflow.ratingCount > 0;

  // Add JSON-LD Structured Data
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: workflow.title,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'n8n',
    url: canonical,
    description: workflow.shortDescription,
    offers: {
      '@type': 'Offer',
      price: workflow.isPremium ? Number(workflow.price ?? 0) : 0,
      priceCurrency: workflow.currency || 'USD',
    },
    ...(hasRatings && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: workflow.ratingAverage,
        reviewCount: workflow.ratingCount,
      },
    }),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: appUrl },
      { '@type': 'ListItem', position: 2, name: 'Workflows', item: `${appUrl}/workflows` },
      { '@type': 'ListItem', position: 3, name: workflow.title, item: canonical },
    ],
  };

  const howTo =
    workflow.setupSteps && workflow.setupSteps.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: `Set up: ${workflow.title}`,
          step: workflow.setupSteps.map((text, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            text,
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([jsonLd, breadcrumb, ...(howTo ? [howTo] : [])]),
        }}
      />
      <WorkflowDetails workflow={workflow} />
    </>
  );
}
