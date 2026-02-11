/**
 * LinkedIn Message Bundler
 * Tracks posted jobs and sends a consolidated message with viral formatting to Admin via Telegram
 * for easy copy-pasting to LinkedIn.
 */
class LinkedInBundler {
    constructor(bot, adminId) {
        this.bot = bot;
        this.adminId = adminId;
        this.jobs = [];
    }

    async addJob(job) {
        if (!this.bot || !this.adminId) return;
        
        this.jobs.push(job);
        console.log(`   📦 Job added to LinkedIn bundle (${this.jobs.length}/5)`);
        
        if (this.jobs.length >= 5) {
            await this.sendBundle();
        }
    }

    async sendBundle() {
        if (this.jobs.length === 0) return;

        console.log(`   📡 Sending LinkedIn bundle to Admin...`);
        const WEBSITE_URL = process.env.WEBSITE_URL || 'https://jobgrid.in';
        const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/EuNhXQkwy7Y4ELMjB1oVPd?mode=gi_t';
        
        let message = `🚀 **TECH HIRING ALERT: Top 5 Roles for 2025/26/27 Batches!** 🚀\n\n`;
        message += `Stop scrolling! We've curated the best software engineering & IT opportunities for you today. \n\n`;
        message += `🔥 **Featured Jobs Today:**\n\n`;
        
        this.jobs.forEach((job, index) => {
            const jobUrl = `${WEBSITE_URL}/job/${job.slug}`;
            const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
            const emoji = numberEmojis[index] || '🔹';
            
            message += `${emoji} **${job.title}** @ **${job.company}**\n`;
            message += `📍 Location: ${job.location || 'Remote'}\n`;
            message += `🎓 Batch: ${job.batch?.join(', ') || job.eligibility || 'Any'}\n`;
            message += `🔗 **Apply Here:** ${jobUrl}\n\n`;
        });

        message += `━━━━━━━━━━━━━━━\n`;
        message += `💡 **Pro-Tip:** These roles move fast. Apply within the first 24 hours!\n\n`;
        message += `📢 **Join our community for hourly updates:**\n`;
        message += `🔹 Telegram: https://t.me/jobgridupdates\n`;
        message += `🔹 WhatsApp: ${WHATSAPP_GROUP_URL}\n`;
        message += `🔹 LinkedIn: https://www.linkedin.com/company/jobgrid-in\n\n`;
        message += `#Hiring #SoftwareEngineering #Freshers #JobSearch #TechJobs #SDE #JobGrid #Careers`;

        try {
            await this.bot.telegram.sendMessage(this.adminId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
            console.log(`   ✅ LinkedIn bundle sent to Admin.`);

            // Send separator for next batch
            await this.bot.telegram.sendMessage(this.adminId, "-------------------");
            
            this.jobs = []; // Clear bundle
        } catch (err) {
            console.error('   ❌ Failed to send LinkedIn bundle:', err.message);
        }
    }

    async removeJob(jobId) {
        const initialCount = this.jobs.length;
        this.jobs = this.jobs.filter(j => j._id.toString() !== jobId.toString());
        if (this.jobs.length < initialCount) {
            console.log(`   📦 Job removed from LinkedIn bundle (${this.jobs.length}/5)`);
        }
    }

    async flush() {
        if (this.jobs.length > 0) {
            console.log(`   🧹 Flushing remaining jobs to LinkedIn bundle...`);
            await this.sendBundle();
        }
    }
}

module.exports = LinkedInBundler;
