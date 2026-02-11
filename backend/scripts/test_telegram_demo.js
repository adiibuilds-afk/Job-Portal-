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

    // Simple HTML Escaping
    const escapeHTML = (str) => {
        if (!str) return '';
        return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    // Message Construction (Exact same as production code)
    let message = `🎯 <b>New Job Alert!</b> (DEMO)\n\n`;
    message += `🏢 <b>Company:</b> ${escapeHTML(mockJob.company)}\n`;
    message += `📌 <b>Role:</b> ${escapeHTML(mockJob.title)}\n`;
    message += `\n👥 <b>Batch/Eligibility:</b>\n${escapeHTML(mockJob.batch)}\n`;
    message += `\n💰 <b>Salary:</b> ${escapeHTML(mockJob.salary)}`;
    message += `\n📍 <b>Location:</b> ${escapeHTML(mockJob.location)}`;
    
    // The Footer with New Links
    message += `\n\n🔗 <b>Apply Now:</b>\n${jobUrl}\n\n━━━━━━━━━━━━━━━\n\n📢 <b>Join Our Channels:</b>\n\n🔹 Telegram :- https://t.me/jobgridupdates\n\n🔹 WhatsApp Channel :- https://whatsapp.com/channel/0029Vak74nQ0wajvYa3aA432\n\n🔹 WhatsApp Group :- https://chat.whatsapp.com/EuNhXQkwy7Y4ELMjB1oVPd?mode=gi_t\n\n🔹 LinkedIn :- https://www.linkedin.com/company/jobgrid-in`;

    try {
        console.log('🚀 Sending demo message to:', CHANNEL_ID);
        await bot.telegram.sendMessage(CHANNEL_ID, message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        });
        console.log('✅ Demo message sent successfully!');
    } catch (error) {
        console.error('❌ Failed to send message:', error.message);
    }
};

sendDemoMessage();
