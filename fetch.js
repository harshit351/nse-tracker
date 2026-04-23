
const axios = require('axios');
const xml2js = require('xml2js');

const NSE_URL = 'https://nse-tracker-harshit351worker.harshit351.workers.dev';

async function fetchNSE() {
  try {
    const res = await axios.get(NSE_URL, {
      timeout: 15000
    });

    console.log('Fetched XML via proxy');

    const parsed = await xml2js.parseStringPromise(res.data);

    const items = parsed.rss.channel[0].item;

    return items.slice(0, 20).map(item => ({
      title: item.title?.[0] || '',
      link: item.link?.[0] || '',
      description: item.description?.[0] || '',
      pubDate: item.pubDate?.[0] || ''
    }));

  } catch (err) {
    console.error('Fetch error:', err.response?.status || err.message);
    return [];
  }
}

module.exports = { fetchNSE };
