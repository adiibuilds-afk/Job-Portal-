const cron = require('node-cron');
const { processQueue, queueLinks } = require('./queueProcessor');
const { scrapeTalentdJobs } = require('../scraper');

/**
 * Periodically searches for new jobs from known sources and adds them to the queue.
 */
const runAutoScraper = async (bot) => {
    console.log('🕷️ Running Auto-Scraper for Talentd...');
    
    // --- BUNDLERS INIT ---
    const WhatsAppBundler = require('../sources/whatsappBundler');
    const LinkedInBundler = require('../sources/linkedinBundler');
    const adminId = process.env.ToID || process.env.ADMIN_ID; 
    
    // Create instances
    const waBundler = new WhatsAppBundler(bot, adminId);
    const liBundler = new LinkedInBundler(bot, adminId);

    // Helper to add to both
    const compositeBundler = {
        addJob: async (job) => {
            await waBundler.addJob(job);
            await liBundler.addJob(job);
        },
        removeJob: async (jobId) => {
            await waBundler.removeJob(jobId);
            await liBundler.removeJob(jobId);
        }
    };
    
    // 1. Talentd
    try {
        const talentdLinks = await scrapeTalentdJobs();
        await queueLinks(talentdLinks);
    } catch (e) {
        console.error('❌ Talentd Scraper Failed:', e.message);
    }

    // 2. Telegram Channel (InternFreak)
    try {
        // telegramScraper exports the function directly
        const scrapeTelegramChannel = require('../scraper/telegramScraper');
        // Scrape generic InternFreak channel
        const telegramLinks = await scrapeTelegramChannel('https://telegram.me/s/internfreak');
        await queueLinks(telegramLinks);
    } catch (e) {
        console.error('❌ Telegram Scraper Failed:', e.message);
    }

    // ... (RG Jobs stays same) ...

    // 6. FreshersJobsAdda
    try {
        // Export is runFreshersJobsAaddaManual (note the double 'a' in Aadda)
        const { runFreshersJobsAaddaManual } = require('../sources/freshersjobsaadda');
        await runFreshersJobsAaddaManual(bot, 10, compositeBundler);
    } catch (e) {
         console.error('❌ FreshersJobsAdda Failed:', e.message);
    }

    // ...

    // 10. OffCampus (Telegram)
    try {
        // Export is runOffcampusManual (lowercase 'c')
        const { runOffcampusManual } = require('../sources/offcampus');
        await runOffcampusManual(bot, 10, compositeBundler);
    } catch (e) {
        console.error('❌ OffCampus Failed:', e.message);
    }

    // 3. RG Jobs (Direct Import)
    try {
        const { importRGJobsDirect } = require('../../scripts/importRGJobs');
        await importRGJobsDirect(15); 
    } catch (e) {
        console.error('❌ RG Jobs Import Failed:', e.message);
    }



    // 4. DotAware (Telegram)
    try {
        const { runDotAwareManual } = require('../sources/dotaware');
        await runDotAwareManual(bot, 10, compositeBundler);
    } catch (e) {
        console.error('❌ DotAware Scraper Failed:', e.message);
    }

    // 5. FresherOffCampus (RSS)
    try {
        const { runFresherOffCampusManual } = require('../sources/fresheroffcampus');
        await runFresherOffCampusManual(bot, 10, compositeBundler);
    } catch (e) {
        console.error('❌ FresherOffCampus Failed:', e.message);
    }

    // 6. FreshersJobsAdda
    try {
        const { runFreshersJobsAaddaManual } = require('../sources/freshersjobsaadda');
        await runFreshersJobsAaddaManual(bot, 10, compositeBundler);
    } catch (e) {
         console.error('❌ FreshersJobsAdda Failed:', e.message);
    }

    // 7. GoCareers
    try {
        const { runGoCareersManual } = require('../sources/gocareers');
        await runGoCareersManual(bot, 10, compositeBundler);
    } catch (e) {
        console.error('❌ GoCareers Failed:', e.message);
    }

    // 8. InternFreak (Direct Source)
    try {
        const { runInternFreakManual } = require('../sources/internfreak');
        await runInternFreakManual(bot, 10, compositeBundler);
    } catch (e) {
        console.error('❌ InternFreak Failed:', e.message);
    }

    // 9. KrishnaKumar (Telegram)
    try {
        const { runKrishnaKumarManual } = require('../sources/krishnakumar');
        await runKrishnaKumarManual(bot, 10, compositeBundler);
    } catch (e) {
        console.error('❌ KrishnaKumar Failed:', e.message);
    }

    // 10. OffCampus (Telegram)
    try {
        const { runOffcampusManual } = require('../sources/offcampus');
        await runOffcampusManual(bot, 10, compositeBundler);
    } catch (e) {
        console.error('❌ OffCampus Failed:', e.message);
    }
    
    // Flush remaining jobs
    await waBundler.flush();
    await liBundler.flush();


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
