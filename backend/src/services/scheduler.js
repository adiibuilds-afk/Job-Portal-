const cron = require('node-cron');
const ScheduledJob = require('../models/ScheduledJob');
const { scrapeJobPage } = require('./scraper');
const { parseJobWithAI } = require('./groq');
const Job = require('../models/Job');
const setupBot = require('../bot'); // We will need to access the bot instance or move postToChannel logic

// Since postToChannel is inside the bot setup which is a function, we might need a way to access it.
// Alternatively, we can refactor postToChannel to be a standalone service or pass the bot instance here.
// For now, let's assume we can get the bot instance or copy the posting logic.
// A better approach is to make postToChannel a shared service.

// We will restart the bot to get the instance or just use Telegraf to send message directly if we have token and channel ID.

const processQueue = async (bot) => {
  console.log('⏳ Checking for scheduled jobs...');
  
  try {
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
        jobData.applyUrl = job.originalUrl;
    }

    // 3. Save to DB
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

const initScheduler = (bot) => {
    // Run every minute to check if any 5-min slot has passed
    cron.schedule('* * * * *', () => {
        processQueue(bot);
    });
    console.log('⏰ Job Scheduler initialized (1 min checks)');
};

module.exports = { initScheduler };
