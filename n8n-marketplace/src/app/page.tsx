import React from 'react';
import { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
  title: 'FlowStore | The #1 Marketplace for n8n Workflows',
  description: 'Discover, download, and share powerful n8n automation workflows. Join the community of automation experts.',
  openGraph: {
    title: 'FlowStore | The #1 Marketplace for n8n Workflows',
    description: 'Discover, download, and share powerful n8n automation workflows.',
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
    <HomeClient 
      initialWorkflows={data.data || []} 
      initialMeta={data.meta || {}} 
    />
  );
}
