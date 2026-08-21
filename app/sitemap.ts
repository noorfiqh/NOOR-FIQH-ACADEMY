import { MetadataRoute } from 'next';
import { INITIAL_COURSES, INITIAL_BOOKS, INITIAL_FATWAS } from '@/lib/seed-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://noorfiqhacademy.com';
  const currentDate = new Date();

  // Static Public Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/books`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fatwa`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/verify-certificate`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Course Detail Pages
  const courseRoutes: MetadataRoute.Sitemap = INITIAL_COURSES.map((course) => ({
    url: `${baseUrl}/courses/${course.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Book Detail Pages
  const bookRoutes: MetadataRoute.Sitemap = INITIAL_BOOKS.map((book) => ({
    url: `${baseUrl}/books/${book.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Answered Public Fatwa Question Pages (via hash or direct link)
  const fatwaRoutes: MetadataRoute.Sitemap = INITIAL_FATWAS.filter(f => !f.isPrivate).map((fatwa) => ({
    url: `${baseUrl}/fatwa?q=${encodeURIComponent(fatwa.trackingCode)}`,
    lastModified: new Date(fatwa.createdAt || currentDate),
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  return [...staticRoutes, ...courseRoutes, ...bookRoutes, ...fatwaRoutes];
}
