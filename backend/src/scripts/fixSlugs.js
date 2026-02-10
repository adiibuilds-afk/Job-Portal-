const mongoose = require('mongoose');
require('dotenv').config();
const Job = require('../models/Job');

async function checkSlugs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const total = await Job.countDocuments();
        const withoutSlug = await Job.countDocuments({ slug: { $exists: false } });
        const emptySlug = await Job.countDocuments({ slug: '' });

        console.log(`Summary:`);
        console.log(`Total Jobs: ${total}`);
        console.log(`Jobs without slug field: ${withoutSlug}`);
        console.log(`Jobs with empty slug: ${emptySlug}`);

        if (withoutSlug > 0 || emptySlug > 0) {
            console.log('Fixing slugs...');
            const jobsToFix = await Job.find({ $or: [{ slug: { $exists: false } }, { slug: '' }] });
            for (const job of jobsToFix) {
                // job.save() will trigger the pre-save hook to generate slug
                await job.save();
                console.log(`Fixed slug for: ${job.title} at ${job.company}`);
            }
            console.log(`Successfully fixed ${jobsToFix.length} jobs.`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkSlugs();
