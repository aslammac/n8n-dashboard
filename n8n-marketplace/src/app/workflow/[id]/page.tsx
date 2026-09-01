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
      description: 'The requested workflow could not be found.',
    };
  }
  
  return {
    title: `${workflow.title} | FlowStore`,
    description: workflow.shortDescription,
    openGraph: {
      title: `${workflow.title} | FlowStore`,
      description: workflow.shortDescription,
      type: 'article',
      tags: workflow.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: workflow.title,
      description: workflow.shortDescription,
    }
  };
}

export default async function WorkflowPage({ params }: PageProps) {
  const { id } = await params;
  const workflow = await getWorkflow(id);

  if (!workflow) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-white mb-4">Workflow not found</h2>
        <a href="/" className="text-blue-500 hover:text-blue-400 font-medium">
          Return to Marketplace
        </a>
      </div>
    );
  }

  // Add JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: workflow.title,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'n8n',
    offers: {
      '@type': 'Offer',
      price: workflow.isPremium ? 'Premium' : '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: workflow.ratingAverage,
      reviewCount: workflow.ratingCount,
    },
    description: workflow.shortDescription,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WorkflowDetails workflow={workflow} />
    </>
  );
}
