/**
 * WhatsApp Message Bundler
 * Tracks posted jobs and sends a consolidated message to Admin via Telegram
 * for easy copy-pasting to WhatsApp.
 */
class WhatsAppBundler {
    constructor(bot, adminId) {
        this.bot = bot;
        this.adminId = adminId;
        this.jobs = [];
    }

    async addJob(job) {
        if (!this.bot || !this.adminId) return;
        
        // Simple HTML Escaping
        const escapeHTML = (str) => {
            if (!str) return '';
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };

        const escapedJob = {
            ...job,
            title: escapeHTML(job.title),
            company: escapeHTML(job.company),
            eligibility: escapeHTML(job.eligibility)
        };

        this.jobs.push(escapedJob);
        console.log(`   📦 Job added to WhatsApp bundle (${this.jobs.length}/5)`);
        
        if (this.jobs.length >= 5) {
            await this.sendBundle();
        }
    }

    async sendBundle() {
        if (this.jobs.length === 0) return;

        console.log(`   📡 Sending WhatsApp bundle to Admin...`);
        const WEBSITE_URL = process.env.WEBSITE_URL || 'https://jobgrid.in';
        
        let message = "<pre><code>";
        
        this.jobs.forEach((job, index) => {
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
            console.log(`   ✅ WhatsApp bundle sent to Admin.`);

            // Send separator for next batch
            await this.bot.telegram.sendMessage(this.adminId, "n\ne\nx\nT");
            
            this.jobs = []; // Clear bundle
        } catch (err) {
            console.error('   ❌ Failed to send WhatsApp bundle:', err.message);
        }
    }

    async removeJob(jobId) {
        const initialCount = this.jobs.length;
        this.jobs = this.jobs.filter(j => j._id.toString() !== jobId.toString());
        if (this.jobs.length < initialCount) {
            console.log(`   📦 Job removed from WhatsApp bundle (${this.jobs.length}/5)`);
        }
    }

    async flush() {
        if (this.jobs.length > 0) {
            console.log(`   🧹 Flushing remaining jobs to WhatsApp bundle...`);
            await this.sendBundle();
        }
    }
}

module.exports = WhatsAppBundler;
