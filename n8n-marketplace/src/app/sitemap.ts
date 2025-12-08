import { MetadataRoute } from 'next';

async function getWorkflows() {
  try {
    // Fetch all workflows (or a large limit) for the sitemap
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/workflows?limit=1000`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching workflows for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const workflows = await getWorkflows();

  const workflowUrls = workflows.map((workflow: any) => ({
    url: `${baseUrl}/workflow/${workflow._id}`, // Or slug if using slugs
    lastModified: new Date(workflow.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...workflowUrls,
  ];
}
