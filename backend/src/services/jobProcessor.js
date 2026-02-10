const { generateSEOContent } = require('./groq');
const { cleanTitle, mapJobType, parseMinSalary, parseBatches } = require('../utils/jobHelpers');
const { uploadToCloudinary } = require('../utils/cloudinaryUploader');

/**
 * Shared Job Processor Service
 * Unifies the AI refinement and schema mapping logic for all job sources.
 */

const finalizeJobData = async (refinedData, rawData = {}) => {
    // Helper to format AI list output
    const formatAiValue = (val) => {
        if (!val) return '';
        if (Array.isArray(val)) return val.join('\n');
        return String(val);
    };

    // Helper to clean tags (max 3 words, max 25 chars)
    const cleanTags = (tags) => {
        if (!Array.isArray(tags)) return [];
        return tags
            .map(t => t.trim())
            .filter(t => t.length > 1 && t.length <= 25 && t.split(' ').length <= 3);
    };

    // Helper to clean category (fallback if too long)
    const cleanCategory = (cat) => {
        if (!cat || cat.length > 30) return 'Engineering';
        return cat.trim();
    };

    return {
        title: refinedData.title || cleanTitle(rawData.title),
        company: refinedData.company || rawData.company || 'Unknown',
        companyLogo: refinedData.companyLogo || rawData.companyLogo,
        location: refinedData.location || rawData.location || '',
        eligibility: refinedData.eligibility || rawData.eligibility || '',
        salary: refinedData.salary || rawData.salary || '',
        description: refinedData.description || rawData.description || '',
        // Prioritize raw captured link as AI often hallucinations hub links
        applyUrl: rawData.applyUrl || refinedData.applyUrl || '',
        category: cleanCategory(refinedData.category || rawData.category),
        batch: parseBatches(rawData.batch && rawData.batch.length > 0 ? rawData.batch : refinedData.batch),
        tags: cleanTags((rawData.tags && rawData.tags.length > 0) ? rawData.tags : (refinedData.tags || (rawData.role ? [rawData.role] : []))),
        jobType: mapJobType(refinedData.jobType || rawData.jobtype || (rawData.title?.toLowerCase().includes('intern') ? 'Internship' : 'FullTime')),
        roleType: refinedData.roleType || rawData.roleType || rawData.role || 'Engineering',
        seniority: refinedData.seniority || rawData.seniority || 'Entry',
        minSalary: refinedData.minSalary || parseMinSalary(refinedData.salary || rawData.pay || rawData.salary),
        isRemote: refinedData.isRemote || (String(refinedData.location || '').toLowerCase().includes('remote')) || (String(rawData.location || '').toLowerCase().includes('remote')) || false,
        rolesResponsibility: formatAiValue(refinedData.rolesResponsibility || rawData.rolesAndResponsibilities),
        requirements: formatAiValue(refinedData.requirements || rawData.requirements),
        niceToHave: formatAiValue(refinedData.niceToHave || rawData.niceToHave),
        isActive: true,
        isFeatured: false
    };
};

/**
 * Refines job data using AI (SEO Content Generation)
 */
const refineJobWithAI = async (jobData) => {
    try {
        console.log(`   🤖 Refining content for: ${jobData.company || 'Unknown'}`);
        const seoData = await generateSEOContent({
            title: jobData.title,
            company: jobData.company,
            location: jobData.location,
            salary: jobData.salary,
            batch: jobData.batch,
            description: jobData.description,
            role: jobData.roleType || jobData.role
        });

        if (seoData && seoData.error === 'rate_limit_exceeded') {
            return { error: 'rate_limit_exceeded' };
        }

        return seoData || null;
    } catch (err) {
        console.error('   ⚠️ AI Refinement failed:', err.message);
        return null;
    }
};

module.exports = {
    finalizeJobData,
    refineJobWithAI
};
