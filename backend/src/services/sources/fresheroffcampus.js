const axios = require('axios');
const cheerio = require('cheerio');
const Job = require('../../models/Job');
const { waitWithSkip, postJobToTelegram, deleteTelegramPost } = require('./utils');

const RSS_URL = 'https://www.fresheroffcampus.com/feed/';
// const MAX_JOBS_MANUAL = 20;

const { processJobUrl } = require('./processor');

const processFeedItem = async (item, bot, bundler) => {
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
            companyLogo: img,
            bundler // Pass bundler to processJobUrl
        });

    } catch (err) {
        console.error(`   ❌ Error processing item ${item.title}: ${err.message}`);
        return { success: false };
    }
};

const runFresherOffCampusManual = async (bot, limit = 20, bundler) => {
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
        // RSS is usually Newest First. 
        // We want the LATEST 'limit'. So just slice(0, limit).
        const jobsToProcess = items.slice(0, limit);

        let processed = 0;
        let skipped = 0;
        let consecutiveDuplicates = 0;

        for (let i = 0; i < jobsToProcess.length; i++) {
             const item = jobsToProcess[i];
             console.log(`\n[${i + 1}/${jobsToProcess.length}] 🔄 Processing...`);
             
             const success = await processFeedItem(item, bot, bundler);
             
             if (success && success.error === 'rate_limit') {
                 console.log('🛑 Rate Limit Exceeded');
                 return { processed, skipped, action: 'rate_limit' };
             }

             if (success && success.skipped && success.reason === 'duplicate') {
                 consecutiveDuplicates++;
                 skipped++;
                 console.log(`   🔸 Consecutive Duplicates: ${consecutiveDuplicates}/3`);
                 
                 if (consecutiveDuplicates >= 3) {
                     console.log('🛑 3 consecutive duplicates found. Stopping source.');
                     return { processed, skipped, action: 'complete' };
                 }
                 continue;
             }

             if (success && success.success) {
                 processed++;
                 consecutiveDuplicates = 0; // Reset
                 const lastJobId = success.jobId;

                 if (processed < limit && processed < jobsToProcess.length - skipped) {
                     const waitResult = await waitWithSkip(11000);
                     
                     if (waitResult === 'delete' && lastJobId) {
                         const jobToDelete = await Job.findById(lastJobId);
                         if (jobToDelete && jobToDelete.telegramMessageId) {
                             await deleteTelegramPost(bot, jobToDelete.telegramMessageId);
                             console.log('🗑️ Deleted from Telegram.');
                         }
                         if (bundler) {
                             await bundler.removeJob(lastJobId);
                         }
                         await Job.findByIdAndDelete(lastJobId);
                         console.log('🗑️ Job deleted from database.');
                         processed--; // Decr processed count
                     }

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
