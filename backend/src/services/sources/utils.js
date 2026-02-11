const Job = require('../../models/Job');
const Settings = require('../../models/Settings');

const postJobToTelegram = async (job, bot) => {
    if (!bot) {
        console.log('⚠️ Bot instance not provided, skipping Telegram post.');
        return;
    }

    try {
        const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
        const WEBSITE_URL = process.env.WEBSITE_URL || 'https://jobgrid.in';

        if (!CHANNEL_ID) {
            console.log('⚠️ TELEGRAM_CHANNEL_ID not set.');
            return;
        }

        const jobUrl = `${WEBSITE_URL}/job/${job.slug}`;

        let message = `🎯 *New Job Alert!*\n\n`;
        if (job.company) message += `🏢 *Company:* ${job.company}\n`;
        if (job.title) message += `📌 *Role:* ${job.title}\n`;
        if (job.eligibility && job.eligibility !== 'N/A') message += `\n👥 *Batch/Eligibility:*\n${job.eligibility}\n`;
        if (job.salary && job.salary !== 'N/A') message += `\n💰 *Salary:* ${job.salary}`;
        if (job.location && job.location !== 'N/A') message += `\n📍 *Location:* ${job.location}`;

        message += `\n\n🔗 *Apply Now:*\n${jobUrl}\n\n━━━━━━━━━━━━━━━\n\n📢 *Join Our Channels:*\n\n🔹 Telegram :- https://t.me/jobgridupdates\n\n🔹 WhatsApp Channel :- https://whatsapp.com/channel/0029Vak74nQ0wajvYa3aA432\n\n🔹 WhatsApp Group :- https://chat.whatsapp.com/EuNhXQkwy7Y4ELMjB1oVPd?mode=gi_t\n\n🔹 LinkedIn :- https://www.linkedin.com/company/jobgrid-in`;
        
        const sent = await bot.telegram.sendMessage(CHANNEL_ID, message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
        });
        console.log(`✅ Posted to channel: ${job.title}`);
        return sent.message_id;
    } catch (err) {
        console.error('❌ Failed to post to Telegram:', err.message);
        return null;
    }
};

/**
 * Deletes a message from Telegram
 */
const deleteTelegramPost = async (bot, messageId) => {
    if (!bot || !messageId) return false;
    try {
        const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
        await bot.telegram.deleteMessage(CHANNEL_ID, messageId);
        return true;
    } catch (err) {
        console.error('❌ Failed to delete from Telegram:', err.message);
        return false;
    }
};

/**
 * Waits for a specified duration, allowing the user to skip by pressing 's',
 * quit by pressing 'q', or move to next source by pressing 't'.
 * @param {number} ms - Duration in milliseconds
 * @returns {Promise<string>} - 'timeout', 'skip', 'quit', or 'next_source'
 */
const waitWithSkip = async (ms) => {
    return new Promise(resolve => {
        const seconds = Math.floor(ms / 1000);
        process.stdout.write(`⏳ Waiting ${seconds}s... (s: skip, q: quit, t: next source) `);

        let timeout;
        let finished = false;
        let countdown = seconds;
        let interval;

        const onData = (data) => {
            if (!data || finished) return;
            const str = data.toString().trim().toLowerCase();
            
            if (str === 's') {
                console.log('\n⏩ Skipping delay...');
                finish('skip');
            } else if (str === 'q') {
                console.log('\n🛑 Quitting process...');
                finish('quit');
            } else if (str === 't') {
                console.log('\n⏭️ Moving to next source...');
                finish('next_source');
            } else if (str === 'd') {
                console.log('\n🗑️ Deleting last posted job...');
                finish('delete');
            }
        };

        const finish = (result) => {
            if (finished) return;
            finished = true;
            if (timeout) clearTimeout(timeout);
            if (interval) clearInterval(interval);
            cleanup();
            resolve(result);
        };

        const cleanup = () => {
            try {
                process.stdin.removeListener('data', onData);
                if (process.stdin.isTTY) {
                    process.stdin.setRawMode(false);
                    // process.stdin.pause(); // Removing pause to avoid breaking subsequent reads
                }
            } catch (err) { }
        };

        try {
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(true);
                process.stdin.resume();
                process.stdin.setEncoding('utf8');
                process.stdin.on('data', onData);
                
                // On some systems, we need to explicitly listen for exit signals if in RawMode
                process.on('SIGINT', () => finish('quit')); 
            } else {
                // If not TTY, we might be in a piped environment or specific shell
                process.stdin.on('data', onData);
            }
        } catch (err) {
            console.log('\n⚠️ Keyboard input not fully available.');
        }

        // Visual countdown (optional but helps keep terminal alive)
        interval = setInterval(() => {
            if (finished) return;
            countdown--;
            if (countdown >= 0) {
                process.stdout.write(`\r⏳ Waiting ${countdown}s... [s: skip, q: quit, t: next source, d: delete last]     `);
            }
        }, 1000);

        timeout = setTimeout(() => {
            if (!finished) {
                console.log('\n⏰ Time up.');
                finish('timeout');
            }
        }, ms);
    });
};

module.exports = {
    waitWithSkip,
    postJobToTelegram,
    deleteTelegramPost
};
