const cron = require('node-cron');
const { processQueue, queueLinks } = require('./queueProcessor');
const { scrapeTalentdJobs } = require('../scraper');

/**
 * Periodically searches for new jobs from known sources and adds them to the queue.
 */
const runAutoScraper = async (bot) => {
    console.log('🕷️ Running Auto-Scraper for Talentd...');
    
    // 1. Talentd
    const talentdLinks = await scrapeTalentdJobs();
    await queueLinks(talentdLinks);
};

/**
 * Initializes all CRON jobs for the application.
 */
const initScheduler = (bot) => {
    // Run every 10 seconds to ensure second-level precision for queue
    cron.schedule('*/10 * * * * *', () => {
        processQueue(bot);
    });

    // Auto-Scraper (Talentd) - Runs every 4 hours
    cron.schedule('0 */4 * * *', () => {
        runAutoScraper(bot);
    });

    // RG Jobs Direct Import (every 2 hours)
    const { importRGJobsDirect } = require('../../scripts/importRGJobs');
    cron.schedule('0 */2 * * *', async () => {
        console.log('🔄 Running scheduled RG Jobs import...');
        await importRGJobsDirect(20);
    });
    
    // Indian Jobs API Import (every 3 days)
    try {
        const { importIndianApiJobs } = require('../../scripts/importIndianApiJobs');
        cron.schedule('0 0 */3 * *', async () => {
            console.log('🔄 Running scheduled Indian Jobs API import...');
            await importIndianApiJobs(50);
        });
    } catch (e) {
        console.warn('⚠️ Could not load Indian Jobs API importer:', e.message);
    }

    // AI Recovery Queue (every 15 mins)
    const { processRateLimitedJobs } = require('./aiQueue');
    cron.schedule('*/15 * * * *', async () => {
        await processRateLimitedJobs(bot);
    });

    console.log('⏰ Job Scheduler initialized (1 min checks + RG Jobs + Indian API + AI Recovery) [Talentd Auto-Scrape Disabled]');
};

module.exports = { initScheduler, runAutoScraper, queueLinks };
