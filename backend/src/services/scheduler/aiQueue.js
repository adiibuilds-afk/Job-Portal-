const Job = require('../../models/Job');
const { parseJobWithAI } = require('../groq');
const { refineJobWithAI, finalizeJobData } = require('../jobProcessor');
const { postJobToTelegram } = require('../sources/utils');
const { triggerJobNotifications } = require('../notificationService');

/**
 * Process jobs that were previously rate-limited
 */
const processRateLimitedJobs = async (bot) => {
    try {
        console.log('🔄 Checking for rate-limited jobs in background queue...');
        
        // Fetch oldest 5 pending jobs
        const pendingJobs = await Job.find({ aiStatus: 'rate_limited' })
                                     .select('+rawContent')
                                     .sort({ createdAt: 1 })
                                     .limit(5);

        if (pendingJobs.length === 0) {
            console.log('✅ No pending rate-limited jobs.');
            return;
        }

        console.log(`Found ${pendingJobs.length} pending jobs. Processing...`);

        for (const job of pendingJobs) {
            try {
                if (!job.rawContent) {
                    console.log(`⚠️ Job ${job._id} has no raw content. Marking as failed.`);
                    job.aiStatus = 'failed';
                    await job.save();
                    continue;
                }

                console.log(`⚡ Reprocessing AI for: ${job.title}`);
                
                // 1. Retry AI Parsing
                const extractedData = await parseJobWithAI(job.rawContent);
                
                if (extractedData && extractedData.error === 'rate_limit_exceeded') {
                    console.log('🚫 Still Rate Limited. Stopping queue for now.');
                    break; // Stop processing rest of queue if we're still limited
                }

                // 2. Retry Refinement
                const refinedData = await refineJobWithAI(extractedData);
                if (refinedData && refinedData.error === 'rate_limit_exceeded') {
                    console.log('🚫 Rate Limited during refinement. Stopping queue.');
                    break;
                }

                // 3. Finalize
                const scrapedMock = {
                    title: job.title,
                    company: job.company,
                    applyUrl: job.applyUrl || extractedData.applyUrl,
                    companyLogo: job.companyLogo,
                    tags: [],
                    batch: []
                };

                const rawData = {
                    ...extractedData,
                    applyUrl: scrapedMock.applyUrl,
                    companyLogo: scrapedMock.companyLogo || extractedData.companyLogo,
                    company: scrapedMock.company || extractedData.company,
                };

                const finalData = await finalizeJobData(refinedData || {}, rawData);

                // 4. Update Job in DB
                Object.assign(job, finalData);
                job.aiStatus = 'completed';
                job.rawContent = undefined; // Clear raw content to save space
                await job.save();

                console.log(`✅ Recovered Job: ${job.title}`);

                // 5. Post-Processing (Telegram, Notification)
                // We typically only want to notify if it's still relatively fresh? 
                // For now, let's treat it as a new job since users haven't seen it yet.
                
                triggerJobNotifications(job).catch(e => console.error('Push Trigger Error:', e));

                const msgId = await postJobToTelegram(job, bot);
                if (msgId) {
                    job.telegramMessageId = msgId;
                    await job.save();
                }

                // Small delay to be nice to API
                await new Promise(r => setTimeout(r, 2000));

            } catch (err) {
                console.error(`❌ Failed to recover job ${job._id}:`, err.message);
                // Don't mark as failed immediately if it's a transient network error, 
                // but if it's data error, maybe? For now keep it to retry later.
            }
        }

    } catch (error) {
        console.error('AI Queue Error:', error);
    }
};

module.exports = { processRateLimitedJobs };
