
const axios = require('axios');
const xml2js = require('xml2js');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');

const jar = new tough.CookieJar();
const client = wrapper(axios.create({ jar }));

const NSE_URL = 'https://nse-tracker-harshit351worker.harshit351.workers.dev/';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  'Accept': 'application/xml, text/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.nseindia.com/',
  'Connection': 'keep-alive'
};

async function fetchNSE() {
  try {
    // Step 1: Hit homepage to get cookies
    await client.get('https://www.nseindia.com', {
      headers: HEADERS
    });

    // Small delay (important)
    await new Promise(r => setTimeout(r, 1500));

    // Step 2: Fetch XML
    const res = await client.get(NSE_URL, {
      headers: HEADERS,
      timeout: 15000
    });

    console.log('Fetched XML');

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

