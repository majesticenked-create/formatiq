import type { MetadataRoute } from 'next';
import { categories, tools } from '@/lib/tools/registry';

const BASE_URL = 'https://formatiq.tools';

export default function sitemap(): MetadataRoute.Sitemap {
  const homepage: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/tools/${category.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${BASE_URL}/tools/${tool.category}/${tool.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/cookies`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/accessibility`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/sitemap-page`, changeFrequency: 'monthly', priority: 0.4 },
  ];

  return [...homepage, ...categoryPages, ...toolPages, ...staticPages];
}
