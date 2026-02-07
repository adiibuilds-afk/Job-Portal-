const { Markup } = require('telegraf');
const Job = require('../../models/Job');
const { parseJobWithAI } = require('../../services/groq');
const { adminOnly, buildPreview, hasValue } = require('../utils/helpers');

const registerCommands = (bot, userSessions) => {
    const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

    bot.start(adminOnly, (ctx) => {
        const msg = `
🎯 *JobPortal Admin Panel*

Welcome, Admin! Here are your commands:

📝 *Job Management*
/job \`<details>\` - Post new job via AI
/list - View all jobs
/delete \`<slug>\` - Delete a job
/feature \`<slug>\` - Toggle featured status
/edit \`<slug>\` - Edit a job

📊 *Analytics*
/stats - View site statistics

📢 *Channel:* ${CHANNEL_ID || 'Not configured'}

❓ /help - Show command reference
        `;
        ctx.replyWithMarkdown(msg);
    });

    bot.command('help', adminOnly, (ctx) => {
        const msg = `
📖 *Command Reference*

*Posting Jobs:*
\`/job Software Developer at Google, Bangalore, 50 LPA, B.Tech CS required, Apply at careers.google.com\`

The AI will parse your text and create structured job data.

*Listing Jobs:*
\`/list\` - Shows last 10 jobs
\`/list all\` - Shows all jobs

*Delete/Feature:*
\`/delete software-developer-google\`
\`/feature software-developer-google\`

*Statistics:*
\`/stats\` - Total jobs, views, clicks

*Tips:*
• Include title, company, location, salary, eligibility, apply link
• AI will extract and structure the data
• Confirm with "yes" to publish
• Jobs auto-post to channel!
        `;
        ctx.replyWithMarkdown(msg);
    });

    bot.command('job', adminOnly, async (ctx) => {
        const rawText = ctx.message.text.replace('/job', '').trim();
        
        if (!rawText) {
            return ctx.replyWithMarkdown(`
❌ *Missing job details*

Usage: \`/job <details>\`

Example:
\`/job Software Developer at TCS, Bangalore, 8-12 LPA, B.Tech required, Apply at tcs.com, Category: IT\`
            `);
        }

        try {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const urls = rawText.match(urlRegex) || [];
            
            const ScheduledJob = require('../../models/ScheduledJob');

            if (urls.length > 1) {
                await ctx.reply(`🔄 Detected ${urls.length} links. Switching to BATCH SCHEDULING mode.`);
                let scheduledCount = 0;
                const startTime = new Date();
                
                for (let i = 0; i < urls.length; i++) {
                    const url = urls[i];
                    const scheduledTime = new Date(startTime.getTime() + (i * 5 * 60 * 1000));
                    const newScheduledJob = new ScheduledJob({
                        originalUrl: url,
                        status: 'pending',
                        scheduledFor: scheduledTime
                    });
                    await newScheduledJob.save();
                    scheduledCount++;
                }
                return ctx.reply(`✅ Successfully scheduled ${scheduledCount} jobs!`);
            }

            await ctx.reply('🤖 Processing...');
            let enrichedText = rawText;
            let scrapedData = null;

            if (urls && urls.length > 0) {
                const url = urls[0];
                await ctx.reply(`🌐 Scanned link: ${url}`);
                try {
                    const { scrapeJobPage } = require('../../services/scraper');
                    const scraped = await scrapeJobPage(url);
                    if (scraped.success) {
                        scrapedData = scraped;
                        enrichedText += `\n\n[SCRAPED CONTENT]\nTitle: ${scraped.title}\n${scraped.content}`;
                    }
                } catch (e) {}
            }

            const jobData = await parseJobWithAI(enrichedText);
            if (!jobData || !jobData.title) return ctx.reply('❌ Failed to parse job.');

            if (!hasValue(jobData.applyUrl) && scrapedData?.applyUrl) jobData.applyUrl = scrapedData.applyUrl;
            if (!hasValue(jobData.applyUrl) && urls?.length > 0) jobData.applyUrl = urls[0];

            userSessions[ctx.from.id] = { type: 'create', data: jobData };
            ctx.replyWithMarkdown(buildPreview(jobData));
        } catch (err) {
            ctx.reply('❌ Error processing job.');
        }
    });

    bot.command('list', adminOnly, async (ctx) => {
        try {
            const showAll = ctx.message.text.includes('all');
            const limit = showAll ? 50 : 10;
            const jobs = await Job.find().sort({ createdAt: -1 }).limit(limit);
            if (jobs.length === 0) return ctx.reply('📭 No jobs found.');

            let msg = `📋 *${showAll ? 'All' : 'Recent'} Jobs (${jobs.length})*\n\n`;
            jobs.forEach((job, i) => {
                const featured = job.isFeatured ? '⭐ ' : '';
                msg += `${i + 1}. ${featured}*${job.title}*\n   🏢 ${job.company} | 👀 ${job.views} views\n   🔗 \`${job.slug}\`\n\n`;
            });
            ctx.replyWithMarkdown(msg);
        } catch (err) { ctx.reply('❌ Error fetching jobs.'); }
    });

    bot.command('delete', adminOnly, async (ctx) => {
        const slug = ctx.message.text.replace('/delete', '').trim();
        if (!slug) return ctx.replyWithMarkdown('❌ Usage: `/delete <slug>`');
        try {
            const job = await Job.findOne({ slug });
            if (!job) return ctx.reply(`❌ Job not found: ${slug}`);
            userSessions[ctx.from.id] = { type: 'delete', slug };
            ctx.replyWithMarkdown(`⚠️ *Confirm Delete*\n\nJob: *${job.title}*\nCompany: ${job.company}\n\nReply *yes* to delete.`);
        } catch (err) { ctx.reply('❌ Error finding job.'); }
    });

    bot.command('feature', adminOnly, async (ctx) => {
        const slug = ctx.message.text.replace('/feature', '').trim();
        if (!slug) return ctx.replyWithMarkdown('❌ Usage: `/feature <slug>`');
        try {
            const job = await Job.findOne({ slug });
            if (!job) return ctx.reply(`❌ Job not found: ${slug}`);
            job.isFeatured = !job.isFeatured;
            await job.save();
            ctx.reply(`${job.isFeatured ? '⭐' : '✓'} "${job.title}" is now ${job.isFeatured ? 'FEATURED' : 'unfeatured'}.`);
        } catch (err) { ctx.reply('❌ Error updating job.'); }
    });

    bot.command('stats', adminOnly, async (ctx) => {
        try {
            const totalJobs = await Job.countDocuments();
            const featuredJobs = await Job.countDocuments({ isFeatured: true });
            const viewsAgg = await Job.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);
            const clicksAgg = await Job.aggregate([{ $group: { _id: null, total: { $sum: '$clicks' } } }]);
            const categoryAgg = await Job.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
            const totalViews = viewsAgg[0]?.total || 0;
            const totalClicks = clicksAgg[0]?.total || 0;
            const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0;

            let msg = `📊 *JobPortal Statistics*\n\n📝 Total Jobs: ${totalJobs}\n⭐ Featured: ${featuredJobs}\n👀 Total Views: ${totalViews.toLocaleString()}\n🖱 Total Clicks: ${totalClicks.toLocaleString()}\n📈 CTR: ${ctr}%\n\n*By Category:*\n`;
            categoryAgg.forEach(cat => { msg += `• ${cat._id || 'Uncategorized'}: ${cat.count}\n`; });
            ctx.replyWithMarkdown(msg);
        } catch (err) { ctx.reply('❌ Error fetching statistics.'); }
    });

    bot.command('edit', adminOnly, async (ctx) => {
        const slug = ctx.message.text.replace('/edit', '').trim();
        if (!slug) return ctx.replyWithMarkdown('❌ Usage: `/edit <slug>`');
        try {
            const job = await Job.findOne({ slug });
            if (!job) return ctx.reply(`❌ Job not found: ${slug}`);
            userSessions[ctx.from.id] = { type: 'edit', slug };
            ctx.replyWithMarkdown(`✏️ *Edit Job: ${job.title}*\n\nTo update, send the new description.`);
        } catch (err) { ctx.reply('❌ Error finding job.'); }
    });
};

module.exports = registerCommands;
