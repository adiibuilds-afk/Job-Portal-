const { Telegraf, Markup } = require('telegraf');
const { parseJobWithAI } = require('../services/groq');
const Job = require('../models/Job');

const setupBot = (token) => {
  const bot = new Telegraf(token);

  // Session store
  const userSessions = {};

  // Channel ID for posting updates
  const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
  const WEBSITE_URL = process.env.WEBSITE_URL || 'https://jobgrid.in';

  // Auth middleware
  const adminOnly = (ctx, next) => {
    const adminId = parseInt(process.env.ADMIN_ID);
    if (ctx.from.id !== adminId) {
      return ctx.reply('⛔ Unauthorized. Admin access only.');
    }
    return next();
  };

  // Helper: Check if value exists and is not N/A
  const hasValue = (val) => val && val !== 'N/A' && val !== 'n/a' && val.trim() !== '';

  // Helper: Build preview message (only show fields with values)
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

  // Function to post job to channel
  const postToChannel = async (job) => {
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
      
      message += `\n\n🔗 *Apply Now:*\n${jobUrl}\n\n━━━━━━━━━━━━━━━\n📢 @jobupdatebyadi`;

      await bot.telegram.sendMessage(CHANNEL_ID, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      });

      console.log(`✅ Posted to channel: ${job.title}`);
    } catch (err) {
      console.error('Failed to post to channel:', err.message);
    }
  };

  // ==================== COMMANDS ====================

  // /start - Welcome message
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

  // /help
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

  // /job - Post new job
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
      // Check for URL in text
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = rawText.match(urlRegex) || [];
      
      const { ScheduledJob } = require('../models/ScheduledJob'); // Delayed import

      if (urls.length > 1) {
          // BATCH MODE
          await ctx.reply(`🔄 Detected ${urls.length} links. Switching to BATCH SCHEDULING mode.`);
          
          let scheduledCount = 0;
          const startTime = new Date();
          
          for (let i = 0; i < urls.length; i++) {
              const url = urls[i];
              // Schedule every 5 minutes
              const scheduledTime = new Date(startTime.getTime() + (i * 5 * 60 * 1000));
              
              const newScheduledJob = new require('../models/ScheduledJob')({
                  originalUrl: url,
                  status: 'pending',
                  scheduledFor: scheduledTime
              });
              
              await newScheduledJob.save();
              scheduledCount++;
          }
          
          return ctx.reply(`✅ Successfully scheduled ${scheduledCount} jobs!\n\n🕒 First job: Now\n🕒 Last job: in ${urls.length * 5} minutes\n\nThey will be auto-processed in background.`);
      }

      // SINGLE MODE (Legacy)
      await ctx.reply('🤖 Processing... If a link is present, I will scan it for details.');

      let enrichedText = rawText;
      let scrapedData = null;

      if (urls && urls.length > 0) {
        const url = urls[0]; // Take first URL
        await ctx.reply(`🌐 Scanned link: ${url}\nExtracting details...`);
        
        try {
          const { scrapeJobPage } = require('../services/scraper');
          const scraped = await scrapeJobPage(url);
          
          if (scraped.success) {
            scrapedData = scraped;
            enrichedText += `\n\n[SCRAPED CONTENT FROM ${url}]\nTitle: ${scraped.title}\n${scraped.content}`;
          } else {
             await ctx.reply('⚠️ Could not scrape link, using provided text only.');
          }
        } catch (scrapeErr) {
          console.error('Scrape error:', scrapeErr);
        }
      }

      await ctx.reply('🧠 AI is parsing the job details...');
      const jobData = await parseJobWithAI(enrichedText);

      if (!jobData || !jobData.title) {
        return ctx.reply('❌ Failed to parse job. Please provide more details.');
      }

      // Ensure apply URL is set
      if (!hasValue(jobData.applyUrl) && scrapedData && scrapedData.applyUrl) {
         jobData.applyUrl = scrapedData.applyUrl;
      }
      // If still no apply URL, try to find it in urls
      if (!hasValue(jobData.applyUrl) && urls && urls.length > 0) {
         jobData.applyUrl = urls[0];
      }

      // Store in session
      userSessions[ctx.from.id] = { type: 'create', data: jobData };

      const preview = buildPreview(jobData);
      ctx.replyWithMarkdown(preview);
    } catch (err) {
      console.error('Job parsing error:', err);
      ctx.reply('❌ Error processing job. Please try again.');
    }
  });

  // /list - List jobs
  bot.command('list', adminOnly, async (ctx) => {
    try {
      const showAll = ctx.message.text.includes('all');
      const limit = showAll ? 50 : 10;
      
      const jobs = await Job.find().sort({ createdAt: -1 }).limit(limit);

      if (jobs.length === 0) {
        return ctx.reply('📭 No jobs found.');
      }

      let msg = `📋 *${showAll ? 'All' : 'Recent'} Jobs (${jobs.length})*\n\n`;

      jobs.forEach((job, i) => {
        const featured = job.isFeatured ? '⭐ ' : '';
        msg += `${i + 1}. ${featured}*${job.title}*\n`;
        msg += `   🏢 ${job.company} | 👀 ${job.views} views\n`;
        msg += `   🔗 \`${job.slug}\`\n\n`;
      });

      msg += `\n_Use /delete <slug> or /feature <slug>_`;

      ctx.replyWithMarkdown(msg);
    } catch (err) {
      console.error('List error:', err);
      ctx.reply('❌ Error fetching jobs.');
    }
  });

  // /delete - Delete a job
  bot.command('delete', adminOnly, async (ctx) => {
    const slug = ctx.message.text.replace('/delete', '').trim();

    if (!slug) {
      return ctx.replyWithMarkdown('❌ Usage: `/delete <slug>`\n\nUse /list to see job slugs.');
    }

    try {
      const job = await Job.findOne({ slug });

      if (!job) {
        return ctx.reply(`❌ Job not found: ${slug}`);
      }

      userSessions[ctx.from.id] = { type: 'delete', slug };

      ctx.replyWithMarkdown(`
⚠️ *Confirm Delete*

Job: *${job.title}*
Company: ${job.company}

Reply *yes* to delete or *no* to cancel.
      `);
    } catch (err) {
      ctx.reply('❌ Error finding job.');
    }
  });

  // /feature - Toggle featured
  bot.command('feature', adminOnly, async (ctx) => {
    const slug = ctx.message.text.replace('/feature', '').trim();

    if (!slug) {
      return ctx.replyWithMarkdown('❌ Usage: `/feature <slug>`');
    }

    try {
      const job = await Job.findOne({ slug });

      if (!job) {
        return ctx.reply(`❌ Job not found: ${slug}`);
      }

      job.isFeatured = !job.isFeatured;
      await job.save();

      ctx.reply(`${job.isFeatured ? '⭐' : '✓'} Job "${job.title}" is now ${job.isFeatured ? 'FEATURED' : 'unfeatured'}.`);
    } catch (err) {
      ctx.reply('❌ Error updating job.');
    }
  });

  // /stats - Analytics
  bot.command('stats', adminOnly, async (ctx) => {
    try {
      const totalJobs = await Job.countDocuments();
      const featuredJobs = await Job.countDocuments({ isFeatured: true });
      
      const viewsAgg = await Job.aggregate([
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]);
      const clicksAgg = await Job.aggregate([
        { $group: { _id: null, total: { $sum: '$clicks' } } }
      ]);
      
      const categoryAgg = await Job.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const recentJob = await Job.findOne().sort({ createdAt: -1 });

      const totalViews = viewsAgg[0]?.total || 0;
      const totalClicks = clicksAgg[0]?.total || 0;
      const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0;

      let msg = `
📊 *JobPortal Statistics*

*Overview:*
📝 Total Jobs: ${totalJobs}
⭐ Featured: ${featuredJobs}
👀 Total Views: ${totalViews.toLocaleString()}
🖱 Total Clicks: ${totalClicks.toLocaleString()}
📈 CTR: ${ctr}%

*By Category:*
`;

      categoryAgg.forEach(cat => {
        msg += `• ${cat._id || 'Uncategorized'}: ${cat.count}\n`;
      });

      if (recentJob) {
        msg += `\n*Latest:* ${recentJob.title} (${recentJob.views} views)`;
      }

      ctx.replyWithMarkdown(msg);
    } catch (err) {
      console.error('Stats error:', err);
      ctx.reply('❌ Error fetching statistics.');
    }
  });

  // /edit - Edit a job
  bot.command('edit', adminOnly, async (ctx) => {
    const slug = ctx.message.text.replace('/edit', '').trim();

    if (!slug) {
      return ctx.replyWithMarkdown('❌ Usage: `/edit <slug>`');
    }

    try {
      const job = await Job.findOne({ slug });

      if (!job) {
        return ctx.reply(`❌ Job not found: ${slug}`);
      }

      userSessions[ctx.from.id] = { type: 'edit', slug };

      let msg = `✏️ *Edit Job: ${job.title}*\n\nCurrent values:\n`;
      if (hasValue(job.title)) msg += `• Title: ${job.title}\n`;
      if (hasValue(job.company)) msg += `• Company: ${job.company}\n`;
      if (hasValue(job.location)) msg += `• Location: ${job.location}\n`;
      if (hasValue(job.salary)) msg += `• Salary: ${job.salary}\n`;
      
      msg += `\nTo update, send the new full job description and I'll parse it with AI.\nOr reply *cancel* to abort.`;

      ctx.replyWithMarkdown(msg);
    } catch (err) {
      ctx.reply('❌ Error finding job.');
    }
  });

  // ==================== TEXT HANDLER ====================
  bot.on('text', adminOnly, async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text.toLowerCase().trim();
    const session = userSessions[userId];

    if (!session) return;

    // Handle YES
    if (text === 'yes') {
      if (session.type === 'create') {
        try {
          const newJob = new Job(session.data);
          await newJob.save();
          
          ctx.reply(`✅ Job Published!\n\n🔗 Slug: ${newJob.slug}\n📌 ${newJob.title} at ${newJob.company}\n\n📢 Posting to channel...`);
          
          // Post to channel
          await postToChannel(newJob);
          
        } catch (err) {
          console.error('Save error:', err);
          ctx.reply('❌ Error saving job to database.');
        }
      } else if (session.type === 'delete') {
        try {
          await Job.deleteOne({ slug: session.slug });
          ctx.reply(`🗑 Job deleted: ${session.slug}`);
        } catch (err) {
          ctx.reply('❌ Error deleting job.');
        }
      }
      delete userSessions[userId];
      return;
    }

    // Handle NO/CANCEL
    if (text === 'no' || text === 'cancel') {
      delete userSessions[userId];
      ctx.reply('❌ Cancelled.');
      return;
    }

    // Handle EDIT - new description
    if (session.type === 'edit') {
      await ctx.reply('🤖 Parsing update with AI...');
      
      try {
        const jobData = await parseJobWithAI(ctx.message.text);
        
        if (!jobData) {
          return ctx.reply('❌ Failed to parse. Try again or /cancel');
        }

        await Job.updateOne({ slug: session.slug }, { $set: jobData });
        delete userSessions[userId];
        
        ctx.reply(`✅ Job updated: ${session.slug}`);
      } catch (err) {
        ctx.reply('❌ Error updating job.');
      }
    }
  });

  // ==================== START BOT ====================
  bot.launch()
    .then(() => {
      console.log('🤖 Telegram Bot is running...');
      console.log(`📢 Channel: ${CHANNEL_ID || 'Not configured'}`);
    })
    .catch((err) => {
      console.error('Bot launch error:', err);
    });

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  return bot;
};

module.exports = setupBot;
