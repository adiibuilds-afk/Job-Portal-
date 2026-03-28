/**
 * Manual Source Trigger CLI
 * Usage: node src/scripts/manualRun.js [source_name] [limit]
 * Example: node src/scripts/manualRun.js talentd 10
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Import Sources
const { runRGJobsManual } = require('../services/sources/rgjobs');
// const { runTalentdManual } = require('../services/sources/talentd');
const { runKrishnaKumarManual } = require('../services/sources/krishnakumar');
const { runInternFreakManual } = require('../services/sources/internfreak');
const { runGoCareersManual } = require('../services/sources/gocareers');
const { runOffcampusManual } = require('../services/sources/offcampus');
const { runDotAwareManual } = require('../services/sources/dotaware');
const { runFresherOffCampusManual } = require('../services/sources/fresheroffcampus');
const { runFreshersJobsAaddaManual } = require('../services/sources/freshersjobsaadda');

const readline = require('readline');

const SOURCE_LIST = [
    { name: 'RG Jobs', url: 'https://rgjobs.in', key: 'rgjobs', fn: runRGJobsManual },
    // { name: 'Talentd', url: 'https://www.talentd.in/jobs', key: 'talentd', fn: runTalentdManual },
    { name: 'Krishna Kumar (Telegram)', url: 'https://t.me/s/jobs_and_internships_updates', key: 'krishnakumar', fn: runKrishnaKumarManual },
    { name: 'InternFreak (Telegram)', url: 'https://t.me/s/internfreak', key: 'internfreak', fn: runInternFreakManual },
    { name: 'GoCareers (Telegram)', url: 'https://t.me/s/gocareers', key: 'gocareers', fn: runGoCareersManual },
    { name: 'Offcampus Phodenge (Telegram)', url: 'https://t.me/s/offcampus_phodenge', key: 'offcampus', fn: runOffcampusManual },
    { name: 'DotAware (Telegram)', url: 'https://t.me/s/dot_aware', key: 'dotaware', fn: runDotAwareManual },
    { name: 'FresherOffCampus (RSS)', url: 'https://www.fresheroffcampus.com/', key: 'fresheroffcampus', fn: runFresherOffCampusManual },
    { name: 'FreshersJobsAadda (JSON)', url: 'https://freshersjobsaadda.blogspot.com/', key: 'freshersjobsaadda', fn: runFreshersJobsAaddaManual },
    { name: '[D] Direct Links / Text Block', url: 'Paste links or message blocks', key: 'direct', fn: null }
];

const { processJobUrl } = require('../services/sources/processor');

const runDirectLinks = async (bot, bundler) => {
    console.log('\n--- 📝 Direct Link / Text Block Importer ---');
    console.log('Paste your text block (containing one or more https:// links).');
    console.log('To finish, type "GO" on a new line and press Enter:');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let input = '';
    
    return new Promise(resolve => {
        rl.on('line', (line) => {
            if (line.trim().toLowerCase() === 'go') {
                rl.close();
            } else {
                input += line + '\n';
            }
        });

        rl.on('close', async () => {
            // Extract all https URLs
            const urlRegex = /https?:\/\/[^\s,\])]+/g;
            const matches = input.match(urlRegex) || [];
            const urls = [...new Set(matches.map(u => u.replace(/[.,;]$/, '')))]; // Remove trailing punctuation

            if (urls.length === 0) {
                console.log('❌ No links found in the text.');
                return resolve({ processed: 0, skipped: 0 });
            }

            console.log(`\n🔎 Found ${urls.length} unique links. Starting processing...`);

            let processed = 0;
            let skipped = 0;

            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                console.log(`\n[${i + 1}/${urls.length}] 🔄 Processing: ${url}`);
                
                try {
                    const result = await processJobUrl(url, bot, { bundler });
                    
                    if (result && result.error === 'rate_limit') {
                        return resolve({ processed, skipped, action: 'rate_limit' });
                    }

                    if (result && result.skipped) {
                        skipped++;
                    } else if (result && result.success) {
                        processed++;
                        
                        // Wait/Skip/Delete logic
                        const lastJobId = result.jobId;
                        const waitResult = await require('../services/sources/utils').waitWithSkip(11000);
                        
                        if (waitResult === 'delete' && lastJobId) {
                            const Job = require('../models/Job');
                            const { deleteTelegramPost } = require('../services/sources/utils');
                            const jobToDelete = await Job.findById(lastJobId);
                            if (jobToDelete && jobToDelete.telegramMessageId) {
                                await deleteTelegramPost(bot, jobToDelete.telegramMessageId);
                            }
                            if (bundler) await bundler.removeJob(lastJobId);
                            await Job.findByIdAndDelete(lastJobId);
                            console.log('🗑️ Job deleted.');
                            processed--;
                        }

                        if (waitResult === 'quit') return resolve({ processed, skipped, action: 'quit' });
                        if (waitResult === 'next_source') break;
                    }
                } catch (err) {
                    console.error(`   ❌ Error: ${err.message}`);
                }
            }

            console.log(`\n📊 Direct Export Complete: ${processed} new jobs, ${skipped} skipped.`);
            resolve({ processed, skipped, action: 'complete' });
        });
    });
};

const askQuestion = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
};

const run = async () => {
    try {
        console.log('\n--- 🎯 Manual Job Source Trigger ---');
        const args = process.argv.slice(2);
        let choice = args[0];
        let limitStr = args[1];

        if (!choice) {
            SOURCE_LIST.forEach((s, i) => {
                console.log(`[${i + 1}] ${s.name.padEnd(30)} | ${s.url}`);
            });
            console.log(`[A] Run All Sources`);
            choice = await askQuestion('\nChoice (or "all"): ');
        } else {
            console.log(`\nChoice (from args): ${choice}`);
        }

        let selected = [];
        if (choice.toLowerCase() === 'all' || choice.toLowerCase() === 'a') {
            selected = SOURCE_LIST.filter(s => s.key !== 'direct');
        } else if (choice.toLowerCase() === 'd' || choice.toLowerCase() === 'direct') {
            selected = [SOURCE_LIST.find(s => s.key === 'direct')];
        } else {
            const indexes = choice.split(',').map(x => parseInt(x.trim()) - 1);
            selected = SOURCE_LIST.filter((_, i) => indexes.includes(i));
        }

        if (selected.length === 0) {
            console.log('❌ No valid sources selected.');
            process.exit(1);
        }

        // Show selected URLs for confirmation/reference
        console.log('\nSelected Sources:');
        selected.forEach(s => console.log(` - ${s.name}: ${s.url}`));

        if (!limitStr) {
            limitStr = await askQuestion('\nJob Limit per source (default 20): ');
        } else {
            console.log(`Limit (from args): ${limitStr}`);
        }
        const limit = parseInt(limitStr) || 20;

        console.log('\n⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.\n');

        let bot = null;
        let bundler = null;
        if (process.env.TELEGRAM_BOT_TOKEN) {
             const { Telegraf } = require('telegraf');
             bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
             
             if (process.env.ADMIN_ID) {
                // const WhatsAppBundler = require('../services/sources/whatsappBundler');
                const TelegramBatchBundler = require('../services/sources/telegramBatchBundler');
                const LinkedInBundler = require('../services/sources/linkedinBundler');
                bundler = {
                    // whatsapp: new WhatsAppBundler(bot, process.env.ADMIN_ID),
                    telegram: new TelegramBatchBundler(bot),
                    linkedin: new LinkedInBundler(bot, process.env.ADMIN_ID),
                    async addJob(job) {
                        // await this.whatsapp.addJob(job);
                        await this.telegram.addJob(job);
                        await this.linkedin.addJob(job);
                    },
                    async removeJob(jobId) {
                        // await this.whatsapp.removeJob(jobId);
                        await this.telegram.removeJob(jobId);
                        await this.linkedin.removeJob(jobId);
                    },
                    async flush() {
                        // await this.whatsapp.flush();
                        await this.telegram.flush();
                        await this.linkedin.flush();
                    }
                };
             }
        }

        // Process selected sources
        let totalNewJobs = 0;
        for (const source of selected) {
            if (totalNewJobs >= limit && choice.toLowerCase() === 'all') {
                console.log(`\n🛑 Global limit of ${limit} jobs reached. Skipping remaining sources.`);
                break;
            }

            console.log(`\n🚀 Starting Source: ${source.name} (${source.url})`);
            
            let result;
            const remainingLimit = choice.toLowerCase() === 'all' ? (limit - totalNewJobs) : limit;

            if (source.key === 'direct') {
                result = await runDirectLinks(bot, bundler);
            } else {
                result = await source.fn(bot, remainingLimit, bundler); 
            }

            if (result && result.processed) {
                totalNewJobs += result.processed;
            }

            if (result && result.action === 'quit') {
                console.log('\n👋 Exiting manual run.');
                break;
            }
            if (result && result.action === 'rate_limit') {
                console.log('\n🛑 AI Rate Limit Reached for all keys. Exiting process.');
                if (bundler) await bundler.flush();
                process.exit(1);
            }
            if (result && result.action === 'next') {
                console.log(`\n⏭️ Skipping remaining jobs for ${source.name}, moving to next source...`);
                continue;
            }
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`); // Keep original separator for non-quit/next cases
        }

        if (bundler) await bundler.flush();
        console.log(`\n✨ All selected sources processed. Total new jobs: ${totalNewJobs}`);
        process.exit(0);

    } catch (err) {
        console.error('\n❌ Critical Error in manualRun:', err.message);
        process.exit(1);
    }
};

run();
