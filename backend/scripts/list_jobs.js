const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Job = require('../src/models/Job');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected.');
    const jobs = await Job.find({}, 'title company');
    console.log('Current Jobs:');
    jobs.forEach(j => console.log(`- [${j.title}] at [${j.company}]`));
    process.exit();
  })
  .catch(err => console.error(err));
