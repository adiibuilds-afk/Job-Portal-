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
        
        this.jobs.push(job);
        console.log(`   📦 Job added to WhatsApp bundle (${this.jobs.length}/5)`);
        
        if (this.jobs.length >= 5) {
            await this.sendBundle();
        }
    }

    async sendBundle() {
        if (this.jobs.length === 0) return;

        console.log(`   📡 Sending WhatsApp bundle to Admin...`);
        const WEBSITE_URL = process.env.WEBSITE_URL || 'https://jobgrid.in';
        
        let message = `📱 *WhatsApp Bundle (Ready to Copy)*\n\n`;
        
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
        message += `🔹 WhatsApp: https://whatsapp.com/channel/0029Vak74nQ0wajvYa3aA432\n`;
        message += `🔹 LinkedIn: https://www.linkedin.com/company/jobgrid-in`;

        try {
            await this.bot.telegram.sendMessage(this.adminId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
            console.log(`   ✅ WhatsApp bundle sent to Admin.`);
            this.jobs = []; // Clear bundle
        } catch (err) {
            console.error('   ❌ Failed to send WhatsApp bundle:', err.message);
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
