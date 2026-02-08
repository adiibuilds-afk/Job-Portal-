const path = require('path');
const { Telegraf } = require('telegraf');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const sendDemoMessage = async () => {
    
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

    if (!BOT_TOKEN || !CHANNEL_ID) {
        console.error('❌ TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID missing in .env');
        process.exit(1);
    }

    const bot = new Telegraf(BOT_TOKEN);

    // Mock Job Data
    const mockJob = {
        title: 'Junior Software Engineer (Demo)',
        company: 'JobGrid Tech',
        location: 'Remote, India',
        salary: '₹12 LPA - ₹18 LPA',
        batch: '2024/2025',
        slug: 'junior-software-engineer-demo-123'
    };

    const WEBSITE_URL = process.env.WEBSITE_URL || 'https://jobgrid.in';
    const jobUrl = `${WEBSITE_URL}/job/${mockJob.slug}`;

    // Message Construction (Exact same as production code)
    let message = `🎯 *New Job Alert!* (DEMO)\n\n`;
    message += `🏢 *Company:* ${mockJob.company}\n`;
    message += `📌 *Role:* ${mockJob.title}\n`;
    message += `\n👥 *Batch/Eligibility:*\n${mockJob.batch}\n`;
    message += `\n💰 *Salary:* ${mockJob.salary}`;
    message += `\n📍 *Location:* ${mockJob.location}`;
    
    // The Footer with New Links
    message += `\n\n🔗 *Apply Now:*\n${jobUrl}\n\n━━━━━━━━━━━━━━━\n\n📢 *Join Our Channels:*\n\n🔹 Telegram :- https://t.me/jobgridupdates\n\n🔹 WhatsApp Channel :- https://whatsapp.com/channel/0029Vak74nQ0wajvYa3aA432\n\n🔹 LinkedIn :- https://www.linkedin.com/company/jobgrid-in`;

    try {
        console.log('🚀 Sending demo message to:', CHANNEL_ID);
        await bot.telegram.sendMessage(CHANNEL_ID, message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
        });
        console.log('✅ Demo message sent successfully!');
    } catch (error) {
        console.error('❌ Failed to send message:', error.message);
    }
};

sendDemoMessage();
