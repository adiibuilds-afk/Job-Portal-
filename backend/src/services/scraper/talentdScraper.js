const axios = require('axios');
const cheerio = require('cheerio');

const scrapeTalentdJobs = async (page = 1) => {
    try {
        const url = page === 1 ? 'https://www.talentd.in/jobs' : `https://www.talentd.in/jobs?page=${page}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            },
            timeout: 10000,
        });

        const $ = cheerio.load(response.data);
        const jobLinks = [];

        // Try to find all anchor tags that look like job links
        $('a[href]').each((i, el) => {
            const href = $(el).attr('href');
            if (href && (href.includes('/job/') || href.includes('/jobs/')) && !href.includes('talentd.in/jobs/page/')) {
                // Ensure absolute URL
                const absoluteUrl = href.startsWith('http') ? href : `https://www.talentd.in${href}`;
                
                // Exclude generic pages that look like job links
                const excludePatterns = ['/freshers', '/internships', '/about', '/contact', '/category', '/tag', '/experience', '/location', '/companies', '/jobs/page/'];
                if (excludePatterns.some(p => absoluteUrl.toLowerCase().includes(p))) {
                    return;
                }

                jobLinks.push(absoluteUrl);
            }
        });

        // Filter valid unique links
        const uniqueLinks = [...new Set(jobLinks)];
        console.log(`[Talentd Scraper] Found ${uniqueLinks.length} potential jobs.`);
        
        return uniqueLinks;
    } catch (error) {
        console.error('[Talentd Scraper] Failed to fetch list:', error.message);
        return [];
    }
};

module.exports = scrapeTalentdJobs;
