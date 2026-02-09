const axios = require('axios');
const cheerio = require('cheerio');
const Job = require('../../models/Job');
const { waitWithSkip, postJobToTelegram } = require('./utils');

const JSON_FEED_URL = 'https://freshersjobsaadda.blogspot.com/feeds/posts/default?alt=json';

const { processJobUrl } = require('./processor');

const processEntry = async (entry, bot) => {
    try {
        const title = entry.title.$t;
        const content = entry.content ? entry.content.$t : '';
        
        // Find links
        const linkObj = entry.link.find(l => l.rel === 'alternate');
        const url = linkObj ? linkObj.href : '';

        if (!url) return false;

        console.log(`   🔎 Processing Feed Entry: ${title}`);

        // Parse HTML content to find real apply link
        const $ = cheerio.load(content);
        let applyUrl = '';
         $('a').each((i, el) => {
            const text = $(el).text().toLowerCase();
            const href = $(el).attr('href');
            if (href && (text.includes('apply') || text.includes('click here') || text.includes('register'))) {
                 // Check if it's an external link (not to blogger itself, usually)
                 if (!href.includes('freshersjobsaadda') && !href.includes('whatsapp') && !href.includes('telegram')) {
                     applyUrl = href;
                     return false; 
                 }
            }
        });

        // Attempt to find logo in content
        const img = $('img').first().attr('src');

        return await processJobUrl(url, bot, {
            content: content,
            title: title,
            applyUrl: applyUrl,
            companyLogo: img
        });

    } catch (err) {
        console.error(`   ❌ Error processing entry ${entry.title.$t}: ${err.message}`);
        return false;
    }
};

const runFreshersJobsAaddaManual = async (bot, limit = 20) => {
    console.log(`🔄 FreshersJobsAadda Manual (JSON) Trigger (Limit ${limit})...`);

    try {
        const { data } = await axios.get(JSON_FEED_URL);
        
        if (!data.feed || !data.feed.entry || data.feed.entry.length === 0) {
            console.log('❌ No entries found in JSON feed.');
            return { processed: 0, skipped: 0 };
        }

        const entries = data.feed.entry; // Usually newest first
        const jobsToProcess = entries.slice(0, limit).reverse();

        let processed = 0;
        let skipped = 0;
        let consecutiveDuplicates = 0;

        for (const entry of jobsToProcess) {
             const success = await processEntry(entry, bot);
             
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

        console.log(`📊 FreshersJobsAadda Manual Complete: ${processed} new jobs, ${skipped} skipped.`);
        return { processed, skipped, action: 'complete' };

    } catch (err) {
        console.error('❌ FreshersJobsAadda Manual Failed:', err.message);
        return { processed: 0, skipped: 0 };
    }
};

module.exports = { runFreshersJobsAaddaManual };
