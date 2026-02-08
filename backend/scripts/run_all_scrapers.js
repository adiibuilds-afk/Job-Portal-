const { spawn } = require('child_process');
const path = require('path');

// Helper to run a script and return a promise
const runScript = (scriptPath, name) => {
    return new Promise((resolve, reject) => {
        console.log(`\n🚀 Starting ${name}...`);
        console.log(`📂 Script Path: ${scriptPath}`);

        // Quote the path to handle spaces in directory names
        const command = `node "${scriptPath}"`;
        const process = spawn(command, [], {
            stdio: 'inherit', 
            shell: true      
        });

        process.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${name} completed successfully.`);
                resolve();
            } else {
                console.error(`❌ ${name} failed with exit code ${code}.`);
                reject(new Error(`${name} failed`));
            }
        });

        process.on('error', (err) => {
            console.error(`❌ ${name} process error:`, err);
            reject(err);
        });
    });
};

const runAll = async () => {
    console.log('🌟 Starting Unified Scraper Job 🌟');
    const startTime = Date.now();

    try {
        // 1. Run Telegram Scraper
        const telegramScript = path.join(__dirname, '../src/scripts/scrapeTelegramJobs.js');
        await runScript(telegramScript, 'Telegram Scraper');

        // 2. Run Talentd Scraper
        const talentdScript = path.join(__dirname, 'manual_talentd_sync.js');
        await runScript(talentdScript, 'Talentd Sync');

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\n✨ All Scrapers Completed Successfully in ${duration}s! ✨`);

    } catch (error) {
        console.error('\n💥 Unified Scraper Job Failed:', error.message);
        process.exit(1);
    }
};

runAll();
