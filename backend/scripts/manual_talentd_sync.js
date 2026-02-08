const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { scrapeTalentdJobs } = require('../src/services/scraper/talentdScraper');
const { scrapeJobPage } = require('../src/services/scraper');
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
    console.log('🕷️ Scraping Talentd Listing Page...');
    const links = await scrapeTalentdJobs();
    console.log(`found ${links.length} potential jobs.`);

    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // 3. Process Each Link
    for (const link of links) {
        try {
            // Check Duplicate
            const exists = await Job.findOne({ $or: [{ originalUrl: link }, { applyUrl: link }] });
            if (exists) {
                console.log(`⏩ Skipped (Already Exists): ${link}`);
                skippedCount++;
                continue;
            }

            console.log(`\n🔄 Processing: ${link}`);
            
            // Scrape Details (Local Puppeteer)
            const scraped = await scrapeJobPage(link);
            if (!scraped.success) {
                console.error(`❌ Scrape Failed associated with ${link}: ${scraped.error}`);
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

            if (jobData.companyLogo && jobData.companyLogo.includes('talentd-orange-icon.avif')) {
                jobData.companyLogo = ''; 
            }

            if (jobData.companyLogo && (jobData.companyLogo.includes('brain.talentd.in') || jobData.companyLogo.startsWith('http'))) {
                const localLogo = await downloadAndSaveLogo(jobData.companyLogo, jobData.company);
                if (localLogo) jobData.companyLogo = localLogo;
            }

            // Duplicate Check by Title/Company
            const doubleCheck = await Job.findOne({
                title: { $regex: new RegExp(`^${jobData.title}$`, 'i') },
                company: { $regex: new RegExp(`^${jobData.company}$`, 'i') },
                isActive: true
            });

            if (doubleCheck) {
                console.log(`⚠️ Skipped (Duplicate Content): ${jobData.title} at ${jobData.company}`);
                skippedCount++;
                continue;
            }

            // Save
            const newJob = new Job(jobData);
            await newJob.save();
            console.log(`✅ Saved: ${newJob.title} at ${newJob.company}`);
            processedCount++;

            // Rate Limiting / Politeness
            await new Promise(r => setTimeout(r, 2000));

        } catch (err) {
            console.error(`❌ Error processing ${link}:`, err.message);
            errorCount++;
        }
    }

    console.log('\n--- Sync Complete ---');
    console.log(`✅ New Jobs Saved: ${processedCount}`);
    console.log(`⏩ Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    await mongoose.disconnect();
    process.exit(0);
};

manualSync();
