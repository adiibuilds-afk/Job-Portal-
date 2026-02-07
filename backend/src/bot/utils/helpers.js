/**
 * Shared helpers for the Telegram bot
 */

const hasValue = (val) => val && val !== 'N/A' && val !== 'n/a' && val.trim() !== '';

const adminOnly = (ctx, next) => {
    const adminId = parseInt(process.env.ADMIN_ID);
    if (ctx.from.id !== adminId) {
        return ctx.reply('⛔ Unauthorized. Admin access only.');
    }
    return next();
};

const buildPreview = (jobData) => {
    let msg = `✨ *Job Preview*\n\n`;
    
    if (hasValue(jobData.title)) msg += `📌 *Title:* ${jobData.title}\n`;
    if (hasValue(jobData.company)) msg += `🏢 *Company:* ${jobData.company}\n`;
    if (hasValue(jobData.location)) msg += `📍 *Location:* ${jobData.location}\n`;
    if (hasValue(jobData.salary)) msg += `💰 *Salary:* ${jobData.salary}\n`;
    if (hasValue(jobData.category)) msg += `📋 *Category:* ${jobData.category}\n`;
    if (hasValue(jobData.applyUrl)) msg += `🔗 *Apply:* ${jobData.applyUrl}\n`;
    if (hasValue(jobData.lastDate)) msg += `📅 *Last Date:* ${jobData.lastDate}\n`;
    
    if (hasValue(jobData.eligibility)) {
        msg += `\n*Eligibility:*\n${jobData.eligibility}\n`;
    }
    
    if (hasValue(jobData.description)) {
        const desc = jobData.description.substring(0, 300);
        msg += `\n*Description:*\n${desc}${jobData.description.length > 300 ? '...' : ''}\n`;
    }
    
    msg += `\n━━━━━━━━━━━━━━━\nReply *yes* to publish or *no* to cancel\n📢 Will auto-post to channel!`;
    
    return msg;
};

module.exports = {
    hasValue,
    adminOnly,
    buildPreview
};
