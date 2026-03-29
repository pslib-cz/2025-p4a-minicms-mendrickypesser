import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Po hodině

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://olympcms.vercel.app';

  try {
    const publishedOlympiads = await prisma.olympiad.findMany({
      where: { publishStatus: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });

    const olympiadRoutes: MetadataRoute.Sitemap = publishedOlympiads.map((ol: any) => ({
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
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    // Fallback na základní routy, pokud DB není dostupná při buildu
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
    ];
  }
}
