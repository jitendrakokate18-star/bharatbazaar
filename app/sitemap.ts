import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bharatiyabajar.in';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/directory`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/sectors`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/glossary`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  try {
    const companies = await prisma.company.findMany({
      where: { status: 'ACTIVE' },
      select: { isin: true, updatedAt: true },
      take: 500,
    });
    const companyRoutes: MetadataRoute.Sitemap = companies.map((c) => ({
      url: `${baseUrl}/company/${c.isin}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    }));

    const sectors = await prisma.sectorTaxonomy.findMany({
      select: { slug: true },
    });
    const sectorRoutes: MetadataRoute.Sitemap = sectors.map((s) => ({
      url: `${baseUrl}/sectors/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    return [...staticRoutes, ...sectorRoutes, ...companyRoutes];
  } catch (e) {
    return staticRoutes;
  }
}
