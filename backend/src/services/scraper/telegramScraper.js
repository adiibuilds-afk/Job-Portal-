const axios = require('axios');
const cheerio = require('cheerio');

const scrapeTelegramChannel = async (channelUrl, customExclusions = []) => {
    try {
        console.log(`[Telegram Scraper] Fetching channel: ${channelUrl}`);
        const response = await axios.get(channelUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            },
            timeout: 15000,
        });

        const $ = cheerio.load(response.data);
        const jobLinks = [];
        const baseExclusions = ['mercor', 'challenge', 'hackathon'];
        const allExclusions = [...new Set([...baseExclusions, ...customExclusions.map(e => e.toLowerCase())])];

        $('.tgme_widget_message').each((i, el) => {
            const messageText = $(el).find('.tgme_widget_message_text').text().toLowerCase();
            
            if (allExclusions.some(excluded => messageText.includes(excluded))) {
                return;
            }

            $(el).find('.tgme_widget_message_text a').each((j, link) => {
                const href = $(link).attr('href');
                if (href) {
                    const lowHref = href.toLowerCase();
                    if (
                        href.startsWith('http') && 
                        !lowHref.includes('t.me/') && 
                        !lowHref.includes('telegram.org/') &&
                        !lowHref.includes('linkedin.com/in/') &&
                        !lowHref.includes('linktr.ee/jobs_and_internships_updates') &&
                        !allExclusions.some(excluded => lowHref.includes(excluded))
                    ) {
                        jobLinks.push(href);
                    }
                }
            });
        });

        const uniqueLinks = [...new Set(jobLinks)];
        console.log(`[Telegram Scraper] Found ${uniqueLinks.length} unique potential job links from ${channelUrl}.`);
        
        return uniqueLinks;
    } catch (error) {
        console.error(`[Telegram Scraper] Failed to fetch channel ${channelUrl}:`, error.message);
        return [];
    }
};

module.exports = scrapeTelegramChannel;
