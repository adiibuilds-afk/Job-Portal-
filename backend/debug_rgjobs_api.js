const axios = require('axios');

async function checkApi() {
    const id = '1694';
    const url = `https://api.rgjobs.in/api/job/${id}`;
    
    console.log(`Fetching ${url}...`);
    try {
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        console.log('Status:', res.status);
        if (res.data.job) {
             console.log('Job Keys:', Object.keys(res.data.job));
             console.log('Job Data Preview:', JSON.stringify(res.data.job, null, 2).substring(0, 2000));
        } else {
             console.log('Keys:', Object.keys(res.data));
        }
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Data:', err.response.data);
        }
    }
}

checkApi();
