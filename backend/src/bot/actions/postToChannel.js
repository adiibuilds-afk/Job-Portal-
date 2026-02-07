const { hasValue } = require('../utils/helpers');

const postToChannel = async (bot, job) => {
    const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
    const WEBSITE_URL = process.env.WEBSITE_URL || 'https://jobgrid.in';

    if (!CHANNEL_ID) {
        console.log('No channel ID configured, skipping channel post');
        return;
    }

    try {
        const jobUrl = `${WEBSITE_URL}/job/${job.slug}`;
        
        let message = `🎯 *New Job Alert!*\n\n`;
        
        if (hasValue(job.company)) message += `🏢 *Company:* ${job.company}\n`;
        if (hasValue(job.title)) message += `📌 *Role:* ${job.title}\n`;
        
        if (hasValue(job.eligibility)) {
            message += `\n👥 *Batch/Eligibility:*\n${job.eligibility}\n`;
        }
        
        if (hasValue(job.salary)) message += `\n💰 *Salary:* ${job.salary}`;
        if (hasValue(job.location)) message += `\n📍 *Location:* ${job.location}`;
        
        message += `\n\n🔗 *Apply Now:*\n${jobUrl}\n\n━━━━━━━━━━━━━━━\n📢 @jobgridupdates`;

        await bot.telegram.sendMessage(CHANNEL_ID, message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: false,
        });

        console.log(`✅ Posted to channel: ${job.title}`);
    } catch (err) {
        console.error('Failed to post to channel:', err.message);
    }
};

module.exports = postToChannel;
