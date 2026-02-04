const axios = require('axios');

async function check() {
  try {
    const res = await axios.get('http://localhost:5000/api/jobs');
    console.log('Jobs found:', res.data.jobs.length);
    res.data.jobs.forEach(j => console.log(j.slug));
  } catch (e) {
    console.error(e.message);
  }
}

check();
