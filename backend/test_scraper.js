const { scrapeJobPage } = require('./src/services/scraper');
const { parseJobWithAI } = require('./src/services/groq');
require('dotenv').config();

const TARGET_URL = 'https://www.rgjobs.in/job/1694/software-engineer-shield-iam-job-in-bangalore-at-rubrik-backend-security-role';

const mongoose = require('mongoose');
const Job = require('./src/models/Job'); // Adjust path as needed

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📦 Connected to MongoDB');

        console.log('🧪 Starting specific URL scraper test...');
        console.log(`Job URL: ${TARGET_URL}\n`);

        // 1. Scrape
        console.log('--- Step 1: Scraping Page ---');
        const scraped = await scrapeJobPage(TARGET_URL);
        
        if (scraped.success) {
            console.log('✅ Scrape Success!');
            console.log(`Title: ${scraped.title}`);
            console.log(`Apply URL (Raw): ${scraped.applyUrl}`);
            console.log(`Content Preview:\n${scraped.content.substring(0, 1000)}\n...`);
        } else {
            console.error('❌ Scrape Failed:', scraped.error);
            return;
        }

        // 2. AI Parse
        console.log('\n--- Step 2: AI Parsing ---');
        let enrichedText = `Job URL: ${TARGET_URL}`;
        enrichedText += `\n\nTitle: ${scraped.title}\n${scraped.content}`;

        const jobData = await parseJobWithAI(enrichedText);

        if (jobData) {
            console.log('✅ AI Parse Success!');
            // console.log(JSON.stringify(jobData, null, 2));

            // Ensure critical fields
            jobData.sourceUrl = TARGET_URL;
            jobData.originalUrl = TARGET_URL;
            if (!jobData.applyUrl) jobData.applyUrl = TARGET_URL;
            if (!jobData.companyLogo && scraped.companyLogo) jobData.companyLogo = scraped.companyLogo;

            // 3. Save to DB
            console.log('\n--- Step 3: Saving to DB ---');
            const newJob = new Job(jobData);
            await newJob.save();
            console.log(`🎉 Job Saved Successfully! ID: ${newJob._id}`);
            console.log(`Company: ${newJob.company}`);
            console.log(`Title: ${newJob.title}`);
            console.log('--- Structured Data ---');
            console.log(`Roles Length: ${newJob.rolesResponsibility?.length || 0}`);
            console.log(`Reqs Length: ${newJob.requirements?.length || 0}`);

        } else {
            console.error('❌ AI Parse Failed (returned null)');
        }

    } catch (err) {
        console.error('Test Failed:', err);
    } finally {
        await mongoose.disconnect();
    }
};

runTest();
