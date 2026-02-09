const { scrapeTelegramChannel } = require('../scraper');
const { scrapeJobPage } = require('../scraper');
const { parseJobWithAI } = require('../groq');
const { refineJobWithAI, finalizeJobData } = require('../jobProcessor');
const { downloadAndProcessLogo: downloadAndSaveLogo } = require('../../utils/imageProcessor');
const Job = require('../../models/Job');
const { waitWithSkip, postJobToTelegram, deleteTelegramPost } = require('./utils');

const SOURCE_URL = 'https://telegram.me/s/dot_aware'; 
const EXCLUSIONS = [
    'https://whatsapp.com/channel/0029Va5HM3OEAKWJT2QLQt33',
    'https://go.acciojob.com/kXwuMW',
    'Masterclass',
    'mercor',
    'hour',
    'challenge',
    'hackathon'
];

const { processJobUrl } = require('./processor');

const runDotAwareManual = async (bot, limit = 20, bundler) => {
    console.log(`🔄 DotAware Manual Trigger (Limit ${limit})...`);

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

        for (let i = 0; i < jobsToProcess.length; i++) {
             const link = jobsToProcess[i];
             console.log(`\n[${i + 1}/${jobsToProcess.length}] 🔄 Processing...`);
             const success = await processJobUrl(link, bot, { bundler });
             
             if (success && success.error === 'rate_limit') {
                 console.log('🛑 Rate Limit Exceeded');
                 return { processed, skipped, action: 'rate_limit' };
             }

             if (success && success.skipped && success.reason === 'duplicate') {
                 consecutiveDuplicates++;
                 skipped++;
                 console.log(`   🔸 Consecutive Duplicates: ${consecutiveDuplicates}/2`);
                 
                 if (consecutiveDuplicates >= 2) {
                     console.log('🛑 2 consecutive duplicates found. Stopping source.');
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
                         processed--;
                     }

                     if (waitResult === 'quit') return { processed, skipped, action: 'quit' };
                     if (waitResult === 'next_source') return { processed, skipped, action: 'next' };
                 }
             } else {
                 skipped++;
             }
        }

        console.log(`📊 DotAware Manual Complete: ${processed} new jobs, ${skipped} skipped.`);
        return { processed, skipped, action: 'complete' };

    } catch (err) {
        console.error('❌ DotAware Manual Failed:', err.message);
        return { processed: 0, skipped: 0 };
    }
};

module.exports = { runDotAwareManual };
