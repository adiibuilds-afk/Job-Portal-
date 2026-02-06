/**
 * RG Jobs Queue Importer
 * Fetches latest jobs from api.rgjobs.in and adds them to the ScheduledJob queue.
 * - Runs every 2 hours via scheduler
 * - Max 20 jobs per run
 * - Deduplicates by apply URL
 * - Downloads & compresses logos locally (resized to square)
 */

const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const Job = require('../models/Job');
const ScheduledJob = require('../models/ScheduledJob');
const Settings = require('../models/Settings');
const { generateSEOContent } = require('../services/groq');

const RG_JOBS_API = 'https://api.rgjobs.in/api/getAllJobs';
const RG_JOBS_IMAGE_BASE = 'https://api.rgjobs.in/';
const MAX_JOBS_PER_RUN = 20;
const LOGO_SIZE = 80; // Square size for logos

/**
 * Download logo, resize to square (with padding), compress to WebP
 */
const downloadAndProcessLogo = async (imageUrl, companyName = 'company') => {
    try {
        if (!imageUrl || !imageUrl.startsWith('http')) return null;

        console.log(`   📥 Downloading logo: ${imageUrl}`);
        
        const response = await axios({
            url: imageUrl,
            responseType: 'arraybuffer',
            timeout: 10000
        });

        // Ensure upload directory exists
        const uploadDir = path.join(__dirname, '../../public/uploads/logos');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Slugify company name for filename
        const slugifiedName = companyName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 30);

        // Generate unique filename with company name
        const filename = `${slugifiedName}-${Date.now()}.webp`;
        const filePath = path.join(uploadDir, filename);

        // Process with Sharp:
        // 1. Resize to fit within LOGO_SIZE x LOGO_SIZE (maintaining aspect ratio)
        // 2. Extend to square with white background (for better visibility)
        // 3. Convert to WebP with quality 80
        await sharp(response.data)
            .resize(LOGO_SIZE, LOGO_SIZE, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
            })
            .webp({ quality: 80 })
            .toFile(filePath);

        console.log(`   ✅ Logo saved: ${filename}`);
        return `/uploads/logos/${filename}`;
    } catch (error) {
        console.error(`   ❌ Logo download failed: ${error.message}`);
        return null;
    }
};

// Map RG Jobs jobtype to JobGrid format
const mapJobType = (jobtype) => {
    switch (jobtype) {
        case 1: return 'FullTime';
        case 2: return 'Internship';
        case 3: return 'Contract';
        default: return 'FullTime';
    }
};

// Parse salary string to get minimum value
const parseMinSalary = (payString) => {
    if (!payString) return 0;
    const match = payString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
};

// Parse batches string to array
const parseBatches = (batchString) => {
    if (!batchString) return [];
    return batchString.split(',').map(b => b.trim()).filter(Boolean);
};

/**
 * Clean up RG Jobs titles by removing unnecessary suffixes
 */
const cleanTitle = (title) => {
    if (!title) return '';
    
    // Patterns to remove from end of title
    const patternsToRemove = [
        /\s*\|\s*Role,?\s*Responsibilities\s*&\s*Skills\s*$/i,
        /\s*–\s*Roles?,?\s*Skills?\s*&\s*Eligibility\s*$/i,
        /\s*–\s*Backend\s*Role,?\s*Responsibilities\s*&\s*Required\s*Skills\s*$/i,
        /\s*\|\s*Hybrid\s*Internship\s*Opportunity\s*$/i,
        /\s*\|\s*Remote\s*Internship\s*Opportunity\s*$/i,
        /\s*–\s*Role,?\s*Responsibilities\s*&\s*Required\s*Skills\s*$/i,
        /\s*\|\s*Full\s*Stack\s*Role\s*$/i,
        /\s*\|\s*Backend\s*Role\s*$/i,
        /\s*\|\s*Frontend\s*Role\s*$/i,
        /\s*–\s*Responsibilities\s*&\s*Skills\s*$/i,
        /\s*\|\s*Responsibilities\s*&\s*Skills\s*$/i,
        /\s*–\s*Required\s*Skills\s*$/i,
        /\s*\|\s*Required\s*Skills\s*$/i,
        /\s*–\s*Skills\s*&\s*Eligibility\s*$/i,
        /\s*\|\s*Skills\s*&\s*Eligibility\s*$/i,
    ];
    
    let cleanedTitle = title;
    for (const pattern of patternsToRemove) {
        cleanedTitle = cleanedTitle.replace(pattern, '');
    }
    
    return cleanedTitle.trim();
};

