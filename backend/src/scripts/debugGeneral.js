/**
 * Debug General Topic
 * Tries to send to the group ID with different Thread ID configurations.
 */
const { Telegraf } = require('telegraf');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_GENERAL; // Should be -1003779465176

if (!botToken || !chatId) {
    console.error('Missing env vars');
    process.exit(1);
}

const bot = new Telegraf(botToken);

async function runDebug() {
    console.log(`Debugging General Topic for Chat: ${chatId}`);

    // Try 1: Explicit ID 1
    try {
        console.log('\n--- Attempt 1: Thread ID = 1 ---');
        await bot.telegram.sendMessage(chatId, 'Test: Thread ID 1', { 
            message_thread_id: 1 
        });
        console.log('✅ Success with Thread ID 1');
    } catch (e) {
        console.log(`❌ Failed with Thread ID 1: ${e.description}`);
    }

    // Try 2: No Thread ID (Undefined)
    try {
        console.log('\n--- Attempt 2: No Thread ID (Undefined) ---');
        await bot.telegram.sendMessage(chatId, 'Test: No Thread ID (Should go to General)', {});
        console.log('✅ Success with No Thread ID');
    } catch (e) {
        console.log(`❌ Failed with No Thread ID: ${e.description}`);
    }
    
    // Try 3: 0 ?
     try {
        console.log('\n--- Attempt 3: Thread ID = 0 ---');
        await bot.telegram.sendMessage(chatId, 'Test: Thread ID 0', { 
            message_thread_id: 0
        });
        console.log('✅ Success with Thread ID 0');
    } catch (e) {
        console.log(`❌ Failed with Thread ID 0: ${e.description}`);
    }

}

runDebug();
