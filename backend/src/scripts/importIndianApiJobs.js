const axios = require('axios');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Settings = require('../models/Settings');
require('dotenv').config();

const API_KEY = 'sk-live-530ztPDrw0MA6iGQqY8HOo9uuJGCaJn96L7u1cum'; // Hardcoded as per request (should be env var ideally)
const BASE_URL = 'https://jobs.indianapi.in/jobs';

/**
 * Import Jobs from IndianAPI
 * Run every 3 days
 */
const importIndianApiJobs = async (limit = 50) => {
    try {
        console.log(`🇮🇳 Fetching ${limit} jobs from IndianAPI...`);

        const response = await axios.get(`${BASE_URL}?limit=${limit}`, {
            headers: {
                'X-Api-Key': API_KEY,
                'User-Agent': 'Mozilla/5.0 (compatible; JobPortalBot/1.0)'
            }
        });

        const jobs = response.data;
        if (!Array.isArray(jobs)) {
            console.error('❌ Invalid response format (expected array)');
            return;
        }

        console.log(`📥 Received ${jobs.length} jobs. Processing...`);

        let imported = 0;
        let skipped = 0;

        for (const job of jobs) {
            // 1. Check Duplicates
            const exists = await Job.findOne({ applyUrl: job.apply_link });
            if (exists) {
                skipped++;
                continue;
            }

            // 2. Map to Schema
            // Combine description parts for rich content
            let fullDescription = `
                <p><strong>About Company:</strong> ${job.about_company || ''}</p>
                <hr/>
                <h3>Job Description</h3>
                <p>${job.job_description || ''}</p>
                <br/>
                <h3>Roles & Responsibilities</h3>
                <p>${job.role_and_responsibility || ''}</p>
                <br/>
                <h3>Education & Skills</h3>
                <p>${job.education_and_skills || ''}</p>
            `;

            const newJob = new Job({
                title: job.title || job.job_title || 'Software Engineer',
                company: job.company || 'Unknown',
                // Logo: missing in API response, frontend will use letter placeholder
                location: job.location || 'Remote',
                jobType: job.job_type || 'Full Time',
                batch: job.experience ? [job.experience] : [], // e.g. "Fresher"
                salary: 'Disclosed', // API doesn't seem to provide salary?
                applyUrl: job.apply_link,
                description: fullDescription,
                source: 'indianapi',
                // Use posted_date if valid, else now
                createdAt: job.posted_date ? new Date(job.posted_date) : new Date(),
                isActive: true
            });

            await newJob.save();
            imported++;
            console.log(`✅ Imported: ${newJob.title} at ${newJob.company}`);
        }

        console.log(`📊 Import Summary: ${imported} imported, ${skipped} skipped.`);

    } catch (error) {
        console.error('❌ IndianAPI Import Error:', error.message);
        if (error.response) {
            console.error('   Details:', error.response.data);
        }
    }
};

// Standalone execution
if (require.main === module) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => importIndianApiJobs(20)) // Test with 20
        .then(() => process.exit(0))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

module.exports = { importIndianApiJobs };
