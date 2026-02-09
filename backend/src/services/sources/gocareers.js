const { scrapeTelegramChannel } = require('../scraper');
const { scrapeJobPage } = require('../scraper');
const { parseJobWithAI } = require('../groq');
const { refineJobWithAI, finalizeJobData } = require('../jobProcessor');
const { downloadAndProcessLogo: downloadAndSaveLogo } = require('../../utils/imageProcessor');
const Job = require('../../models/Job');
const { waitWithSkip, postJobToTelegram } = require('./utils');

const SOURCE_URL = 'https://telegram.me/s/gocareers'; 
const EXCLUSIONS = [];
// const MAX_JOBS_MANUAL = 20; // limits passed dynamically now

const { processJobUrl } = require('./processor');

const runGoCareersManual = async (bot, limit = 20) => {
    console.log(`🔄 GoCareers Manual Trigger (Limit ${limit})...`);

    try {
        const links = await scrapeTelegramChannel(SOURCE_URL, EXCLUSIONS);
        
        if (!links || links.length === 0) {
            console.log('❌ No links found.');
            return { processed: 0, skipped: 0 };
        }

        const jobsToProcess = links.reverse().slice(0, limit);

        let processed = 0;
        let skipped = 0;
        let consecutiveDuplicates = 0;

        for (const link of jobsToProcess) {
             const success = await processJobUrl(link, bot);
             
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

        console.log(`📊 GoCareers Manual Complete: ${processed} new jobs, ${skipped} skipped.`);
        return { processed, skipped, action: 'complete' };

    } catch (err) {
        console.error('❌ GoCareers Manual Failed:', err.message);
        return { processed: 0, skipped: 0 };
    }
};

module.exports = { runGoCareersManual };
