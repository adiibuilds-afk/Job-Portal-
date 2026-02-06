const cron = require('node-cron');
const ScheduledJob = require('../models/ScheduledJob');
const { scrapeJobPage, scrapeTalentdJobs } = require('./scraper');
const { parseJobWithAI } = require('./groq');
const Job = require('../models/Job');
const setupBot = require('../bot'); // We will need to access the bot instance or move postToChannel logic

// Since postToChannel is inside the bot setup which is a function, we might need a way to access it.
// Alternatively, we can refactor postToChannel to be a standalone service or pass the bot instance here.
// For now, let's assume we can get the bot instance or copy the posting logic.
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp'); // For image compression

// Helper to download logo
const downloadAndSaveLogo = async (url) => {
    try {
        if (!url || !url.startsWith('http')) return null;

        const response = await axios({
            url,
            responseType: 'arraybuffer', // Sharp needs buffer
        });

        // Ensure directory exists
        const uploadDir = path.join(__dirname, '../../public/uploads/logos');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate filename (webp)
        const filename = `logo-${Date.now()}-${Math.floor(Math.random() * 1000)}.webp`;
        const filePath = path.join(uploadDir, filename);

        // Process with Sharp
        // Resize to 80px width (standard icon size), convert to WebP, quality 80
        await sharp(response.data)
            .resize(80) 
            .webp({ quality: 80 })
            .toFile(filePath);

        return `/uploads/logos/${filename}`;
    } catch (error) {
        console.error('Failed to download/compress logo:', error.message);
        return null; 
    }
};

const Settings = require('../models/Settings');

const processQueue = async (bot) => {
  try {
    const pauseSetting = await Settings.findOne({ key: 'posting_queue_paused' });
    if (pauseSetting && pauseSetting.value === true) {
        return;
    }

    const job = await ScheduledJob.findOne({ 
      status: 'pending', 
      scheduledFor: { $lte: new Date() } 
    }).sort({ scheduledFor: 1 });

    if (!job) {
        // console.log('No pending jobs ripe for posting.');
        return;
    }

    console.log(`🚀 Processing scheduled job: ${job.originalUrl}`);

    // 1. Scrape
    let enrichedText = `Job URL: ${job.originalUrl}`;
    const scraped = await scrapeJobPage(job.originalUrl);
    
    if (scraped.success) {
        enrichedText += `\n\nTitle: ${scraped.title}\n${scraped.content}`;
    }

    // 2. Parse with AI
    const jobData = await parseJobWithAI(enrichedText);

    if (!jobData || !jobData.title) {
        job.status = 'failed';
        job.error = 'AI Parsing failed';
        await job.save();
        console.error('AI Parsing failed for scheduled job');
        return;
    }

    // Ensure apply URL
    if (!jobData.applyUrl || jobData.applyUrl === 'N/A') {
        // Fallback to original URL only if it's NOT an aggregator like Talentd
        if (job.originalUrl && !job.originalUrl.includes('talentd.in')) {
            jobData.applyUrl = job.originalUrl;
        }
    }

    // STRICT FILTER: User requested NO Talentd apply links
    if (jobData.applyUrl && jobData.applyUrl.includes('talentd.in')) {
        console.log('🚫 Removing Talentd apply link explicitly.');
        jobData.applyUrl = ''; 
    }

    // Assign company logo from scraper if AI missed it
    if (!jobData.companyLogo && scraped.companyLogo) {
        jobData.companyLogo = scraped.companyLogo;
    }

    // Sanitize Logo: Remove generic/placeholder logos
    if (jobData.companyLogo && jobData.companyLogo.includes('talentd-orange-icon.avif')) {
        console.log('🚫 Removing generic Talentd logo.');
        jobData.companyLogo = ''; // Set to empty so frontend shows initial
    }

    // Localize/Proxy specific external logos (e.g. brain.talentd.in)
    if (jobData.companyLogo && jobData.companyLogo.includes('brain.talentd.in')) {
        console.log(`📥 Downloading logo: ${jobData.companyLogo}`);
        const localLogo = await downloadAndSaveLogo(jobData.companyLogo);
        if (localLogo) {
            jobData.companyLogo = localLogo; // Use local path
        }
    }

    // 3. De-duplication Check (Content-based)
    // Check if an active job with same Title and Company exists
    const existingJob = await Job.findOne({
        title: { $regex: new RegExp(`^${jobData.title}$`, 'i') },
        company: { $regex: new RegExp(`^${jobData.company}$`, 'i') },
        isActive: true
    });

    if (existingJob) {
        job.status = 'failed';
        job.error = `Duplicate Content: ${jobData.title} at ${jobData.company}`;
        await job.save();
        console.log(`⚠️ Skipped duplicate job: ${jobData.title} at ${jobData.company}`);
        return;
    }

    // 4. Save to DB
    const newJob = new Job(jobData);
    await newJob.save();

    // 4. Post to Telegram
    const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
    const WEBSITE_URL = process.env.WEBSITE_URL || 'https://jobgrid.in';

    if (CHANNEL_ID) {
        const jobUrl = `${WEBSITE_URL}/job/${newJob.slug}`;
        
        let message = `🎯 *New Job Alert!*\n\n`;
        if (jobData.company) message += `🏢 *Company:* ${jobData.company}\n`;
        if (jobData.title) message += `📌 *Role:* ${jobData.title}\n`;
        if (jobData.eligibility && jobData.eligibility !== 'N/A') message += `\n👥 *Batch/Eligibility:*\n${jobData.eligibility}\n`;
        if (jobData.salary && jobData.salary !== 'N/A') message += `\n💰 *Salary:* ${jobData.salary}`;
        if (jobData.location && jobData.location !== 'N/A') message += `\n📍 *Location:* ${jobData.location}`;
        
        message += `\n\n🔗 *Apply Now:*\n${jobUrl}\n\n━━━━━━━━━━━━━━━\n📢 @jobgridupdates`;

        await bot.telegram.sendMessage(CHANNEL_ID, message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: false,
        });
        console.log(`✅ Posted to channel: ${newJob.title}`);
    }

    // 5. Update Status
    job.status = 'processed';
    await job.save();

  } catch (err) {
    console.error('Error processing scheduled job:', err);
    // If we have the job object, mark as failed
    // job.status = 'failed'; // difficult to access job here if findOne failed, but if processing failed we likely have it.
    // simpler to just retry later or manual cleanup for MVP
  }
};


