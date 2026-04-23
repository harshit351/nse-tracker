
const axios = require('axios');

const API_URL = 'https://nse-tracker-harshit351worker.harshit351.workers.dev';

async function fetchAllFeeds() {
  try {
    const res = await axios.get(API_URL, {
      timeout: 15000
    });

    console.log('Fetched JSON from worker');

    return res.data;

  } catch (err) {
    console.error('Fetch error:', err.message);
    return [];
  }
}

module.exports = { fetchAllFeeds };
