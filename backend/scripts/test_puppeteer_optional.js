const { scrapeJobPageWithPuppeteer } = require('../src/services/scraper/puppeteerScraper');

console.log('🧪 Testing Puppeteer Optional Loading...');

// Mocking a URL
const testUrl = 'https://www.talentd.in/jobs/test-job';

(async () => {
    try {
        const result = await scrapeJobPageWithPuppeteer(testUrl);
        console.log('Result:', result);
        
        if (result.success === false && result.error.includes('Puppeteer not installed')) {
            console.log('✅ Success: Function handled missing Puppeteer gracefully.');
        } else if (result.success) {
             console.log('ℹ️ Note: Puppeteer IS installed locally, so it ran. This is expected in dev.');
        } else {
            console.log('❌ Failure: Function failed with unexpected error:', result.error);
        }
    } catch (e) {
        console.error('❌ CRITICAL FAILURE: Accessing the function caused a crash:', e);
    }
})();
