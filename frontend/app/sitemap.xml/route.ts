import { getJobs } from '@/services/api';
import { Job } from '@/types';

export async function GET() {
    const baseUrl = 'https://jobgrid.in';

    // Fetch all jobs for sitemap
    // Note: Adjusting limit to fetch a large number of jobs for indexing
    let jobs: Job[] = [];
    try {
        const response = await getJobs({ limit: 1000 });
        jobs = response.jobs || [];
    } catch (err) {
        console.error('Sitemap fetch error:', err);
    }

    const staticPages = [
        '',
        '/jobs',
        '/leaderboard',
        '/salary-insights',
        '/about',
        '/contact',
        '/batch/2023',
        '/batch/2024',
        '/batch/2025',
        '/batch/2026',
        '/batch/2027',
        '/batch/2028'
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticPages.map(page => `
    <url>
        <loc>${baseUrl}${page}</loc>
        <changefreq>daily</changefreq>
        <priority>${page === '' ? '1.0' : '0.8'}</priority>
    </url>`).join('')}
    ${jobs.map(job => {
        const lastMod = new Date(job.updatedAt || job.createdAt);
        const isValidDate = !isNaN(lastMod.getTime());
        return `
    <url>
        <loc>${baseUrl}/job/${job.slug}</loc>
        ${isValidDate ? `<lastmod>${lastMod.toISOString()}</lastmod>` : ''}
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
    </url>`;
    }).join('')}
</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
