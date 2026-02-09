const axios = require('axios');
const Job = require('../../models/Job');
const { mapToJobSchema } = require('../../scripts/importRGJobs'); // Reuse mapping logic
const { waitWithSkip, postJobToTelegram, deleteTelegramPost } = require('./utils');

const RG_JOBS_API = 'https://api.rgjobs.in/api/getAllJobs';
const MAX_JOBS_MANUAL = 20;

const runRGJobsManual = async (bot, limit = 20) => {
    console.log(`🔄 RG Jobs Manual Trigger (Last ${limit} jobs)...`);

    try {
        const response = await axios.get(RG_JOBS_API);

        if (response.data.status !== 200 || !response.data.JobsData) {
            console.error('❌ Invalid response from RG Jobs API');
            return { processed: 0, skipped: 0 };
        }

        // Get latest jobs (sorted by created_at desc)
        const rgJobs = response.data.JobsData
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit)
            .reverse(); 

        let processed = 0;
        let skipped = 0;
        let consecutiveDuplicates = 0;

        for (const rgJob of rgJobs) {
            try {
                const applyUrl = rgJob.joblink;
                if (!applyUrl) {
                    skipped++;
                    continue;
                }

                // --- EARLY DEDUPLICATION CHECK ---
                // Extract company name for check (same logic as mapper)
                let tempCompany = 'Unknown';
                const atMatch = rgJob.title?.match(/at\s+([^|]+)/i);
                if (atMatch) tempCompany = atMatch[1].trim();

                const existing = await Job.findOne({ 
                    $or: [
                        { applyUrl: applyUrl },
                        { 
                            title: { $regex: new RegExp(`^${rgJob.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
                            company: { $regex: new RegExp(`^${tempCompany.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
                        }
                    ]
                });

                if (existing) {
                    consecutiveDuplicates++;
                    skipped++;
                    console.log(`   ⏭️ Skipping Duplicate (Pre-Map): ${rgJob.title} at ${tempCompany}`);
                    console.log(`   🔸 Consecutive Duplicates: ${consecutiveDuplicates}/5`);
                    
                    if (consecutiveDuplicates >= 5) {
                        console.log('🛑 5 consecutive duplicates found. Stopping source.');
                        return { processed, skipped, action: 'complete' };
                    }
                    continue;
                }

                // Now it's safe to do expensive mapping (AI + Cloudinary)
                const jobData = await mapToJobSchema(rgJob);
                if (!jobData || !jobData.title) continue;

                console.log(`🚀 Processing: ${rgJob.title}`);

                if (jobData && jobData.error === 'rate_limit_exceeded') {
                    console.log('🛑 AI Rate Limit Exceeded. Stopping.');
                    return { processed, skipped, action: 'rate_limit' };
                }

                const newJob = new Job(jobData);
                await newJob.save();
                console.log(`✅ Saved: ${newJob.title}`);
                console.log(`🔗 Apply Link: ${newJob.applyUrl}`);

                // Post to Telegram
                await postJobToTelegram(newJob, bot);

                processed++;
                consecutiveDuplicates = 0; // Reset
                const lastJobId = newJob._id;
                
                // Delay 21s (skipable) and handle quit signal
                if (processed < limit && processed < rgJobs.length) {
                    const waitResult = await waitWithSkip(21000);
                    
                    if (waitResult === 'delete' && lastJobId) {
                        const jobToDelete = await Job.findById(lastJobId);
                        if (jobToDelete && jobToDelete.telegramMessageId) {
                            await deleteTelegramPost(bot, jobToDelete.telegramMessageId);
                            console.log('🗑️ Deleted from Telegram.');
                        }
                        await Job.findByIdAndDelete(lastJobId);
                        console.log('🗑️ Job deleted from database.');
                        processed--;
                    }

                    if (waitResult === 'quit') return { processed, skipped, action: 'quit' };
                    if (waitResult === 'next_source') return { processed, skipped, action: 'next' };
                }

            } catch (err) {
                console.error(`   ❌ Error processing job: ${err.message}`);
            }
        }

        console.log(`📊 RG Jobs Manual Complete: ${processed} new jobs, ${skipped} skipped.`);
        return { processed, skipped, action: 'complete' };

    } catch (err) {
        console.error('❌ RG Jobs Manual Failed:', err.message);
        return { processed: 0, skipped: 0 };
    }
};

module.exports = { runRGJobsManual };
