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
const { runTalentdManual } = require('../services/sources/talentd');
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
    { name: 'Talentd', url: 'https://www.talentd.in/jobs', key: 'talentd', fn: runTalentdManual },
    { name: 'Krishna Kumar (Telegram)', url: 'https://t.me/s/jobs_and_internships_updates', key: 'krishnakumar', fn: runKrishnaKumarManual },
    { name: 'InternFreak (Telegram)', url: 'https://t.me/s/internfreak', key: 'internfreak', fn: runInternFreakManual },
    { name: 'GoCareers (Telegram)', url: 'https://t.me/s/gocareers', key: 'gocareers', fn: runGoCareersManual },
    { name: 'Offcampus Phodenge (Telegram)', url: 'https://t.me/s/offcampus_phodenge', key: 'offcampus', fn: runOffcampusManual },
    { name: 'DotAware (Telegram)', url: 'https://t.me/s/dot_aware', key: 'dotaware', fn: runDotAwareManual },
    { name: 'FresherOffCampus (RSS)', url: 'https://www.fresheroffcampus.com/', key: 'fresheroffcampus', fn: runFresherOffCampusManual },
    { name: 'FreshersJobsAadda (JSON)', url: 'https://freshersjobsaadda.blogspot.com/', key: 'freshersjobsaadda', fn: runFreshersJobsAaddaManual }
];

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
        console.log('Select sources to run (e.g., 1,3,5 or type "all"):');
        
        SOURCE_LIST.forEach((s, i) => {
            console.log(`[${i + 1}] ${s.name.padEnd(30)} | ${s.url}`);
        });
        console.log(`[A] Run All Sources`);

        const choice = await askQuestion('\nChoice: ');

        let selected = [];
        if (choice.toLowerCase() === 'all' || choice.toLowerCase() === 'a') {
            selected = SOURCE_LIST;
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

        const limitStr = await askQuestion('\nJob Limit per source (default 20): ');
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
                const WhatsAppBundler = require('../services/sources/whatsappBundler');
                bundler = new WhatsAppBundler(bot, process.env.ADMIN_ID);
             }
        }

        // Process selected sources
        for (const source of selected) {
            console.log(`\n🚀 Starting Source: ${source.name} (${source.url})`);
            const result = await source.fn(bot, limit, bundler); 

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
        console.log('\n✨ All selected sources processed.');
        process.exit(0);

    } catch (err) {
        console.error('\n❌ Critical Error in manualRun:', err.message);
        process.exit(1);
    }
};

run();
