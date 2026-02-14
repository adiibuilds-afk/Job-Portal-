/**
 * WhatsApp Message Bundler
 * Tracks posted jobs and sends a consolidated message to Admin via Telegram
 * for easy copy-pasting to WhatsApp.
 */
class WhatsAppBundler {
    constructor(bot, adminId) {
        this.bot = bot;
        this.adminId = adminId;
        // Buckets for each batch: { '2024': [], '2025': [], 'General': [] }
        this.batchBuckets = {}; 
    }

    async addJob(job) {
        if (!this.bot || !this.adminId) return;
        
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
        if (!batches || batches.length === 0) {
            batches = ['General'];
        }

        // Add to each relevant bucket
        for (const batch of batches) {
            if (!this.batchBuckets[batch]) {
                this.batchBuckets[batch] = [];
            }
            
            // Avoid duplicates in the same bucket
            const exists = this.batchBuckets[batch].some(j => j._id.toString() === jobObj._id.toString());
            if (!exists) {
                this.batchBuckets[batch].push(escapedJob);
                console.log(`   📦 Job added to WhatsApp batch '${batch}' (${this.batchBuckets[batch].length}/5)`);
            }

            // Check limit for this batch
            if (this.batchBuckets[batch].length >= 5) {
                await this.sendBundle(batch);
            }
        }
    }

    async sendBundle(batch) {
        if (!this.batchBuckets[batch] || this.batchBuckets[batch].length === 0) return;

        console.log(`   📡 Sending WhatsApp bundle for Batch '${batch}'...`);
        const WEBSITE_URL = process.env.WEBSITE_URL || 'https://jobgrid.in';
        
        let message = "<pre><code>";
        message += `🎓 *Batch: ${batch}* Updates\n\n`;
        
        this.batchBuckets[batch].forEach((job, index) => {
            const jobUrl = `${WEBSITE_URL}/job/${job.slug}`;
            message += `${index + 1}. *${job.title}*\n`;
            message += `🏢 Company: ${job.company}\n`;
            if (job.eligibility && job.eligibility !== 'N/A') {
                message += `👥 Eligibility: ${job.eligibility}\n`;
            }
            message += `🔗 Apply: ${jobUrl}\n\n`;
        });

        message += `━━━━━━━━━━━━━━━\n\n`;
        message += `📢 *Join Our Channels:*\n\n`;
        message += `🔹 Telegram: https://t.me/jobgridupdates\n`;
        message += `🔹 WhatsApp: https://chat.whatsapp.com/EuNhXQkwy7Y4ELMjB1oVPd?mode=gi_t\n`;
        message += `🔹 LinkedIn: https://www.linkedin.com/company/jobgrid-in\n`;
        message += "</code></pre>";

        try {
            await this.bot.telegram.sendMessage(this.adminId, message, {
                parse_mode: 'HTML',
                disable_web_page_preview: true
            });
            console.log(`   ✅ WhatsApp bundle for '${batch}' sent.`);

            // Send separator
            await this.bot.telegram.sendMessage(this.adminId, `--- End of ${batch} ---`);
            
            this.batchBuckets[batch] = []; // Clear bucket
        } catch (err) {
            console.error(`   ❌ Failed to send WhatsApp bundle for ${batch}:`, err.message);
        }
    }

    async removeJob(jobId) {
        // Remove from all buckets
        for (const batch in this.batchBuckets) {
             const initialCount = this.batchBuckets[batch].length;
             this.batchBuckets[batch] = this.batchBuckets[batch].filter(j => j._id.toString() !== jobId.toString());
             if (this.batchBuckets[batch].length < initialCount) {
                 console.log(`   📦 Job removed from WhatsApp batch '${batch}'`);
             }
        }
    }

    async flush() {
        console.log(`   🧹 Flushing all WhatsApp batches...`);
        for (const batch in this.batchBuckets) {
            await this.sendBundle(batch);
        }
    }
}

module.exports = WhatsAppBundler;
