const scrapeTalentdJobs = require('../scraper/talentdScraper');
const { scrapeJobPage } = require('../scraper');
const { parseJobWithAI } = require('../groq');
const { refineJobWithAI, finalizeJobData } = require('../jobProcessor');
const { downloadAndProcessLogo: downloadAndSaveLogo } = require('../../utils/imageProcessor');
const Job = require('../../models/Job');
const { waitWithSkip, postJobToTelegram, deleteTelegramPost } = require('./utils');

const MAX_JOBS_MANUAL = 20;

const { processJobUrl } = require('./processor');

const runTalentdManual = async (bot, limit = 20, bundler) => {
    console.log(`🔄 Talentd Manual Trigger (Limit ${limit})...`);

    try {
        const links = await scrapeTalentdJobs(); // Page 1
        
        if (!links || links.length === 0) {
            console.log('❌ No links found.');
            return { processed: 0, skipped: 0 };
        }

        const jobsToProcess = links.slice(0, limit);

        let processed = 0;
        let skipped = 0;
        let consecutiveDuplicates = 0;

        for (const link of jobsToProcess) {
             // Scrape the job page first to get content and other details
             const scraped = await scrapeJobPage(link);

             const success = await processJobUrl(link, bot, {
                 content: scraped.success ? scraped.content : '',
                 title: scraped.success ? scraped.title : '',
                 company: scraped.success ? scraped.company : '',
                 companyLogo: scraped.success ? scraped.companyLogo : '',
                 bundler // Pass bundler
             });
             
             if (success && success.error === 'rate_limit') {
                 console.log('🛑 Rate Limit Exceeded');
                 return { processed, skipped, action: 'rate_limit' };
             }

             if (success && success.skipped && success.reason === 'duplicate') {
                 consecutiveDuplicates++;
                 skipped++;
                 console.log(`   🔸 Consecutive Duplicates: ${consecutiveDuplicates}/2`);
                 
                 // The check for consecutive duplicates is now at the beginning of the loop,
                 // so we just continue here.
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

        console.log(`📊 Talentd Manual Complete: ${processed} new jobs, ${skipped} skipped.`);
        return { processed, skipped, action: 'complete' };

    } catch (err) {
        console.error('❌ Talentd Manual Failed:', err.message);
        return { processed: 0, skipped: 0 };
    }
};

module.exports = { runTalentdManual };
