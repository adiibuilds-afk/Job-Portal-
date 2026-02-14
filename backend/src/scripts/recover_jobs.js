const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { processRateLimitedJobs } = require('../services/scheduler/aiQueue');

// Initialize Telegraf for posting
let bot = null;
if (process.env.TELEGRAM_BOT_TOKEN) {
    const { Telegraf } = require('telegraf');
    bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
} else {
    console.warn('⚠️ No TELEGRAM_BOT_TOKEN found. Notifications will be skipped.');
}

async function runRecovery() {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        console.log('\n🔄 Starting Manual Job Recovery...');
        
        // Run once
        await processRateLimitedJobs(bot);

        console.log('\n✨ Recovery process finished.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

runRecovery();
