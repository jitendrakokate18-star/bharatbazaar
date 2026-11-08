import { MetadataRoute } from 'next';
import { getDb } from '@/lib/db';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bharatiyabajar.in';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/directory`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/sectors`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/glossary`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  try {
    const db = getDb();
    const companies = db.prepare('SELECT isin, updated_at FROM company WHERE status = "ACTIVE" LIMIT 500').all() as any[];
    const companyRoutes: MetadataRoute.Sitemap = companies.map((c) => ({
      url: `${baseUrl}/company/${c.isin}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    }));

    const sectors = db.prepare('SELECT slug FROM sector_taxonomy').all() as any[];
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
