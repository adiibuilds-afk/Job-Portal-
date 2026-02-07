const axios = require('axios');

const scrapeRgJobs = async () => {
    try {
        const apiUrl = 'https://api.rgjobs.in/api/getAllJobs';
        console.log(`[RG Jobs Scraper] Fetching from API: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            timeout: 15000,
        });

        if (!response.data || !response.data.JobsData) {
            console.error('[RG Jobs Scraper] Invalid API response format');
            return [];
        }

        const jobLinks = response.data.JobsData.map(job => {
            // Construct the internal RG Jobs link for scraping
            const slug = job.title
                .toLowerCase()
                .replace(/[^a-z0-8]+/g, '-')
                .replace(/(^-|-$)/g, '');
            
            return `https://www.rgjobs.in/job/${job.id}/${slug}`;
        });

        const uniqueLinks = [...new Set(jobLinks)].slice(0, 15);
        console.log(`[RG Jobs Scraper] Successfully found ${uniqueLinks.length} jobs via API.`);
        
        return uniqueLinks;
    } catch (error) {
        console.error('[RG Jobs Scraper] API Fetch failed:', error.message);
        return [];
    }
};

module.exports = scrapeRgJobs;
