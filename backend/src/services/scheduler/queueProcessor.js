const { scrapeJobPage } = require('../scraper');
const { parseJobWithAI } = require('../groq');
const Job = require('../../models/Job');
const ScheduledJob = require('../../models/ScheduledJob');
const Settings = require('../../models/Settings');
const { downloadAndProcessLogo: downloadAndSaveLogo } = require('../../utils/imageProcessor');

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
        return;
    }

    console.log(`🚀 Processing scheduled job: ${job.originalUrl}`);

    // 1. Scrape
    let enrichedText = `Job URL: ${job.originalUrl}`;
    const scraped = await scrapeJobPage(job.originalUrl);
    
    if (scraped.success) {
        enrichedText += `\n\nTitle: ${scraped.title}\n${scraped.content}`;
    }

    // 2. Parse with AI (Extraction)
    const extractedData = await parseJobWithAI(enrichedText);

    if (!extractedData || !extractedData.title) {
        job.status = 'failed';
        job.error = 'AI Extraction failed';
        await job.save();
        console.error('AI Extraction failed for scheduled job');
        return;
    }

    // 3. Refine with AI (SEO Template / Consistency)
    const { refineJobWithAI, finalizeJobData } = require('../jobProcessor');
    const refinedData = await refineJobWithAI(extractedData);

    // 4. Finalize Job Object
    // Pass captured data (scraped) as fallbacks/base to finalizeJobData
    const rawData = {
        ...extractedData,
        applyUrl: scraped.applyUrl || extractedData.applyUrl,
        companyLogo: scraped.companyLogo || extractedData.companyLogo,
        company: scraped.company || extractedData.company,
        tags: scraped.tags || extractedData.tags,
        batch: scraped.batch || extractedData.batch
    };

    const jobData = await finalizeJobData(refinedData || {}, rawData);

    // Ensure apply URL is not a Talentd link if we have a better one
    if (jobData.applyUrl && jobData.applyUrl.includes('talentd.in/jobs/')) {
        if (scraped.applyUrl && !scraped.applyUrl.includes('talentd.in')) {
            console.log(`📎 Overriding AI applyUrl with captured link: ${scraped.applyUrl}`);
            jobData.applyUrl = scraped.applyUrl;
        }
    }

    // Assign company logo from scraper if AI missed it
    if (!jobData.companyLogo && scraped.companyLogo) {
        jobData.companyLogo = scraped.companyLogo;
    }

    // Sanitize Logo
    if (jobData.companyLogo && jobData.companyLogo.includes('talentd-orange-icon.avif')) {
        console.log('🚫 Removing generic Talentd logo.');
        jobData.companyLogo = ''; 
    }

    // Localize/Proxy ALL external logos to ensure consistency (Square, Resized)
    if (jobData.companyLogo && 
        jobData.companyLogo.startsWith('http') && 
        !jobData.companyLogo.includes('res.cloudinary.com')) {
        
        console.log(`📥 Downloading and resizing logo: ${jobData.companyLogo}`);
        const localLogo = await downloadAndSaveLogo(jobData.companyLogo, jobData.company);
        if (localLogo) {
            jobData.companyLogo = localLogo; 
        }
    }

    // 3. De-duplication Check
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
        
        // Simple HTML Escaping
        const escapeHTML = (str) => {
            if (!str) return '';
            return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };

        let message = `🎯 <b>New Job Alert!</b>\n\n`;
        if (jobData.company) message += `🏢 <b>Company:</b> ${escapeHTML(jobData.company)}\n`;
        if (jobData.title) message += `📌 <b>Role:</b> ${escapeHTML(jobData.title)}\n`;
        if (jobData.eligibility && jobData.eligibility !== 'N/A') message += `\n👥 <b>Batch/Eligibility:</b>\n${escapeHTML(jobData.eligibility)}\n`;
        if (jobData.salary && jobData.salary !== 'N/A') message += `\n💰 <b>Salary:</b> ${escapeHTML(jobData.salary)}`;
        if (jobData.location && jobData.location !== 'N/A') message += `\n📍 <b>Location:</b> ${escapeHTML(jobData.location)}`;
        
        message += `\n\n🔗 <b>Apply Now:</b>\n${jobUrl}\n\n━━━━━━━━━━━━━━━\n\n📢 <b>Join Our Channels:</b>\n\n🔹 Telegram :- https://t.me/jobgridupdates\n\n🔹 WhatsApp Channel :- https://whatsapp.com/channel/0029Vak74nQ0wajvYa3aA432\n\n🔹 WhatsApp Group :- https://chat.whatsapp.com/EuNhXQkwy7Y4ELMjB1oVPd?mode=gi_t\n\n🔹 LinkedIn :- https://www.linkedin.com/company/jobgrid-in`;
        await bot.telegram.sendMessage(CHANNEL_ID, message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        });
        console.log(`✅ Posted to channel: ${newJob.title}`);
    }

    // 5. Update Status
    job.status = 'processed';
    await job.save();

  } catch (err) {
    console.error('Error processing scheduled job:', err);
  }
};

const queueLinks = async (links) => {
    const lastJob = await ScheduledJob.findOne({ status: 'pending' }).sort({ scheduledFor: -1 });
    let nextScheduleTime = lastJob ? new Date(lastJob.scheduledFor) : new Date();
    
    if (nextScheduleTime < new Date()) {
        nextScheduleTime = new Date();
    }

    let queuedCount = 0;

    for (const link of links) {
        const exists = await Job.findOne({ $or: [{ originalUrl: link }, { applyUrl: link }] });
        if (exists) continue;

        const queued = await ScheduledJob.findOne({ originalUrl: link });
        if (queued) continue;

        const intervalValueSetting = await Settings.findOne({ key: 'queue_interval_value' });
        const intervalUnitSetting = await Settings.findOne({ key: 'queue_interval_unit' }); // 'minutes' or 'seconds'
        
        // Fallback for legacy 'schedule_interval_minutes' if new settings not found
        const legacyInterval = await Settings.findOne({ key: 'schedule_interval_minutes' });

        let intervalMs = 60 * 60000; // Default 60 mins

        if (intervalValueSetting) {
            const val = parseInt(intervalValueSetting.value);
            const unit = intervalUnitSetting ? intervalUnitSetting.value : 'minutes';
            
            if (unit === 'seconds') {
                intervalMs = val * 1000;
            } else {
                intervalMs = val * 60000;
            }
        } else if (legacyInterval) {
            intervalMs = parseInt(legacyInterval.value) * 60000;
        }

        nextScheduleTime = new Date(nextScheduleTime.getTime() + intervalMs);

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

module.exports = { processQueue, queueLinks };
