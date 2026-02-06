const mongoose = require('mongoose');
require('dotenv').config();
const Job = require('../src/models/Job');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB...');
    
    // Find all jobs
    const allJobs = await Job.find({});
    console.log(`Total jobs found: ${allJobs.length}`);

    // Filter jobs to KEEP
    // Matches "Wipro" in company AND "Intern" in title (case insensitive)
    const jobsToKeep = allJobs.filter(j => 
        (j.company && j.company.match(/wipro/i)) && 
        (j.title && j.title.match(/intern/i))
    );

    const keepIds = jobsToKeep.map(j => j._id.toString());
    
    console.log(`Jobs to KEEP (${jobsToKeep.length}):`);
    jobsToKeep.forEach(j => console.log(`- ${j.title} at ${j.company}`));

    if (allJobs.length === jobsToKeep.length) {
        console.log('No jobs to delete.');
        process.exit();
    }

    // Delete others
    const result = await Job.deleteMany({ _id: { $nin: keepIds } });
    console.log(`Deleted ${result.deletedCount} jobs.`);
    
    process.exit();
  })
  .catch(err => {
      console.error(err);
      process.exit(1);
  });