// Map RG Jobs data to JobGrid schema
const mapToJobSchema = async (rgJob) => {
    let company = 'Unknown';
    const atMatch = rgJob.title?.match(/at\s+([^|]+)/i);
    if (atMatch) {
        company = atMatch[1].trim();
    }

    // Download and process the logo with company name
    let companyLogo = null;
    if (rgJob.image) {
        const fullUrl = `${RG_JOBS_IMAGE_BASE}${rgJob.image}`;
        companyLogo = await downloadAndProcessLogo(fullUrl, company);
    }

    // Default values
    let finalTitle = cleanTitle(rgJob.title) || '';
    let finalDescription = rgJob.description || '';
    let finalRoles = rgJob.rolesAndResponsibilities || '';
    let finalRequirements = rgJob.requirements || '';
    let finalEligibility = rgJob.eligibility || '';

    // Helper to format AI list output
    const formatAiValue = (val) => {
        if (!val) return '';
        if (Array.isArray(val)) return val.join('\n');
        return String(val);
    };

    // Generate SEO Content (Title & Description + Details)
    try {
        console.log(`   🤖 Generating SEO content for: ${company}`);
        const seoData = await generateSEOContent({
            title: finalTitle,
            company: company,
            location: rgJob.location || '',
            salary: rgJob.pay || '',
            batch: rgJob.batches || '',
            description: finalDescription
        });

        if (seoData && seoData.error === 'rate_limit_exceeded') {
            return { error: 'rate_limit_exceeded' };
        }

        if (seoData) {
            if (seoData.title) finalTitle = seoData.title;
            if (seoData.description) finalDescription = seoData.description;
            if (seoData.rolesResponsibility) finalRoles = formatAiValue(seoData.rolesResponsibility);
            if (seoData.requirements) finalRequirements = formatAiValue(seoData.requirements);
            if (seoData.eligibility) finalEligibility = formatAiValue(seoData.eligibility);
        }
    } catch (err) {
        if (err?.error === 'rate_limit_exceeded' || err?.message === 'rate_limit_exceeded') {
             // Retain partial data maybe? No, user wants to STOP.
             return { error: 'rate_limit_exceeded' };
        }
        console.error('   ⚠️ SEO Generation failed, using raw data');
    }

    return {
        title: finalTitle,
        company: company,
        companyLogo: companyLogo,
        location: rgJob.location || '',
        eligibility: finalEligibility,
        salary: rgJob.pay || '',
        description: finalDescription,
        applyUrl: rgJob.joblink || '',
        category: 'Engineering',
        batch: parseBatches(rgJob.batches),
        tags: rgJob.role ? [rgJob.role] : [],
        jobType: mapJobType(rgJob.jobtype),
        roleType: rgJob.role || 'Engineering',
        seniority: 'Entry',
        minSalary: parseMinSalary(rgJob.pay),
        isRemote: rgJob.location?.toLowerCase().includes('remote') || false,
        rolesResponsibility: finalRoles,
        requirements: finalRequirements,
        niceToHave: rgJob.niceToHave || '',
        isActive: true,
        isFeatured: false
    };
};

/**
 * Queue RG Jobs for 1-by-1 processing
 * Called every 2 hours by scheduler
 */
