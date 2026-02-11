const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { scrapeTalentdJobs, scrapeJobPage } = require('../src/services/scraper');
const { parseJobWithAI } = require('../src/services/groq');
const { refineJobWithAI, finalizeJobData } = require('../src/services/jobProcessor');
const Job = require('../src/models/Job');
const { downloadAndProcessLogo: downloadAndSaveLogo } = require('../src/utils/imageProcessor');

const manualSync = async () => {
    console.log('🚀 Starting Manual Talentd Sync...');
    
    // 1. Connect to DB
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (e) {
        console.error('❌ DB Connection Error:', e);
        process.exit(1);
    }

    // 2. Fetch Latest Links
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let page = 1;
    let stopSync = false;
    let consecutiveDuplicates = 0;

    while (!stopSync && page <= 10) { // Safety limit of 10 pages
        console.log(`\n📄 Scraping Page ${page}...`);
        const links = await scrapeTalentdJobs(page);

        if (links.length === 0) {
            console.log('⚠️ No more jobs found on this page. Stopping.');
            break;
        }

        console.log(`found ${links.length} potential jobs on page ${page}.`);

        // 3. Process Each Link
        for (const link of links) {
            if (stopSync) break;

            try {
                // Clean URL for Strict Check
                const cleanLink = link.split('?')[0];
                const exists = await Job.findOne({ 
                    $or: [
                        { originalUrl: link }, 
                        { applyUrl: link },
                        { applyUrl: { $regex: new RegExp(`^${cleanLink}`, 'i') } } // Check base URL match
                    ] 
                });

                if (exists) {
                    console.log(`🛑 Found existing job: ${link}`);
                    consecutiveDuplicates++;
                    if (consecutiveDuplicates >= 5) {
                        console.log('✅ Sync is caught up (5 consecutive duplicates). Stopping.');
                        stopSync = true;
                        break;
                    }
                    skippedCount++;
                    continue;
                }

                // Reset counter if new job found (or at least not a direct URL match)
                consecutiveDuplicates = 0;
                
                // Global Clean Stop
                if (processedCount >= 40) {
                     console.log('🛑 limit of 40 new jobs reached. Stopping.');
                     stopSync = true;
                     break;
                }


                console.log(`\n🔄 Processing: ${link}`);
                
                // Scrape Details (Local Puppeteer)
                const scraped = await scrapeJobPage(link);
                if (!scraped.success) {
                    console.error(`❌ Scrape Failed associated with ${link}: ${scraped.error}`);
                    errorCount++;
                    continue;
                }

                // --- EARLY DUPLICATE CHECK (Saves AI Tokens & Cloudinary) ---
                const cleanScrapedApplyUrl = scraped.applyUrl ? scraped.applyUrl.split('?')[0] : '';
                const scrapedTitle = scraped.title;
                const scrapedCompany = scraped.company;

                // 1. Strict URL Check
                if (cleanScrapedApplyUrl) {
                    const urlExists = await Job.findOne({ 
                        applyUrl: { $regex: new RegExp(`^${cleanScrapedApplyUrl}`, 'i') } 
                    });
                    if (urlExists) {
                        console.log(`⚠️ Skipped (Duplicate URL found after scrape): ${scraped.applyUrl}`);
                        skippedCount++;
                        continue;
                    }
                }

                // 2. Strict Title/Company Check
                const potentialDuplicates = await Job.find({
                    title: { $regex: new RegExp(`^${scrapedTitle}$`, 'i') },
                    isActive: true
                });

                let isFuzzyDuplicate = false;
                for (const potential of potentialDuplicates) {
                    const dbCompany = potential.company.toLowerCase();
                    const newCompany = scrapedCompany.toLowerCase();
                    if (dbCompany.includes(newCompany) || newCompany.includes(dbCompany)) {
                        isFuzzyDuplicate = true;
                        break;
                    }
                }

                if (isFuzzyDuplicate) {
                    console.log(`⚠️ Skipped (Strict Duplicate found after scrape): ${scrapedTitle} at ${scrapedCompany}`);
                    skippedCount++;
                    continue;
                }
                // --- END EARLY CHECK ---

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
                    console.error('🛑 AI Rate Limit Exceeded! Stopping Sync to prevent incomplete data.');
                    stopSync = true;
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

                // Post-Processing (Logo, Links)
                if (jobData.applyUrl && jobData.applyUrl.includes('talentd.in/jobs/')) {
                    if (scraped.applyUrl && !scraped.applyUrl.includes('talentd.in')) {
                        jobData.applyUrl = scraped.applyUrl;
                    }
                }

                // FILTER: Skip if link is still internal (Talentd)
                if (jobData.applyUrl && jobData.applyUrl.includes('talentd.in')) {
                    console.log(`⏩ Skipped (Internal Link Only): ${jobData.applyUrl}`);
                    skippedCount++;
                    continue;
                }

                if (jobData.companyLogo && jobData.companyLogo.includes('talentd-orange-icon.avif')) {
                    jobData.companyLogo = ''; 
                }

                if (jobData.companyLogo && (jobData.companyLogo.includes('brain.talentd.in') || jobData.companyLogo.startsWith('http'))) {
                    const localLogo = await downloadAndSaveLogo(jobData.companyLogo, jobData.company);
                    if (localLogo) jobData.companyLogo = localLogo;
                }


                // Save
                const newJob = new Job(jobData);
                newJob.slug = jobData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substr(2, 5); // Ensure slug
                await newJob.save();
                console.log(`✅ Saved: ${newJob.title} at ${newJob.company}`);
                console.log(`🔗 Final Apply URL: ${newJob.applyUrl}`);
                processedCount++;
                totalProcessed++;

                // TELEGRAM NOTIFICATION
                if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID) {
                    try {
                        const { Telegraf } = require('telegraf');
                        const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
                        const channelId = process.env.TELEGRAM_CHANNEL_ID;
                        const websiteUrl = process.env.WEBSITE_URL || 'https://jobgrid.in';
                        const jobUrl = `${websiteUrl}/job/${newJob.slug}`;

                        let message = `🎯 *New Job Alert!*\n\n`;
                        if (newJob.company) message += `🏢 *Company:* ${newJob.company}\n`;
                        if (newJob.title) message += `📌 *Role:* ${newJob.title}\n`;
                        if (newJob.eligibility && newJob.eligibility !== 'N/A') message += `\n👥 *Batch/Eligibility:*\n${newJob.eligibility}\n`;
                        if (newJob.salary && newJob.salary !== 'N/A') message += `\n💰 *Salary:* ${newJob.salary}`;
                        if (newJob.location && newJob.location !== 'N/A') message += `\n📍 *Location:* ${newJob.location}`;
                        
                        message += `\n\n🔗 *Apply Now:*\n${jobUrl}\n\n━━━━━━━━━━━━━━━\n\n📢 *Join Our Channels:*\n\n🔹 Telegram :- https://t.me/jobgridupdates\n\n🔹 WhatsApp Channel :- https://whatsapp.com/channel/0029Vak74nQ0wajvYa3aA432\n\n🔹 WhatsApp Group :- https://chat.whatsapp.com/EuNhXQkwy7Y4ELMjB1oVPd?mode=gi_t\n\n🔹 LinkedIn :- https://www.linkedin.com/company/jobgrid-in`;

                        await bot.telegram.sendMessage(channelId, message, {
                            parse_mode: 'Markdown',
                            disable_web_page_preview: true,
                        });
                        console.log(`📢 Notification sent to Telegram!`);
                    } catch (tgError) {
                        console.error('⚠️ Telegram Notification Failed:', tgError.message);
                    }
                }

                // Rate Limiting / Politeness
                console.log('⏳ Waiting 60s before next job...');
                await new Promise(r => setTimeout(r, 60000));

            } catch (err) {
                console.error(`❌ Error processing ${link}:`, err.message);
                errorCount++;
            }
        }
        
        page++;
    }

    console.log('\n--- Sync Complete ---');
    console.log(`✅ Total New Jobs Saved: ${processedCount}`);
    console.log(`⏩ Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    await mongoose.disconnect();
    process.exit(0);
};

manualSync();
