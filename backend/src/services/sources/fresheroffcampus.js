const axios = require('axios');
const cheerio = require('cheerio');
const Job = require('../../models/Job');
const { waitWithSkip, postJobToTelegram } = require('./utils');

const RSS_URL = 'https://www.fresheroffcampus.com/feed/';
// const MAX_JOBS_MANUAL = 20;

const { processJobUrl } = require('./processor');

const processFeedItem = async (item, bot) => {
    try {
        const url = item.link;
        console.log(`   🔎 Processing Feed Item: ${item.title}`);
        
        const $ = cheerio.load(item.content || '');
        let applyUrl = '';
        
        $('a').each((i, el) => {
            const text = $(el).text().toLowerCase();
            const href = $(el).attr('href');
            if (href && (text.includes('apply') || text.includes('register') || text.includes('click here'))) {
                if (!href.includes('fresheroffcampus.com') && !href.includes('whatsapp') && !href.includes('telegram')) {
                    applyUrl = href;
                    return false;
                }
            }
        });

        const img = $('img').first().attr('src');

        return await processJobUrl(url, bot, {
            content: item.content,
            title: item.title,
            applyUrl: applyUrl,
            companyLogo: img
        });

    } catch (err) {
        console.error(`   ❌ Error processing item ${item.title}: ${err.message}`);
        return false;
    }
};

const runFresherOffCampusManual = async (bot, limit = 20) => {
    console.log(`🔄 FresherOffCampus Manual (RSS) Trigger (Limit ${limit})...`);

    try {
        const { data } = await axios.get(RSS_URL);
        const $ = cheerio.load(data, { xmlMode: true });
        
        const items = [];
        $('item').each((i, el) => {
            items.push({
                title: $(el).find('title').text(),
                link: $(el).find('link').text(),
                content: $(el).find('content\\:encoded').text() || $(el).find('description').text(),
                pubDate: $(el).find('pubDate').text()
            });
        });

        if (items.length === 0) {
            console.log('❌ No items found in RSS feed.');
            return { processed: 0, skipped: 0 };
        }

        // RSS is usually Newest First. 
        // We want the LATEST 'limit'. So just slice(0, limit).
        // Then reverse to process Oldest -> Newest? or just iterate.
        // Let's reverse to process Oldest to Newest of the slice.
        const jobsToProcess = items.slice(0, limit).reverse();

        let processed = 0;
        let skipped = 0;
        let consecutiveDuplicates = 0;

        for (const item of jobsToProcess) {
             const success = await processFeedItem(item, bot);
             
             if (success && success.error === 'rate_limit') {
                 console.log('🛑 Rate Limit Exceeded');
                 return { processed, skipped, action: 'rate_limit' };
             }

             if (success && success.skipped && success.reason === 'duplicate') {
                 consecutiveDuplicates++;
                 skipped++;
                 console.log(`   🔸 Consecutive Duplicates: ${consecutiveDuplicates}/5`);
                 
                 if (consecutiveDuplicates >= 5) {
                     console.log('🛑 5 consecutive duplicates found. Stopping source.');
                     return { processed, skipped, action: 'complete' };
                 }
                 continue;
             }

             if (success) {
                 processed++;
                 consecutiveDuplicates = 0; // Reset
                 if (processed < limit && processed < jobsToProcess.length - skipped) {
                     const waitResult = await waitWithSkip(21000);
                     if (waitResult === 'quit') return { processed, skipped, action: 'quit' };
                     if (waitResult === 'next_source') return { processed, skipped, action: 'next' };
                 }
             } else {
                 skipped++;
             }
        }

        console.log(`📊 FresherOffCampus Manual Complete: ${processed} new jobs, ${skipped} skipped.`);
        return { processed, skipped, action: 'complete' };

    } catch (err) {
        console.error('❌ FresherOffCampus Manual Failed:', err.message);
        return { processed: 0, skipped: 0 };
    }
};

module.exports = { runFresherOffCampusManual };
