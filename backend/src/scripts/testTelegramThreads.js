/**
 * Test Telegram Threads Configuration
 * Sends a test message to each configured Telegram Thread to verify setup.
 * Usage: node src/scripts/testTelegramThreads.js
 */
const { Telegraf } = require('telegraf');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
    console.error('❌ TELEGRAM_BOT_TOKEN is missing in .env');
    process.exit(1);
}

const bot = new Telegraf(botToken);

const batches = [
    '2030', '2029', '2028', '2027', '2026', '2025', '2024',
    'Older', 'General'
];

async function testThreads() {
    console.log('🚀 Starting Telegram Thread Test...\n');
    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    for (const batch of batches) {
        const chatKey = `TELEGRAM_CHAT_${batch.toUpperCase()}`;
        const threadKey = `TELEGRAM_THREAD_${batch.toUpperCase()}`;
        
        const chatId = process.env[chatKey];
        const threadId = process.env[threadKey];

        if (!chatId) {
            console.log(`⚠️ Batch '${batch}': Skipping (No CHAT ID set)`);
            skipCount++;
            continue;
        }

        console.log(`Attempting Batch '${batch}' -> Chat: ${chatId}, Thread: ${threadId || 'None (Main Chat)'}`);

        try {
            const message = `🔔 <b>Test Notification</b>\n\nChecking configuration for <b>Batch: ${batch}</b>.\nIf you see this, the setup is correct! ✅`;
            const options = { parse_mode: 'HTML' };
            if (threadId) {
                const tId = parseInt(threadId);
                if (tId === 1) {
                    // General Topic (Main Chat) -> Send without thread_id
                } else {
                    options.message_thread_id = tId;
                }
            }

            await bot.telegram.sendMessage(chatId, message, options);
            console.log(`   ✅ Success! Message sent for '${batch}'`);
            successCount++;
        } catch (error) {
            console.error(`   ❌ Failed: ${error.message}`);
            failCount++;
        }
        
        // Small delay to avoid spam/rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Test Complete.`);
    console.log(`✅ Sent: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`⏭️ Skipped: ${skipCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

testThreads();
