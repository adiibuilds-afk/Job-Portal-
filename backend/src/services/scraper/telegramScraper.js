const axios = require('axios');
const cheerio = require('cheerio');

const scrapeTelegramChannel = async (channelUrl) => {
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
        const exclusions = ['mercor', 'challenge', 'hackathon'];

        $('.tgme_widget_message').each((i, el) => {
            const messageText = $(el).find('.tgme_widget_message_text').text().toLowerCase();
            
            if (exclusions.some(excluded => messageText.includes(excluded))) {
                return;
            }

            $(el).find('.tgme_widget_message_text a').each((j, link) => {
                const href = $(link).attr('href');
                if (href) {
                    if (
                        href.startsWith('http') && 
                        !href.includes('t.me/') && 
                        !href.includes('telegram.org/') &&
                        !href.includes('linkedin.com/in/') &&
                        !href.includes('linktr.ee/jobs_and_internships_updates')
                    ) {
                        if (!exclusions.some(excluded => href.toLowerCase().includes(excluded))) {
                            jobLinks.push(href);
                        }
                    }
                }
            });
        });

        const uniqueLinks = [...new Set(jobLinks)];
        console.log(`[Telegram Scraper] Found ${uniqueLinks.length} unique potential job links.`);
        
        return uniqueLinks;
    } catch (error) {
        console.error('[Telegram Scraper] Failed to fetch channel:', error.message);
        return [];
    }
};

module.exports = scrapeTelegramChannel;
