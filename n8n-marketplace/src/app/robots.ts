import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/auth/', '/upload/'],
    },
    sitemap: 'https://flowstore.app/sitemap.xml', // Replace with actual domain
  };
}
