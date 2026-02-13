const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Job = require('../src/models/Job');
const { processJobUrl } = require('../src/services/sources/processor');

// Force unset SKIP_PUPPETEER and RENDER to ensure this script acts as a "Local Machine"
delete process.env.SKIP_PUPPETEER;
delete process.env.RENDER;

const runLocalWorker = async () => {
    try {
        console.log('🚜 Starting Local Scraper Worker (Continuous Mode)...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to DB');

        const processBatch = async () => {
            try {
                // Find jobs that require Puppeteer and aren't completed
                const query = { 
                    $or: [
                        { requiresPuppeteer: true },
                        { title: 'Pending Local Scrape' }
                    ],
                    aiStatus: { $ne: 'completed' } 
                };

                const pendingJobs = await Job.find(query).limit(5); // Process 5 at a time

                if (pendingJobs.length === 0) {
                    console.log(`[${new Date().toLocaleTimeString()}] No pending local jobs. Waiting...`);
                    return;
                }

                console.log(`Found ${pendingJobs.length} jobs requiring local scraping.`);

                for (const job of pendingJobs) {
                    console.log(`\n⚡ Processing: ${job.applyUrl}`);
                    
                    // Remove the placeholder
                    await Job.findByIdAndDelete(job._id);
                    
                    const result = await processJobUrl(job.applyUrl);
                    
                    if (result.success) {
                        console.log(`✅ Successfully processed: ${job.applyUrl}`);
                    } else {
                        console.error(`❌ Failed to process: ${job.applyUrl}`, result.error);
                    }
                    
                    // Wait a bit to avoid detection
                    await new Promise(r => setTimeout(r, 5000));
                }
            } catch (err) {
                console.error('❌ Batch Error:', err.message);
            }
        };

        // Run once manually
        await processBatch();

    } catch (e) {
        console.error('❌ Worker Startup Error:', e);
    } finally {
        await mongoose.disconnect();
        console.log('� Worker Finished.');
    }
};

runLocalWorker();
