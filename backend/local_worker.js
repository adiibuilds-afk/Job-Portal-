require('dotenv').config();
const mongoose = require('mongoose');
const { Telegraf } = require('telegraf');
const { initScheduler, runAutoScraper } = require('./src/services/scheduler');

async function start() {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
        
        // 1. Initialize Scheduler (Starts Queue Processor & other cron jobs)
        // Note: The Auto-Scraper schedule itself is disabled in code, so it won't run automatically via cron.
        initScheduler(bot); 
        console.log('✅ Scheduler initialized (Queue processor running in background).');

        // 2. Trigger Auto-Scraper Immediately
        console.log('\n🚀 Triggering Auto-Scraper Manual Run...');
        await runAutoScraper(bot);
        
        console.log('\n✨ Auto-Scraper discovery finished.');
        console.log('⏳ Keeping process alive to handle queued jobs (Puppeteer)...');
        console.log('👉 Press Ctrl+C to stop when all jobs are processed.');

    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

start();
