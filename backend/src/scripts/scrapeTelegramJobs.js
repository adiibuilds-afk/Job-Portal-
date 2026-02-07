/**
 * Telegram Channel Job Scraper
 * Scrapes job links from a Telegram channel web preview and adds them to the ScheduledJob queue.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Job = require('../models/Job');
const ScheduledJob = require('../models/ScheduledJob');
const Settings = require('../models/Settings');
const { scrapeTelegramChannel, scrapeJobPage } = require('../services/scraper');

const TELEGRAM_CHANNEL_URL = 'https://telegram.me/s/jobs_and_internships_updates';
const MAX_SCRAPE_LINKS = 15; // Limit per run to avoid rate limits

const runTelegramScraper = async () => {
    console.log(`[${new Date().toISOString()}] 🔄 Telegram Scraper Started...`);
    
    try {
        // 1. Scrape links from Telegram
        const links = await scrapeTelegramChannel(TELEGRAM_CHANNEL_URL);
        
        if (!links || links.length === 0) {
            console.log('❌ No links found in Telegram channel.');
            return;
        }

        // Limit to latest links
        const latestLinks = links.reverse().slice(0, MAX_SCRAPE_LINKS);
        console.log(`📋 Processing ${latestLinks.length} latest links from Telegram...`);

        // 2. Prepare queue settings
        const lastJob = await ScheduledJob.findOne({ status: 'pending' }).sort({ scheduledFor: -1 });
        let nextScheduleTime = lastJob ? new Date(lastJob.scheduledFor) : new Date();
        if (nextScheduleTime < new Date()) {
            nextScheduleTime = new Date();
        }

        const intervalSetting = await Settings.findOne({ key: 'schedule_interval_minutes' });
        const intervalMinutes = intervalSetting ? parseInt(intervalSetting.value) : 60;

        let queued = 0;
        let skipped = 0;

        for (const link of latestLinks) {
            try {
                // Deduplication check
                const existingJob = await Job.findOne({ applyUrl: link });
                const inQueue = await ScheduledJob.findOne({ originalUrl: link });

                if (existingJob || inQueue) {
                    skipped++;
                    continue;
                }

                // Scrape page to get a title at least
                console.log(`   🔎 Scraping page for details: ${link}`);
                const pageData = await scrapeJobPage(link);
                
                if (!pageData.success || !pageData.title) {
                    console.log(`   ⚠️ Could not extract details for ${link}, skipping.`);
                    skipped++;
                    continue;
                }

                // Add to queue
                nextScheduleTime = new Date(nextScheduleTime.getTime() + intervalMinutes * 60000);

                const queueItem = new ScheduledJob({
                    originalUrl: link,
                    scheduledFor: nextScheduleTime,
                    status: 'pending',
                    source: 'telegram_jobs',
                    // Store initial scraped data to help the processor
                    rgJobData: JSON.stringify({
                        title: pageData.title,
                        description: pageData.content,
                        companyLogo: pageData.companyLogo,
                        applyUrl: pageData.applyUrl || link
                    })
                });
                await queueItem.save();

                queued++;
                console.log(`   ✅ Queued: ${pageData.title.substring(0, 40)}... for ${nextScheduleTime.toLocaleString()}`);

            } catch (err) {
                console.error(`   ❌ Error processing link ${link}: ${err.message}`);
            }
        }

        console.log(`[${new Date().toISOString()}] 📊 Telegram Scraper Complete: ${queued} queued, ${skipped} skipped`);
    } catch (err) {
        console.error('❌ Telegram Scraper Failed:', err.message);
    }
};

// Standalone execution
if (require.main === module) {
    mongoose.set('strictQuery', false);
    mongoose.connect(process.env.MONGO_URI)
        .then(async () => {
            console.log('✅ Connected to MongoDB');
            await runTelegramScraper();
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ MongoDB Connection Error:', err);
            process.exit(1);
        });
}

module.exports = { runTelegramScraper };
