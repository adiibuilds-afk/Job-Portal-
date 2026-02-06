const mongoose = require('mongoose');
require('dotenv').config();
const Job = require('./src/models/Job');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB...');
    const jobs = await Job.find({}).limit(50);
    console.log(`Found ${jobs.length} jobs.`);
    jobs.forEach(j => {
        console.log(`ID: ${j._id} | Title: "${j.title}" | Company: "${j.company}"`);
    });
    process.exit();
  })
  .catch(err => {
      console.error(err);
      process.exit(1);
  });
