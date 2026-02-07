const Job = require('../../models/Job');
const { parseJobWithAI } = require('../../services/groq');
const postToChannel = require('../actions/postToChannel');
const { adminOnly } = require('../utils/helpers');

const registerTextHandler = (bot, userSessions) => {
    bot.on('text', adminOnly, async (ctx) => {
        const userId = ctx.from.id;
        const text = ctx.message.text.toLowerCase().trim();
        const session = userSessions[userId];

        if (!session) return;

        if (text === 'yes') {
            if (session.type === 'create') {
                try {
                    const newJob = new Job(session.data);
                    await newJob.save();
                    ctx.reply(`✅ Job Published! 📢 Posting to channel...`);
                    await postToChannel(bot, newJob);
                } catch (err) { ctx.reply('❌ Error saving job.'); }
            } else if (session.type === 'delete') {
                try {
                    await Job.deleteOne({ slug: session.slug });
                    ctx.reply(`🗑 Job deleted: ${session.slug}`);
                } catch (err) { ctx.reply('❌ Error deleting job.'); }
            }
            delete userSessions[userId];
            return;
        }

        if (text === 'no' || text === 'cancel') {
            delete userSessions[userId];
            ctx.reply('❌ Cancelled.');
            return;
        }

        if (session.type === 'edit') {
            await ctx.reply('🤖 Parsing update...');
            try {
                const jobData = await parseJobWithAI(ctx.message.text);
                if (!jobData) return ctx.reply('❌ Failed to parse.');
                await Job.updateOne({ slug: session.slug }, { $set: jobData });
                delete userSessions[userId];
                ctx.reply(`✅ Job updated: ${session.slug}`);
            } catch (err) { ctx.reply('❌ Error updating job.'); }
        }
    });
};

module.exports = registerTextHandler;
