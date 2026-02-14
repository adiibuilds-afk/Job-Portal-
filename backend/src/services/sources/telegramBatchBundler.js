/**
 * Telegram Batch Bundler
 * Groups jobs by batch year and sends them to specific Telegram groups/channels.
 */
class TelegramBatchBundler {
    constructor(bot) {
        this.bot = bot;
        
        // Map batches to Environment Variables for Chat IDs
        // You must add these to your .env file:
        // TELEGRAM_CHAT_2030, TELEGRAM_CHAT_2029, ... TELEGRAM_CHAT_OLDER
        this.chatIds = {
            '2030': process.env.TELEGRAM_CHAT_2030,
            '2029': process.env.TELEGRAM_CHAT_2029,
            '2028': process.env.TELEGRAM_CHAT_2028,
            '2027': process.env.TELEGRAM_CHAT_2027,
            '2026': process.env.TELEGRAM_CHAT_2026,
            '2025': process.env.TELEGRAM_CHAT_2025,
            '2024': process.env.TELEGRAM_CHAT_2024,
            'Older': process.env.TELEGRAM_CHAT_OLDER,
            'General': process.env.TELEGRAM_CHAT_GENERAL
        };
        
        // Map batches to Environment Variables for Thread IDs (Topics)
        this.threadIds = {
            '2030': process.env.TELEGRAM_THREAD_2030,
            '2029': process.env.TELEGRAM_THREAD_2029,
            '2028': process.env.TELEGRAM_THREAD_2028,
            '2027': process.env.TELEGRAM_THREAD_2027,
            '2026': process.env.TELEGRAM_THREAD_2026,
            '2025': process.env.TELEGRAM_THREAD_2025,
            '2024': process.env.TELEGRAM_THREAD_2024,
            'Older': process.env.TELEGRAM_THREAD_OLDER,   // For 2023 and older
            'General': process.env.TELEGRAM_THREAD_GENERAL // For 'Any Batch' / Unspecified
        };

        // Buckets for each batch
        this.batchBuckets = {}; 
    }

    async addJob(job) {
        if (!this.bot) return;

        // Simple HTML Escaping
        const escapeHTML = (str) => {
            if (!str) return '';
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };

        const jobObj = job.toObject ? job.toObject() : job;

        const escapedJob = {
            ...jobObj,
            title: escapeHTML(jobObj.title),
            company: escapeHTML(jobObj.company),
            eligibility: escapeHTML(jobObj.eligibility)
        };

        // Determine batches
        let batches = jobObj.batch || [];
        
        // Target Groups Logic
        let assignedBuckets = new Set();

        if (!batches || batches.length === 0) {
            assignedBuckets.add('General');
        } else {
            batches.forEach(b => {
                const year = parseInt(b);
                if (!isNaN(year)) {
                    if (year >= 2024) {
                        // 2024, 2025, 2026...
                        const key = year.toString();
                        // Just add the year. We'll check if we have a config for it later.
                        // Future proofing: if year is 2031 but we only support up to 2030 config, 
                        // we might want to cap it? For now, let's map exactly.
                        if (this.threadIds[key] !== undefined) {
                             assignedBuckets.add(key);
                        } else if (year > 2030) {
                             // Fallback for very future years to 2030? Or General?
                             // Let's put in 2030 for now if > 2030
                             assignedBuckets.add('2030');
                        } else {
                             // If it's a valid year but no config (e.g. we missed adding it), add to General?
                             assignedBuckets.add('General');
                        }
                    } else {
                        // 2023, 2022, 2021...
                        assignedBuckets.add('Older');
                    }
                } else if (typeof b === 'string' && b.toLowerCase().includes('any')) {
                     assignedBuckets.add('General');
                } else {
                    // Not a number, assume General
                    assignedBuckets.add('General');
                }
            });
        }
        
        // Final fallback if set is empty
        if (assignedBuckets.size === 0) assignedBuckets.add('General');

        // Add to each relevant bucket
        for (const bucket of assignedBuckets) {
            // We need a target Chat ID (the group ID)
            // Since user is using ONE group for all topics, we can use any specific var or a common one.
            // But our class uses `this.chatIds`. We need to ensure we have a fallback or a default Group ID.
            // Let's assume if specific year Chat ID isn't set, we use one common one if available?
            // Actually, the user will set TELEGRAM_CHAT_20XX to the same ID.
            
            // Check if we have a Thread ID configured (except for simple groups)
            // If thread ID is missing, it goes to 'General' topic (main chat)?
            
            let targetChatId = this.chatIds[bucket];
            
            // Fallback for General/Older/New Years if their specific CHAT ID isn't set (likely user set only one)
            // We can pick any valid Chat ID from our config if they are all the same group.
            if (!targetChatId) {
                 // Try to find ANY defined chat ID
                 const anyKey = Object.keys(this.chatIds).find(k => this.chatIds[k]);
                 if (anyKey) targetChatId = this.chatIds[anyKey];
            }

            if (!targetChatId) {
                console.warn(`⚠️ No Telegram Chat ID found for bucket '${bucket}'. Skipping.`);
                continue;
            }

            this.addToBucket(bucket, escapedJob, targetChatId);
        }
    }

