import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://jobgrid.in';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/profile/', '/dashboard/', '/saved/', '/api/auth/'],
            },
            {
                userAgent: ['GPTBot', 'CCBot', 'Google-Extended', 'ImagesiftBot'],
                disallow: '/',
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
