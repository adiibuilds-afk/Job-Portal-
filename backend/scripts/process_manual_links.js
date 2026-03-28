const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { scrapeJobPage } = require('../src/services/scraper');
const { parseJobWithAI } = require('../src/services/groq');
const { refineJobWithAI, finalizeJobData } = require('../src/services/jobProcessor');
const Job = require('../src/models/Job');
const { downloadAndProcessLogo: downloadAndSaveLogo } = require('../src/utils/imageProcessor');

const processManualLinks = async () => {
    console.log('🚀 Starting Manual Link Processing...');

    // 1. Read Links from file
    const linksFilePath = path.join(__dirname, '../links.txt');
    if (!fs.existsSync(linksFilePath)) {
        console.error('❌ links.txt not found in backend directory!');
        process.exit(1);
    }

    const fileContent = fs.readFileSync(linksFilePath, 'utf-8');
    
    // Extract URLs using Regex
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const links = fileContent.match(urlRegex) || [];

    if (links.length === 0) {
        console.log('⚠️ No links found in links.txt');
        process.exit(0);
    }

    console.log(`Found ${links.length} links to process.`);

    // 2. Connect to DB
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (e) {
        console.error('❌ DB Connection Error:', e);
        process.exit(1);
    }

    // --- NOTIFICATION INIT ---
    let bot = null;
    let tgBundler = null;
    let waBundler = null;
    const { postJobToTelegram } = require('../src/services/sources/utils');

    if (process.env.TELEGRAM_BOT_TOKEN) {
        try {
            const { Telegraf } = require('telegraf');
            const TelegramBatchBundler = require('../src/services/sources/telegramBatchBundler');
            const WhatsAppBundler = require('../src/services/sources/whatsappBundler');
            
            bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
            tgBundler = new TelegramBatchBundler(bot);
            
            const adminId = process.env.ADMIN_ID || process.env.ToID;
            if (adminId) {
                waBundler = new WhatsAppBundler(bot, adminId);
                console.log('✅ WhatsApp Bundler Initialized');
            } else {
                console.warn('⚠️ ADMIN_ID not set. WhatsApp Bundler disabled.');
            }
            console.log('✅ Telegram Bot & Bundlers Initialized');
        } catch (e) {
            console.error('❌ Failed to init notifications:', e.message);
        }
    }
    // -------------------------

    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // 3. Process Each Link
    for (const link of links) {
        try {
            console.log(`\n🔄 Processing: ${link}`);

            // Clean URL for Strict Check
            const cleanLink = link.split('?')[0];
            const exists = await Job.findOne({ 
                $or: [
                    { originalUrl: link }, 
                    { applyUrl: link },
                    { applyUrl: { $regex: new RegExp(`^${cleanLink}`, 'i') } }
                ] 
            });

            if (exists) {
                console.log(`🛑 Found existing job: ${link}`);
                skippedCount++;
                continue;
            }

            // Scrape Details
            const scraped = await scrapeJobPage(link);
            if (!scraped.success) {
                console.error(`❌ Scrape Failed for ${link}: ${scraped.error}`);
                errorCount++;
                continue;
            }

            // AI Extraction
            let enrichedText = `Job URL: ${link}\n\nTitle: ${scraped.title}\n${scraped.content}`;
            const extractedData = await parseJobWithAI(enrichedText);
            
            if (!extractedData || !extractedData.title) {
                console.error(`❌ AI Extraction Failed for ${link}`);
                errorCount++;
                continue;
            }

            // AI Refinement
            const refinedData = await refineJobWithAI(extractedData);

            if (refinedData && refinedData.error === 'rate_limit_exceeded') {
                console.error('🛑 AI Rate Limit Exceeded!');
                break;
            }

            // Finalize Data
            const rawData = {
                ...extractedData,
                applyUrl: scraped.applyUrl || extractedData.applyUrl,
                companyLogo: scraped.companyLogo || extractedData.companyLogo,
                company: scraped.company || extractedData.company,
                tags: scraped.tags || extractedData.tags,
                batch: scraped.batch || extractedData.batch
            };

            const jobData = await finalizeJobData(refinedData || {}, rawData);
            jobData.originalUrl = link;

            // Post-Processing (Logo)
            if (jobData.companyLogo && (jobData.companyLogo.includes('brain.talentd.in') || jobData.companyLogo.startsWith('http'))) {
                 if (!jobData.companyLogo.includes('talentd-orange-icon.avif')) {
                    const localLogo = await downloadAndSaveLogo(jobData.companyLogo, jobData.company);
                    if (localLogo) jobData.companyLogo = localLogo;
                 } else {
                     jobData.companyLogo = '';
                 }
            }


            // Post-Fix: Sync Batch with Eligibility
            if (jobData.eligibility) {
                const yearRegex = /\b20[2-3][0-9]\b/g;
                const yearsInEligibility = jobData.eligibility.match(yearRegex) || [];
                if (yearsInEligibility.length > 0) {
                     // Merge with existing batch, removing duplicates
                     const currentBatch = jobData.batch || [];
                     jobData.batch = [...new Set([...currentBatch, ...yearsInEligibility])].sort().reverse();
                }
            }

            // Save
            const newJob = new Job(jobData);
            newJob.slug = slugify(jobData.title + ' ' + jobData.company + ' ' + Math.random().toString(36).substr(2, 5));
            
            await newJob.save();
            console.log(`✅ Saved: ${newJob.title} at ${newJob.company}`);
            processedCount++;

            // --- NOTIFICATIONS ---
            if (bot) {
                // 1. Thread Notification
                if (tgBundler) await tgBundler.addJob(newJob);
                
                // 2. Main Channel Notification
                await postJobToTelegram(newJob, bot);

                // 3. WhatsApp Bundle
                if (waBundler) await waBundler.addJob(newJob);

                console.log(`📢 Notifications queued/sent.`);
            }
            // ---------------------

        } catch (err) {
            console.error(`❌ Error processing ${link}:`, err.message);
            errorCount++;
        }
    }

    // --- FLUSH BUNDLERS ---
    if (waBundler) {
        console.log('🧹 Flushing WhatsApp Bundler...');
        await waBundler.flush();
    }
    // ----------------------


    console.log('\n--- Processing Complete ---');
    console.log(`✅ Processed: ${processedCount}`);
    console.log(`⏩ Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    await mongoose.disconnect();
    process.exit(0);
};

// Simple slugify helper if not imported or specific requirement
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

processManualLinks();
