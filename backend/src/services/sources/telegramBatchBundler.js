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
            // ... (Resolve Target Chat ID logic) ...
            let targetChatId = this.chatIds[bucket];
            
            // Fallback for General/Old/New
            if (!targetChatId) {
                 const anyKey = Object.keys(this.chatIds).find(k => this.chatIds[k]);
                 if (anyKey) targetChatId = this.chatIds[anyKey];
            }

            if (!targetChatId) {
                console.warn(`⚠️ No Telegram Chat ID found for bucket '${bucket}'. Skipping.`);
                continue;
            }

            // Immediately send to Thread (Single Job)
            await this.sendSingleJob(escapedJob, bucket, targetChatId);
        }
    }

    // Removed addToBucket/sendBundle/flush logic for buffering.
    // New Single Job Sender
    async sendSingleJob(job, batch, chatId) {
        const targetThreadId = this.threadIds[batch];
        const WEBSITE_URL = process.env.WEBSITE_URL || 'https://jobgrid.in';
        const jobUrl = `${WEBSITE_URL}/job/${job.slug}`;

        let header = `🎓 <b>Batch: ${batch}</b> Alert 🚨\n\n`;
        if (batch === 'Older') {
            header = `🎓 <b>Batch: 2023, 2022 & Older</b> Alert 🚨\n\n`;
        } else if (batch === 'General') {
             header = `📢 <b>Latest Job Update</b> (Open to All) 🚨\n\n`;
        } else if (batch === '2030') {
             header = `🎓 <b>Batch: 2030 & Future</b> Alert 🚨\n\n`;
        } // 2024-2029 use standard "Batch: XXXX"

        let message = header;
        message += `🚀 <b>${job.title}</b>\n`;
        message += `🏢 <b>Company:</b> ${job.company}\n`;
        
        if (job.eligibility && job.eligibility !== 'N/A') {
            message += `👥 <b>Eligibility:</b> ${job.eligibility}\n`;
        }
        
        message += `\n🔗 <b>Apply Now:</b>\n${jobUrl}\n\n`;
        
        message += `━━━━━━━━━━━━━━━\n`;
        message += `📢 <b>Join Our Channels:</b>\n`;
        message += `🔹 <a href="https://t.me/jobgridupdates">Telegram Channel</a>\n`;
        message += `🔹 <a href="https://chat.whatsapp.com/EuNhXQkwy7Y4ELMjB1oVPd?mode=gi_t">WhatsApp Group</a>\n`;

        try {
            const options = {
                parse_mode: 'HTML',
                disable_web_page_preview: true
            };

            if (targetThreadId) {
                const threadIdInt = parseInt(targetThreadId);
                // Special handling for "General" topic (Thread ID 1 usually main chat, try omitting)
                if (threadIdInt === 1) {
                     // Do NOT set options.message_thread_id
                } else {
                    options.message_thread_id = threadIdInt;
                }
            }

            const sentMsg = await this.bot.telegram.sendMessage(chatId, message, options);
            console.log(`   ✅ Telegram Job sent to '${batch}' (Thread: ${targetThreadId || 'Main'}). Msg ID: ${sentMsg.message_id}`);
            
            // Save Message ID to Backend
            if (job._id) {
                // We need to update the job in DB. 
                // Since this class doesn't have direct DB access easily without importing Job model, 
                // let's try to import it at top or assume global? 
                // Better: allow passing a callback or import Job model here.
                const Job = require('../../models/Job');
                await Job.findByIdAndUpdate(job._id, {
                    $push: { 
                        telegramMessages: {
                            chatId: chatId.toString(),
                            messageId: sentMsg.message_id,
                            type: 'group_thread'
                        }
                    }
                });
            }

        } catch (err) {
            console.error(`   ❌ Failed to send Telegram Job to ${batch} (ID: ${chatId}):`, err.message);
        }
    }

    async removeJob(jobId) {
        // No-op for now as we don't track message IDs for thread posts yet (could add later)
        // Or if you kept message IDs, you could delete. 
        // For bundling, we just removed from queue. For single post, it's sent immediately.
    }

    async flush() {
        // No-op
        console.log(`   🧹 (Flush: No pending jobs, sending mode is instant)`);
    }
}

module.exports = TelegramBatchBundler;
