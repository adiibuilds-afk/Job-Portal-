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

const TELEGRAM_SOURCES = [
    {
        name: 'InternFreak',
        url: 'https://telegram.me/s/internfreak',
        exclusions: ['mercor', 'hour', 'internfreak.co', 'challenge', 'hackathon']
    },
    {
        name: 'GoCareers',
        url: 'https://telegram.me/s/gocareers',
        exclusions: []
    },
    {
        name: 'Offcampus Phodenge',
        url: 'https://telegram.me/s/offcampus_phodenge',
        exclusions: ['amanchowdhury046']
    },
    {
        name: 'Krishan Kumar',
        url: 'https://telegram.me/s/jobs_and_internships_updates',
        exclusions: []
    }
];

const MAX_SCRAPE_LINKS = 15; // Limit per channel to avoid rate limits
const DELAY_BETWEEN_CHANNELS = 5000; // 5 seconds delay

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runTelegramScraper = async () => {
    console.log(`[${new Date().toISOString()}] 🔄 Multi-Channel Telegram Scraper Started...`);
    
    let totalQueued = 0;
    let totalSkipped = 0;

    const intervalSetting = await Settings.findOne({ key: 'schedule_interval_minutes' });
    const intervalMinutes = intervalSetting ? parseInt(intervalSetting.value) : 60;

    for (const source of TELEGRAM_SOURCES) {
        console.log(`\n📡 Scraping Source: ${source.name} (${source.url})`);
        
        try {
            const links = await scrapeTelegramChannel(source.url, source.exclusions);
            
            if (!links || links.length === 0) {
                console.log(`   ❌ No links found for ${source.name}.`);
                continue;
            }

            // Process newest to oldest
            const latestLinks = links.reverse(); 
            // We don't slice strictly by 15 anymore, we want to go "till last run", but we rely on the duplicate check to stop.
            // However, we still only have the links present on the telegram preview page (usually last 20-50).
            
            console.log(`   📋 Found ${latestLinks.length} links. Processing...`);

            const lastJob = await ScheduledJob.findOne({ status: 'pending' }).sort({ scheduledFor: -1 });
            let nextScheduleTime = lastJob ? new Date(lastJob.scheduledFor) : new Date();
            if (nextScheduleTime < new Date()) {
                nextScheduleTime = new Date();
            }

            let consecutiveDuplicates = 0;

            for (const link of latestLinks) {
                // Global Limit Check
                if (totalQueued >= 40) {
                    console.log('   🛑 Global limit of 40 new jobs reached. Stopping script.');
                    return; // Exit the entire function
                }

                try {
                    // 1. Normalize Link (remove query params mostly)
                    const normalizeUrl = (u) => {
                        try {
                            const urlObj = new URL(u);
                            // Keep path, but maybe specific params are needed? usually not for dedup.
                            // Let's just strip utm_, ref, source, etc.
                            // Actually safest is to just use the base if possible, but some sites use params for ID.
                            // Let's try exact match first, if user says "not able to check", it's likely shortlinks -> resolved mismatch.
                            return u; 
                        } catch (e) { return u; }
                    };

                    // Initial Check (Pre-Scrape)
                    const existingJob = await Job.findOne({ applyUrl: link });
                    const inQueue = await ScheduledJob.findOne({ originalUrl: link });

                    if (existingJob || inQueue) {
                        consecutiveDuplicates++;
                        if (consecutiveDuplicates >= 5) {
                             console.log(`   ✅ Reached previously scraped jobs (5 consecutive duplicates). Stopping for this channel.`);
                             break; 
                        }
                        totalSkipped++;
                        continue;
                    }

                    // Reset duplicate counter if we find a new job (tentatively)
                    consecutiveDuplicates = 0;

                    console.log(`   🔎 Scraping page: ${link}`);
                    const pageData = await scrapeJobPage(link);
                    
                    if (!pageData.success || !pageData.title) {
                        console.log(`   ⚠️ Skipping (details missing): ${link}`);
                        totalSkipped++;
                        continue;
                    }

                    // 2. Post-Scrape Duplicate Check (CRITICAL for Shortlinks)
                    // Now that we have the REAL resolved URL, check if that exists in DB
                    if (pageData.applyUrl && pageData.applyUrl !== link) {
                        const existingResolved = await Job.findOne({ applyUrl: pageData.applyUrl });
                        if (existingResolved) {
                             console.log(`   ⚠️ Skipped (Resolved URL exists in DB): ${pageData.applyUrl}`);
                             // Treat as duplicate for "caught up" logic? 
                             // If we just resolved a shortlink to an old job, yes, it's a duplicate.
                             consecutiveDuplicates++; 
                             if (consecutiveDuplicates >= 5) {
                                  console.log(`   ✅ Reached previously scraped jobs (5 duplicates via resolution). Stopping.`);
                                  break;
                             }
                             totalSkipped++;
                             continue;
                        }
                    }

                    nextScheduleTime = new Date(nextScheduleTime.getTime() + intervalMinutes * 60000);

                    const queueItem = new ScheduledJob({
                        originalUrl: link,
                        scheduledFor: nextScheduleTime,
                        status: 'pending',
                        source: `telegram_${source.name.toLowerCase().replace(/\s+/g, '_')}`,
                        rgJobData: JSON.stringify({
                            title: pageData.title,
                            description: pageData.content,
                            companyLogo: pageData.companyLogo,
                            applyUrl: pageData.applyUrl || link
                        })
                    });
                    await queueItem.save();

                    totalQueued++;
                    console.log(`   ✅ Queued: ${pageData.title.substring(0, 40)}... [${nextScheduleTime.toLocaleString()}]`);

                } catch (err) {
                    console.error(`   ❌ Error processing link ${link}: ${err.message}`);
                }
            }
        } catch (err) {
            console.error(`   ❌ Failed to process source ${source.name}:`, err.message);
        }

        // Delay between channels
        if (TELEGRAM_SOURCES.indexOf(source) < TELEGRAM_SOURCES.length - 1) {
            console.log(`   ⏳ Waiting ${DELAY_BETWEEN_CHANNELS/1000}s before next channel...`);
            await sleep(DELAY_BETWEEN_CHANNELS);
        }
    }

    console.log(`\n[${new Date().toISOString()}] 📊 Overall Summary: ${totalQueued} queued, ${totalSkipped} skipped`);
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
