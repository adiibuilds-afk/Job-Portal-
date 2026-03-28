/**
 * WhatsApp Message Bundler
 * Tracks posted jobs and sends a consolidated message to Admin via Telegram
 * for easy copy-pasting to WhatsApp.
 */
class WhatsAppBundler {
    constructor(bot, adminId) {
        this.bot = bot;
        this.adminId = adminId;
        // Single queue for all jobs
        this.jobQueue = []; 
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

        // Avoid duplicates in the queue
        const exists = this.jobQueue.some(j => j._id.toString() === jobObj._id.toString());
        if (!exists) {
            this.jobQueue.push(escapedJob);
            console.log(`   📦 Job added to WhatsApp queue (${this.jobQueue.length}/5)`);
        }

        // Check limit
        if (this.jobQueue.length >= 5) {
            await this.sendBundle();
        }
    }

    async sendBundle() {
        if (this.jobQueue.length === 0) return;

        console.log(`   📡 Sending WhatsApp bundle...`);
        const WEBSITE_URL = process.env.WEBSITE_URL || 'https://jobgrid.in';
        
        let message = "<pre><code>";
        let header = `🎓 *Latest Job Updates*\n\n`;
        
        message += header;
        
        this.jobQueue.forEach((job, index) => {
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
            console.log(`   ✅ WhatsApp bundle sent.`);

            // Send separator
            await this.bot.telegram.sendMessage(this.adminId, `--- End of Bundle ---`);
            
            this.jobQueue = []; // Clear queue
        } catch (err) {
            console.error(`   ❌ Failed to send WhatsApp bundle:`, err.message);
        }
    }

    async removeJob(jobId) {
         const initialCount = this.jobQueue.length;
         this.jobQueue = this.jobQueue.filter(j => j._id.toString() !== jobId.toString());
         if (this.jobQueue.length < initialCount) {
             console.log(`   📦 Job removed from WhatsApp queue`);
         }
    }

    async flush() {
        console.log(`   🧹 Flushing WhatsApp queue...`);
        await this.sendBundle();
    }
}

module.exports = WhatsAppBundler;
