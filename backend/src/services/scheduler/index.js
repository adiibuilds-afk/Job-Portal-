const cron = require('node-cron');
const { processQueue, queueLinks } = require('./queueProcessor');
const { scrapeTalentdJobs, scrapeRgJobs } = require('../scraper');

/**
 * Periodically searches for new jobs from known sources and adds them to the queue.
 */
const runAutoScraper = async (bot) => {
    console.log('🕷️ Running Auto-Scraper for Talentd & RG Jobs...');
    
    // 1. Talentd
    const talentdLinks = await scrapeTalentdJobs();
    await queueLinks(talentdLinks);

    // 2. RG Jobs
    const rgLinks = await scrapeRgJobs();
    await queueLinks(rgLinks);
};

/**
 * Initializes all CRON jobs for the application.
 */
const initScheduler = (bot) => {
    // Run every minute to check if any scheduled jobs are due
    cron.schedule('* * * * *', () => {
        processQueue(bot);
    });

    // Run Auto-Scraper every hour
    cron.schedule('0 * * * *', () => {
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

    console.log('⏰ Job Scheduler initialized (1 min checks + Hourly Scraper + 2hr RG Jobs + 3d Indian API)');
};

module.exports = { initScheduler, runAutoScraper, queueLinks };
