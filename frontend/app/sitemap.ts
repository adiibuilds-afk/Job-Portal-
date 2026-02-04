import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://jobportal.com';

    // Static pages
    const staticPages = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
        { url: `${baseUrl}/jobs`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
        { url: `${baseUrl}/category/govt`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
        { url: `${baseUrl}/category/private`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    ];

    // Dynamic job pages
    let jobPages: MetadataRoute.Sitemap = [];
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/jobs`);
        const jobs = await res.json();

        jobPages = jobs.map((job: { slug: string; createdAt: string }) => ({
            url: `${baseUrl}/job/${job.slug}`,
            lastModified: new Date(job.createdAt),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Failed to fetch jobs for sitemap', error);
    }

    return [...staticPages, ...jobPages];
}