    addToBucket(bucket, job, chatId) {
        if (!this.batchBuckets[bucket]) {
            this.batchBuckets[bucket] = { jobs: [], chatId: chatId };
        }
        
        // Avoid duplicates
        const exists = this.batchBuckets[bucket].jobs.some(j => j._id.toString() === job._id.toString());
        if (!exists) {
            this.batchBuckets[bucket].jobs.push(job);
            // Update chatId just in case
            this.batchBuckets[bucket].chatId = chatId;
            console.log(`   📦 Job added to Telegram Queue '${bucket}' (${this.batchBuckets[bucket].jobs.length}/5)`);
        }

        // Check limit
        if (this.batchBuckets[bucket].jobs.length >= 5) {
            this.sendBundle(bucket); // Async but don't await to not block
        }
    }

    async sendBundle(batch) {
        if (!this.batchBuckets[batch] || this.batchBuckets[batch].jobs.length === 0) return;

        const bucketData = this.batchBuckets[batch];
        const targetChatId = bucketData.chatId;
        const targetThreadId = this.threadIds[batch]; // Might be undefined for General if not set
        
        if (!targetChatId) return;

        console.log(`   📡 Sending Telegram bundle to '${batch}' (Chat: ${targetChatId}, Thread: ${targetThreadId || 'None'})...`);
        const WEBSITE_URL = process.env.WEBSITE_URL || 'https://jobgrid.in';
        
        let header = `🎓 <b>Batch: ${batch}</b> Updates\n\n`;
        if (batch === 'Older') {
            header = `🎓 <b>Batch: 2023, 2022 & Older</b> Updates\n\n`;
        } else if (batch === 'General') {
             header = `📢 <b>Latest Job Updates</b> (Open to All)\n\n`;
        } else if (batch === '2030') {
             header = `🎓 <b>Batch: 2030 & Future</b> Updates\n\n`;
        }

        let message = header;
        
        bucketData.jobs.forEach((job, index) => {
            const jobUrl = `${WEBSITE_URL}/job/${job.slug}`;
            message += `${index + 1}. <b>${job.title}</b>\n`;
            message += `🏢 Company: ${job.company}\n`;
            if (job.eligibility && job.eligibility !== 'N/A') {
                message += `👥 Eligibility: ${job.eligibility}\n`;
            }
            message += `🔗 Apply: ${jobUrl}\n\n`;
        });

        message += `━━━━━━━━━━━━━━━\n\n`;
        message += `📢 <b>Join Our Channels:</b>\n`;
        message += `🔹 <a href="https://t.me/jobgridupdates">Telegram Channel</a>\n`;
        message += `🔹 <a href="https://chat.whatsapp.com/EuNhXQkwy7Y4ELMjB1oVPd?mode=gi_t">WhatsApp Group</a>\n`;

        try {
            const options = {
                parse_mode: 'HTML',
                disable_web_page_preview: true
            };

            // Support for Topics (Message Threads)
            if (targetThreadId) {
                options.message_thread_id = parseInt(targetThreadId);
            }

            await this.bot.telegram.sendMessage(targetChatId, message, options);
            console.log(`   ✅ Telegram bundle for '${batch}' sent.`);
            
            this.batchBuckets[batch] = null; // Clear bucket
        } catch (err) {
            console.error(`   ❌ Failed to send Telegram bundle for ${batch} (ID: ${targetChatId}):`, err.message);
        }
    }

    async removeJob(jobId) {
        for (const batch in this.batchBuckets) {
             if (this.batchBuckets[batch] && this.batchBuckets[batch].jobs) {
                this.batchBuckets[batch].jobs = this.batchBuckets[batch].jobs.filter(j => j._id.toString() !== jobId.toString());
             }
        }
    }

    async flush() {
        console.log(`   🧹 Flushing all Telegram Group batches...`);
        for (const batch in this.batchBuckets) {
            if (this.batchBuckets[batch]) {
                 await this.sendBundle(batch);
            }
        }
    }
}

module.exports = TelegramBatchBundler;
