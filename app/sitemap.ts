import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { workItems } from '@/content/work';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site.url}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${site.url}/company`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    ...workItems.map((w) => ({ url: `${site.url}/work/${w.slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}