const queueRGJobs = async () => {
    console.log(`[${new Date().toISOString()}] 🔄 RG Jobs Queue Sync Started...`);
    
    try {
        const response = await axios.get(RG_JOBS_API);
        
        if (response.data.status !== 200 || !response.data.JobsData) {
            console.error('❌ Invalid response from RG Jobs API');
            return { queued: 0, skipped: 0 };
        }

        // Get latest jobs (sorted by created_at desc, take first 20)
        const rgJobs = response.data.JobsData
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, MAX_JOBS_PER_RUN)
            .reverse(); // Process Oldest -> Newest so latest job gets latest createdAt

        console.log(`📋 Processing ${rgJobs.length} latest RG Jobs...`);

        // Get the latest queue time
        const lastJob = await ScheduledJob.findOne({ status: 'pending' }).sort({ scheduledFor: -1 });
        let nextScheduleTime = lastJob ? new Date(lastJob.scheduledFor) : new Date();
        if (nextScheduleTime < new Date()) {
            nextScheduleTime = new Date();
        }

        // Get interval setting
        const intervalSetting = await Settings.findOne({ key: 'schedule_interval_minutes' });
        const intervalMinutes = intervalSetting ? parseInt(intervalSetting.value) : 60;

        let queued = 0;
        let skipped = 0;

        for (const rgJob of rgJobs) {
            try {
                const applyUrl = rgJob.joblink;
                if (!applyUrl) {
                    skipped++;
                    continue;
                }

                // Check if already in Jobs collection (already posted)
                const existingJob = await Job.findOne({ applyUrl });
                if (existingJob) {
                    skipped++;
                    continue;
                }

                // Check if already in queue
                const existingQueue = await ScheduledJob.findOne({ originalUrl: applyUrl });
                if (existingQueue) {
                    skipped++;
                    continue;
                }

                // Add interval for next slot
                nextScheduleTime = new Date(nextScheduleTime.getTime() + intervalMinutes * 60000);

                // Add to queue with full RG data (no AI processing needed)
                const queueItem = new ScheduledJob({
                    originalUrl: applyUrl,
                    scheduledFor: nextScheduleTime,
                    status: 'pending',
                    source: 'rgjobs',
                    rgJobData: JSON.stringify(rgJob)
                });
                await queueItem.save();

                queued++;
                console.log(`   ✅ Queued: ${rgJob.title?.substring(0, 40)}... for ${nextScheduleTime.toLocaleString()}`);
            } catch (err) {
                console.error(`   ❌ Error: ${err.message}`);
            }
        }

        console.log(`[${new Date().toISOString()}] 📊 RG Jobs Queue Complete: ${queued} queued, ${skipped} skipped`);
        return { queued, skipped };
    } catch (err) {
        console.error(`[${new Date().toISOString()}] ❌ RG Jobs Queue Failed:`, err.message);
        return { queued: 0, skipped: 0 };
    }
};

/**
 * Direct import (for immediate posting, bypassing queue)
 */
const importRGJobsDirect = async (limit = 1) => {
    console.log(`🔄 RG Jobs Direct Import (max ${limit})...`);
    
    try {
        const response = await axios.get(RG_JOBS_API);
        
        if (response.data.status !== 200 || !response.data.JobsData) {
            console.error('❌ Invalid response from RG Jobs API');
            return { imported: 0 };
        }

        const rgJobs = response.data.JobsData
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit)
            .reverse(); // Process Oldest -> Newest so latest job gets latest createdAt

        let imported = 0;

        for (const rgJob of rgJobs) {
            // limit check removed as we sliced already, but keeping loop structure simple
            
            const exists = await Job.findOne({ applyUrl: rgJob.joblink });
            if (exists) continue;

            const jobData = await mapToJobSchema(rgJob);

            // Check if AI hit rate limit
            if (jobData && jobData.error === 'rate_limit_exceeded') {
                console.log('🛑 Stopping import due to AI Rate Limit Exceeded (Groq 429).');
                break; // Stop the loop immediately
            }

            const newJob = new Job(jobData);
            await newJob.save();

            imported++;
            console.log(`✅ Imported: ${newJob.title}`);
            console.log(`   🔗 https://jobgrid.in/job/${newJob.slug}`);
            
            // Wait 5 seconds before next import (throttle)
            if (imported < limit) {
                console.log('   ⏳ Waiting 5s before next job...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        console.log(`📊 Direct Import Complete: ${imported} jobs imported`);
        return { imported };
    } catch (err) {
        console.error('❌ Direct Import Failed:', err.message);
        return { imported: 0 };
    }
};

module.exports = { queueRGJobs, mapToJobSchema, importRGJobsDirect, downloadAndProcessLogo };

// Standalone execution (for manual runs)
if (require.main === module) {
    const mongoose = require('mongoose');
    require('dotenv').config();
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('✅ Connected to MongoDB');
            // Direct import 30 jobs (processed Oldest -> Newest)
            return importRGJobsDirect(30);
        })
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}
