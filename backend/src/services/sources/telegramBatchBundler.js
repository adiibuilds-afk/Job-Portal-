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
            'Older': process.env.TELEGRAM_CHAT_OLDER
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
            assignedBuckets.add('Older');
        } else {
            batches.forEach(b => {
                const year = parseInt(b);
                if (!isNaN(year)) {
                    if (year >= 2026) {
                        const key = year.toString();
                        // Only add if we have a configured chat ID for this year, 
                        // or fallback to a default if you prefer (omitted here for strictness)
                        if (this.chatIds[key]) assignedBuckets.add(key);
                        else assignedBuckets.add('Older'); // Fallback or ignore? Let's put in Older or just log warning? 
                                                         // Actually, better to put in 'Older' or a 'General' if specific year not found.
                                                         // For now, let's treat 2030+ as 2030 if defined, else Older.
                    } else {
                        assignedBuckets.add('Older');
                    }
                } else {
                    assignedBuckets.add('Older');
                }
            });
        }

        // Add to each relevant bucket
        for (const bucket of assignedBuckets) {
            // Check if we even have a target Chat ID for this bucket
            // If not defined in .env, maybe fallback to Main Channel? 
            // For now, let's assume if env var is missing, we skip targeted posting for that specific batch.
            const targetChatId = this.chatIds[bucket];
            if (!targetChatId) {
                // If it's a specific year but no group, maybe dump in Older?
                if (bucket !== 'Older' && this.chatIds['Older']) {
                    this.addToBucket('Older', escapedJob);
                }
                continue;
            }

            this.addToBucket(bucket, escapedJob);
        }
    }

    addToBucket(bucket, job) {
        if (!this.batchBuckets[bucket]) {
            this.batchBuckets[bucket] = [];
        }
        
        // Avoid duplicates
        const exists = this.batchBuckets[bucket].some(j => j._id.toString() === job._id.toString());
        if (!exists) {
            this.batchBuckets[bucket].push(job);
            console.log(`   📦 Job added to Telegram Group '${bucket}' queue (${this.batchBuckets[bucket].length}/5)`);
        }

        // Check limit
        if (this.batchBuckets[bucket].length >= 5) {
            this.sendBundle(bucket); // Async but don't await to not block
        }
    }

    async sendBundle(batch) {
        if (!this.batchBuckets[batch] || this.batchBuckets[batch].length === 0) return;

        const targetChatId = this.chatIds[batch];
        if (!targetChatId) return;

        console.log(`   📡 Sending Telegram bundle to Group '${batch}' (${targetChatId})...`);
        const WEBSITE_URL = process.env.WEBSITE_URL || 'https://jobgrid.in';
        
        let header = `🎓 <b>Batch: ${batch}</b> Updates\n\n`;
        if (batch === 'Older') {
            header = `🎓 <b>Batch: 2025, 2024 & Older</b> Updates\n\n`;
        }

        let message = header;
        
        this.batchBuckets[batch].forEach((job, index) => {
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
            await this.bot.telegram.sendMessage(targetChatId, message, {
                parse_mode: 'HTML',
                disable_web_page_preview: true
            });
            console.log(`   ✅ Telegram bundle for '${batch}' sent.`);
            
            this.batchBuckets[batch] = []; // Clear bucket
        } catch (err) {
            console.error(`   ❌ Failed to send Telegram bundle for ${batch} (ID: ${targetChatId}):`, err.message);
        }
    }

    async removeJob(jobId) {
        for (const batch in this.batchBuckets) {
             this.batchBuckets[batch] = this.batchBuckets[batch].filter(j => j._id.toString() !== jobId.toString());
        }
    }

    async flush() {
        console.log(`   🧹 Flushing all Telegram Group batches...`);
        for (const batch in this.batchBuckets) {
            await this.sendBundle(batch);
        }
    }
}

module.exports = TelegramBatchBundler;
