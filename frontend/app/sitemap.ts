import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://jobgrid.in';

    // Static pages
    const staticPages = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
        { url: `${baseUrl}/jobs`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
        { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
        { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
        { url: `${baseUrl}/forum`, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 0.8 },
        { url: `${baseUrl}/resume-scorer`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
        { url: `${baseUrl}/salary-insights`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
        { url: `${baseUrl}/updates`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.6 },
        { url: `${baseUrl}/join`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    ];

    // Category Pages
    const categories = ['govt', 'private', 'it', 'banking'];
    const categoryPages = categories.map(cat => ({
        url: `${baseUrl}/category/${cat}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    // SEO Landing Pages (Programmatic)
    const seoKeywords = ['remote', 'bangalore', 'frontend', 'backend', 'fullstack', 'sde', 'freshers-2023', 'freshers-2024', 'freshers-2025', 'freshers-2026', 'internship', 'mnc', 'startup', 'graduate'];
    const seoPages = seoKeywords.map(keyword => ({
        url: `${baseUrl}/jobs/${keyword}-jobs`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    // Dynamic Job Pages
    let jobPages: MetadataRoute.Sitemap = [];
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com'}/api/jobs?limit=1000`, { next: { revalidate: 3600 } });
        const data = await res.json();
        const jobs = data.jobs || [];

        jobPages = jobs.map((job: { slug: string; updatedAt?: string; createdAt: string }) => ({
            url: `${baseUrl}/job/${job.slug}`,
            lastModified: new Date(job.updatedAt || job.createdAt),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Failed to fetch jobs for sitemap', error);
    }

    // Dynamic Forum Pages
    let forumPages: MetadataRoute.Sitemap = [];
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com'}/api/forum/posts?limit=100`, { next: { revalidate: 3600 } });
        const posts = await res.json();

        forumPages = Array.isArray(posts) ? posts.map((post: { _id: string; updatedAt?: string; createdAt: string }) => ({
            url: `${baseUrl}/forum/${post._id}`,
            lastModified: new Date(post.updatedAt || post.createdAt),
            changeFrequency: 'daily' as const,
            priority: 0.6,
        })) : [];
    } catch (error) {
        console.error('Failed to fetch forum posts for sitemap', error);
    }

    return [...staticPages, ...categoryPages, ...seoPages, ...jobPages, ...forumPages];
}
