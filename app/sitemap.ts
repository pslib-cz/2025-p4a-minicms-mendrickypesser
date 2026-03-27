import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const publishedOlympiads = await prisma.olympiad.findMany({
    where: { publishStatus: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
  });

  const olympiadRoutes: MetadataRoute.Sitemap = publishedOlympiads.map((ol) => ({
    url: `${baseUrl}/olympiady/${ol.slug}`,
    lastModified: ol.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/olympiady`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...olympiadRoutes,
  ];
}
