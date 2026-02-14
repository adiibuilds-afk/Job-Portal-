const Job = require('../../models/Job');
const Settings = require('../../models/Settings');

const escapeHTML = (str) => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

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

        let message = `🎯 <b>New Job Alert!</b>\n\n`;
        if (job.company) message += `🏢 <b>Company:</b> ${escapeHTML(job.company)}\n`;
        if (job.title) message += `📌 <b>Role:</b> ${escapeHTML(job.title)}\n`;
        if (job.eligibility && job.eligibility !== 'N/A') message += `\n👥 <b>Batch/Eligibility:</b>\n${escapeHTML(job.eligibility)}\n`;
        if (job.salary && job.salary !== 'N/A') message += `\n💰 <b>Salary:</b> ${escapeHTML(job.salary)}`;
        if (job.location && job.location !== 'N/A') message += `\n📍 <b>Location:</b> ${escapeHTML(job.location)}`;

        message += `\n\n🔗 <b>Apply Now:</b>\n${jobUrl}\n\n━━━━━━━━━━━━━━━\n\n📢 <b>Join Our Channels:</b>\n\n🔹 Telegram :- https://t.me/jobgridupdates\n\n🔹 WhatsApp Channel :- https://whatsapp.com/channel/0029Vak74nQ0wajvYa3aA432\n\n🔹 WhatsApp Group :- https://chat.whatsapp.com/EuNhXQkwy7Y4ELMjB1oVPd?mode=gi_t\n\n🔹 LinkedIn :- https://www.linkedin.com/company/jobgrid-in`;
        
        const sent = await bot.telegram.sendMessage(CHANNEL_ID, message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        });
        console.log(`✅ Posted to channel: ${job.title}`);
        
        // Update Job with Channel Message ID
        if (job._id) {
            try {
                // Determine if 'job' is a Mongoose document or plain object
                // If it's a doc, we can use job.constructor or import Job model?
                // Safest to just import Job model at top.
                await Job.findByIdAndUpdate(job._id, {
                    telegramMessageId: sent.message_id, // Backward compat
                    $push: {
                        telegramMessages: {
                            chatId: CHANNEL_ID.toString(),
                            messageId: sent.message_id,
                            type: 'channel'
                        }
                    }
                });
            } catch (dbErr) {
                console.error('⚠️ Failed to save Channel Msg ID to DB:', dbErr.message);
            }
        }

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
    deleteTelegramPost,
    escapeHTML
};
