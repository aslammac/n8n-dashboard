import React, { Suspense } from 'react';
import { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
  title: 'FlowStore | Premium n8n Workflows & Automation Templates',
  description: 'The premier marketplace for expert-verified n8n automation workflows. Supercharge your productivity with production-ready templates built by automation experts.',
  openGraph: {
    title: 'FlowStore | Premium n8n Workflows Marketplace',
    description: 'Expert-verified n8n automation workflows. Scale your business with production-ready templates.',
    type: 'website',
  }
};

async function getWorkflows() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/workflows?page=1&limit=9`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch workflows');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return { data: [], meta: { total: 0, page: 1, lastPage: 1 } };
  }
}

export default async function Home() {
  const data = await getWorkflows();

  // Transform data to match component expectations if needed
  // The API returns { data: [...], meta: {...} }
  // HomeClient expects this structure for initial data

  return (
    <Suspense fallback={null}>
      <HomeClient
        initialWorkflows={data.data || []}
        initialMeta={data.meta || {}}
      />
    </Suspense>
  );
}