// ... existing processQueue ...

const runAutoScraper = async (bot) => {
    console.log('🕷️ Running Auto-Scraper for Talentd & RG Jobs...');
    const { scrapeTalentdJobs, scrapeRgJobs } = require('./scraper');
    
    // 1. Talentd
    const talentdLinks = await scrapeTalentdJobs();
    await queueLinks(talentdLinks);

    // 2. RG Jobs
    const rgLinks = await scrapeRgJobs();
    await queueLinks(rgLinks);
};

const queueLinks = async (links) => {
    // 1. Get the latest scheduled time effectively
    // We look for the latest pending job to append to the end of the queue
    const lastJob = await ScheduledJob.findOne({ status: 'pending' }).sort({ scheduledFor: -1 });
    
    let nextScheduleTime = lastJob ? new Date(lastJob.scheduledFor) : new Date();
    
    // If the queue is empty or the last job was in the past, start from NOW
    if (nextScheduleTime < new Date()) {
        nextScheduleTime = new Date();
    }

    let queuedCount = 0;

    for (const link of links) {
        // Check if exists in Jobs (already posted)
        const exists = await Job.findOne({ $or: [{ originalUrl: link }, { applyUrl: link }] });
        if (exists) continue;

        // Check if already queued
        const queued = await ScheduledJob.findOne({ originalUrl: link });
        if (queued) continue;

        // Check Interval Setting
        const intervalSetting = await Settings.findOne({ key: 'schedule_interval_minutes' });
        const intervalMinutes = intervalSetting ? parseInt(intervalSetting.value) : 60; // Default 60 mins

        // Add interval buffer for the next slot
        nextScheduleTime = new Date(nextScheduleTime.getTime() + intervalMinutes * 60000);

        // Add to Queue
        const newQueue = new ScheduledJob({
            originalUrl: link,
            scheduledFor: nextScheduleTime,
            status: 'pending'
        });
        await newQueue.save();
        console.log(`✅ Queued new job: ${link} for ${nextScheduleTime.toLocaleString()}`);
        queuedCount++;
    }
    return queuedCount;
};

const initScheduler = (bot) => {
    // Run every minute to check if any 5-min slot has passed
    cron.schedule('* * * * *', () => {
        processQueue(bot);
    });

    // Run Auto-Scraper every hour (for Talentd with AI processing)
    cron.schedule('0 * * * *', () => {
        runAutoScraper(bot);
    });

    // RG Jobs Direct Import (every 2 hours, AI + 30s delay, max 20 jobs)
    const { importRGJobsDirect } = require('../scripts/importRGJobs');
    cron.schedule('0 */2 * * *', async () => {
        console.log('🔄 Running scheduled RG Jobs import...');
        await importRGJobsDirect(20);
    });
    
    
    // Indian Jobs API Import (every 3 days)
    const { importIndianApiJobs } = require('../scripts/importIndianApiJobs');
    cron.schedule('0 0 */3 * *', async () => {
        console.log('🔄 Running scheduled Indian Jobs API import...');
        // Standard limit 50, or as needed
        await importIndianApiJobs(50);
    });

    console.log('⏰ Job Scheduler initialized (1 min checks + Hourly Scraper + 2hr RG Jobs + 3d Indian API)');
};

module.exports = { initScheduler, runAutoScraper, queueLinks };
