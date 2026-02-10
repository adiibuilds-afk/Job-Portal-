/**
 * Duplicate Job Finder & Cleaner
 * Identifies jobs with same Apply URL or same Title+Company
 */
const mongoose = require('mongoose');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Job = require('../models/Job');

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
        console.log('\n--- 🔍 Duplicate Job Finder ---');
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.\n');

        // 1. Group by Apply URL
        console.log('🔎 Analyzing Apply URLs...');
        const urlDuplicates = await Job.aggregate([
            { $group: { 
                _id: { $toLower: '$applyUrl' }, 
                count: { $sum: 1 },
                jobs: { $push: { id: '$_id', title: '$title', company: '$company', createdAt: '$createdAt' } }
            }},
            { $match: { count: { $gt: 1 }, _id: { $ne: null, $ne: '' } } }
        ]);

        // 2. Group by Title + Company
        console.log('🔎 Analyzing Title + Company matches...');
        const semanticDuplicates = await Job.aggregate([
            { $group: { 
                _id: { 
                    title: { $toLower: { $trim: { input: '$title' } } }, 
                    company: { $toLower: { $trim: { input: '$company' } } }
                }, 
                count: { $sum: 1 },
                jobs: { $push: { id: '$_id', title: '$title', company: '$company', createdAt: '$createdAt', url: '$applyUrl' } }
            }},
            { $match: { count: { $gt: 1 } } }
        ]);

        const allDups = [...urlDuplicates, ...semanticDuplicates];
        
        if (allDups.length === 0) {
            console.log('✨ No duplicates found!');
            process.exit(0);
        }

        console.log(`\n⚠️ Found ${allDups.length} groups of potential duplicates.\n`);

        for (const group of allDups) {
            console.log(`-------------------------------------------`);
            console.log(`Group: ${group._id.title || group._id} at ${group._id.company || ''} (${group.count} jobs)`);
            group.jobs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            group.jobs.forEach((j, i) => {
                console.log(` [${i + 1}] ID: ${j.id} | ${j.title} | ${j.company} | ${new Date(j.createdAt).toLocaleDateString()} | ${j.url || ''}`);
            });
        }

        const action = await askQuestion('\nChoices: [clean] Delete all older duplicates, [manual] Specific IDs, [exit]: ');

        if (action.toLowerCase() === 'clean') {
            let deletedCount = 0;
            for (const group of allDups) {
                // Keep the oldest one (index 0) and delete the rest
                const toDelete = group.jobs.slice(1).map(j => j.id);
                const result = await Job.deleteMany({ _id: { $in: toDelete } });
                deletedCount += result.deletedCount;
            }
            console.log(`\n✅ Successfully cleaned up ${deletedCount} duplicate jobs.`);
        } else if (action.toLowerCase() === 'manual') {
            const ids = await askQuestion('Enter IDs to delete (comma separated): ');
            const idList = ids.split(',').map(id => id.trim()).filter(id => mongoose.Types.ObjectId.isValid(id));
            if (idList.length > 0) {
                const result = await Job.deleteMany({ _id: { $in: idList } });
                console.log(`\n✅ Deleted ${result.deletedCount} jobs.`);
            }
        }

        console.log('\n✨ Finished.');
        process.exit(0);

    } catch (err) {
        console.error('\n❌ Error:', err.message);
        process.exit(1);
    }
};

run();
