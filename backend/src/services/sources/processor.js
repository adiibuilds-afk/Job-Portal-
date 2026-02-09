const { scrapeJobPage } = require('../scraper');
const { parseJobWithAI } = require('../groq');
const { refineJobWithAI, finalizeJobData } = require('../jobProcessor');
const { downloadAndProcessLogo: downloadAndSaveLogo } = require('../../utils/imageProcessor');
const Job = require('../../models/Job');
const { postJobToTelegram } = require('./utils');

/**
 * Extracts company name from common platform URLs for fallback
 */
const extractCompanyFromUrl = (url) => {
    try {
        const urlObj = new URL(url);
        const host = urlObj.hostname.toLowerCase();
        const pathParts = urlObj.pathname.split('/').filter(Boolean);

        if (host.includes('lever.co') && pathParts.length > 0) {
            return pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1);
        }
        if (host.includes('greenhouse.io') && pathParts.length > 0) {
            return pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1);
        }
    } catch (e) {}
    return null;
};

/**
 * Orchestrates the full job processing pipe: Scrape -> Parse -> Refine -> Save -> Post
 * @param {string} url - The job URL
 * @param {Object} bot - Telegraf bot instance
 * @param {Object} options - Optional: { content, title, company, applyUrl } for direct processing (e.g. RSS/JSON)
 */
const processJobUrl = async (url, bot, options = {}) => {
    try {
        let scraped = null;
        let fallbackUsed = false;

        // --- VERY EARLY URL-ONLY CHECK ---
        // Normalize URL for better matching
        const cleanUrl = url.toLowerCase().replace(/\/$/, '');
        const existingByUrl = await Job.findOne({ 
            $or: [
                { applyUrl: cleanUrl }, 
                { originalUrl: cleanUrl },
                { applyUrl: url },
                { originalUrl: url }
            ] 
        });
        
        if (existingByUrl) {
            console.log(`   ⏭️ Skipping Duplicate (URL Match): ${url}`);
            return { skipped: true, reason: 'duplicate' };
        }

        if (options.content || options.title) {
            // Already have content (from RSS/JSON), skip scraping
            scraped = {
                success: true,
                title: options.title || '',
                content: options.content || '',
                applyUrl: options.applyUrl || url,
                company: options.company || '',
                companyLogo: options.companyLogo || ''
            };
        } else {
            console.log(`   🔎 Scraping page: ${url}`);
            scraped = await scrapeJobPage(url);

            // Fallback for Specific Platforms (Lever, Greenhouse)
            if (!scraped.success) {
                const isLever = url.includes('lever.co');
                const isGreenhouse = url.includes('greenhouse.io') || url.includes('greenhouse.com');

                if (isLever || isGreenhouse) {
                    console.log(`   ⚠️ Scraping failed, using fallback logic for ${isLever ? 'Lever' : 'Greenhouse'}...`);
                    const company = extractCompanyFromUrl(url) || (isLever ? 'Lever' : 'Greenhouse');
                    scraped = {
                        success: true,
                        title: `Job Opportunity at ${company}`,
                        company: company,
                        content: `A new job opening has been posted on ${isLever ? 'Lever' : 'Greenhouse'}. Visit the application link for more details.`,
                        applyUrl: url,
                        isFallback: true
                    };
                    fallbackUsed = true;
                } else {
                    return { success: false }; // Not a targeted platform, skip
                }
            }
        }

        // --- EARLY DEDUPLICATION CHECK ---
        // Check if job exists BEFORE doing expensive AI or image uploads
        const existing = await Job.findOne({
            $or: [
                { applyUrl: scraped.applyUrl || url },
                { 
                    title: { $regex: new RegExp(`^${scraped.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
                    company: { $regex: new RegExp(`^${scraped.company ? scraped.company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : ''}$`, 'i') }
                }
            ]
        });

        if (existing) {
             console.log(`   ⏭️ Skipping Duplicate (Early Check): ${scraped.title} at ${scraped.company || 'Unknown'}`);
             return { skipped: true, reason: 'duplicate' };
        }

        let enrichedText = `Job URL: ${url}\n\nTitle: ${scraped.title}\n${scraped.content}`;
        let extractedData = await parseJobWithAI(enrichedText);
        
        // Handle AI Rate Limit
        if (extractedData && extractedData.error === 'rate_limit_exceeded') {
            return { error: 'rate_limit' };
        }

        // If AI parsing fails but it's a fallback or we have feed data, we at least have basic data
        if (!extractedData || !extractedData.title) {
            if (fallbackUsed || options.title) {
                extractedData = {
                    title: scraped.title,
                    company: scraped.company,
                    applyUrl: scraped.applyUrl || url,
                    description: scraped.content
                };
            } else {
                return { success: false };
            }
        }

        const refinedData = await refineJobWithAI(extractedData);
        if (refinedData && refinedData.error === 'rate_limit_exceeded') return { error: 'rate_limit' };

        const rawData = {
            ...extractedData,
            applyUrl: scraped.applyUrl || extractedData.applyUrl || url,
            companyLogo: scraped.companyLogo || extractedData.companyLogo,
            company: scraped.company || extractedData.company,
            tags: scraped.tags || extractedData.tags,
            batch: scraped.batch || extractedData.batch
        };

        const jobData = await finalizeJobData(refinedData || {}, rawData);

        // Sanity checks/cleanup
        if (jobData.applyUrl && jobData.applyUrl.toLowerCase().includes('talentd.in')) {
             console.log(`   ⏭️ Skipping Circular Link: ${jobData.title}`);
             return { skipped: true, reason: 'circular' };
        }

        if (jobData.companyLogo && jobData.companyLogo.includes('talentd-orange-icon.avif')) jobData.companyLogo = '';
        
        // Download logo if needed
        if (jobData.companyLogo && jobData.companyLogo.startsWith('http') && !jobData.companyLogo.includes('res.cloudinary.com')) {
             const localLogo = await downloadAndSaveLogo(jobData.companyLogo, jobData.company);
             if (localLogo) jobData.companyLogo = localLogo;
        }

        const newJob = new Job(jobData);
        await newJob.save();
        console.log(`✅ Saved: ${newJob.title}`);
        console.log(`🔗 Apply Link: ${newJob.applyUrl}`);

        const msgId = await postJobToTelegram(newJob, bot);
        if (msgId) {
            newJob.telegramMessageId = msgId;
            await newJob.save();
        }
        return { success: true, jobId: newJob._id };

    } catch (err) {
        console.error(`   ❌ Error processing URL ${url}: ${err.message}`);
        return { success: false, error: err.message };
    }
};

module.exports = { processJobUrl };
