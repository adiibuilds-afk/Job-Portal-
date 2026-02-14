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
        
        // Target Groups
        const targetGroups = {
            '2030': '2030', // Future proofing
            '2029': '2029',
            '2028': '2028',
            '2027': '2027',
            '2026': '2026',
            'Older': 'Older' // 2025, 2024, 2023, etc.
        };

        let assignedBuckets = new Set();

        if (!batches || batches.length === 0) {
            assignedBuckets.add('Older');
        } else {
            batches.forEach(b => {
                const year = parseInt(b);
                if (!isNaN(year)) {
                    if (year >= 2026) {
                        assignedBuckets.add(year.toString());
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
            if (!this.batchBuckets[bucket]) {
                this.batchBuckets[bucket] = [];
            }
            
            // Avoid duplicates in the same bucket
            const exists = this.batchBuckets[bucket].some(j => j._id.toString() === jobObj._id.toString());
            if (!exists) {
                this.batchBuckets[bucket].push(escapedJob);
                console.log(`   📦 Job added to WhatsApp batch '${bucket}' (${this.batchBuckets[bucket].length}/5)`);
            }

            // Check limit for this batch
            if (this.batchBuckets[bucket].length >= 5) {
                await this.sendBundle(bucket);
            }
        }
    }

    async sendBundle(batch) {
        if (!this.batchBuckets[batch] || this.batchBuckets[batch].length === 0) return;

        console.log(`   📡 Sending WhatsApp bundle for Batch '${batch}'...`);
        const WEBSITE_URL = process.env.WEBSITE_URL || 'https://jobgrid.in';
        
        let message = "<pre><code>";
        let header = `🎓 *Batch: ${batch}* Updates\n\n`;
        if (batch === 'Older') {
            header = `🎓 *Batch: 2025, 2024 & Older* Updates\n\n`;
        }
        
        message += header;
        
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
