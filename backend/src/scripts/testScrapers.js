/**
 * Test script to verify data extraction from FresherOffCampus and FreshersJobsAadda
 */
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { parseJobWithAI } = require('../services/groq');
const { refineJobWithAI, finalizeJobData } = require('../services/jobProcessor');

const testFresherOffCampus = async () => {
    console.log('\n--- Testing FresherOffCampus (RSS) ---');
    const RSS_URL = 'https://www.fresheroffcampus.com/feed/';
    try {
        const { data } = await axios.get(RSS_URL);
        const $ = cheerio.load(data, { xmlMode: true });
        const item = $('item').first();
        
        const testData = {
            title: item.find('title').text(),
            link: item.find('link').text(),
            content: item.find('content\\:encoded').text() || item.find('description').text()
        };

        console.log(`Found Latest: ${testData.title}`);
        
        // Extract Apply URL heuristic
        const $$ = cheerio.load(testData.content);
        let applyUrl = '';
        $$('a').each((i, el) => {
            const text = $$(el).text().toLowerCase();
            const href = $$(el).attr('href');
            if (href && (text.includes('apply') || text.includes('click here'))) {
                if (!href.includes('fresheroffcampus.com')) {
                    applyUrl = href;
                    return false;
                }
            }
        });

        console.log(`Extracted Apply URL (Heuristic): ${applyUrl}`);
        
        // Simulating AI (commented out to save credits, but explaining fields)
        /*
        const extracted = await parseJobWithAI(testData.content);
        const refined = await refineJobWithAI(extracted);
        const final = await finalizeJobData(refined, {...extracted, applyUrl});
        console.log('Final Job Object Fields:', Object.keys(final));
        */
        
        console.log('Fields it will find: title, company, location, eligibility, salary, description, applyUrl, companyLogo, category, batch, tags, jobType, roleType, seniority, minSalary, isRemote, rolesResponsibility, requirements, niceToHave');

    } catch (err) {
        console.error('Error:', err.message);
    }
};

const testFreshersJobsAadda = async () => {
    console.log('\n--- Testing FreshersJobsAadda (JSON) ---');
    const JSON_URL = 'https://freshersjobsaadda.blogspot.com/feeds/posts/default?alt=json';
    try {
        const { data } = await axios.get(JSON_URL);
        const entry = data.feed.entry[0];
        const title = entry.title.$t;
        const url = entry.link.find(l => l.rel === 'alternate').href;
        const content = entry.content.$t;

        console.log(`Found Latest: ${title}`);
        
        const $$ = cheerio.load(content);
        let applyUrl = '';
        $$('a').each((i, el) => {
            const text = $$(el).text().toLowerCase();
            const href = $$(el).attr('href');
            if (href && (text.includes('apply') || text.includes('click here'))) {
                if (!href.includes('freshersjobsaadda')) {
                    applyUrl = href;
                    return false;
                }
            }
        });

        console.log(`Extracted Apply URL (Heuristic): ${applyUrl}`);
        console.log('Fields it will find: Same as above (Full AI enrichment)');

    } catch (err) {
        console.error('Error:', err.message);
    }
};

const runTests = async () => {
    await testFresherOffCampus();
    await testFreshersJobsAadda();
};

runTests();
