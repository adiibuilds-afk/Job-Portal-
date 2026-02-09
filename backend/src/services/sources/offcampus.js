const { scrapeTelegramChannel } = require('../scraper');
const { scrapeJobPage } = require('../scraper');
const { parseJobWithAI } = require('../groq');
const { refineJobWithAI, finalizeJobData } = require('../jobProcessor');
const { downloadAndProcessLogo: downloadAndSaveLogo } = require('../../utils/imageProcessor');
const Job = require('../../models/Job');
const { waitWithSkip, postJobToTelegram, deleteTelegramPost } = require('./utils');

const SOURCE_URL = 'https://telegram.me/s/offcampus_phodenge'; 
const EXCLUSIONS = [
    'amanchowdhury046',
    'https://whatsapp.com/channel/0029Va9Q0lkDZ4LYNx6ukw2u',
    'https://chat.whatsapp.com/GezthmmD5UCHkIIhHYE5I5',
    'https://telegram.me/offcampus_phodenge',
    'https://t.me/offcampusphodengediscussion'
];
// const MAX_JOBS_MANUAL = 20;

const { processJobUrl } = require('./processor');

const runOffcampusManual = async (bot, limit = 20) => {
    console.log(`🔄 Offcampus Phodenge Manual Trigger (Limit ${limit})...`);

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
             // The original check for existing job is now handled by processJobUrl and the new duplicate tracking logic
             // const existing = await Job.findOne({ $or: [{ originalUrl: link }, { applyUrl: link }] });
             // if (existing) {
             //     skipped++;
             //     continue;
             // }

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

             if (success && success.success) {
                 processed++;
                 consecutiveDuplicates = 0; // Reset
                 const lastJobId = success.jobId;

                 if (processed < limit && processed < jobsToProcess.length - skipped) {
                     const waitResult = await waitWithSkip(21000);
                     
                     if (waitResult === 'delete' && lastJobId) {
                         const jobToDelete = await Job.findById(lastJobId);
                         if (jobToDelete && jobToDelete.telegramMessageId) {
                             await deleteTelegramPost(bot, jobToDelete.telegramMessageId);
                             console.log('🗑️ Deleted from Telegram.');
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

        console.log(`📊 Offcampus Manual Complete: ${processed} new jobs, ${skipped} skipped.`);
        return { processed, skipped, action: 'complete' };

    } catch (err) {
        console.error('❌ Offcampus Manual Failed:', err.message);
        return { processed: 0, skipped: 0 };
    }
};

module.exports = { runOffcampusManual };
