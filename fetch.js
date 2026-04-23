
const axios = require('axios');
const xml2js = require('xml2js');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');

const jar = new tough.CookieJar();
const client = wrapper(axios.create({ jar }));

const NSE_URL = 'https://nsearchives.nseindia.com/content/corporate/CORPORATE_ANNOUNCEMENTS.xml';

async function fetchNSE() {
  try {
    await client.get('https://www.nseindia.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const res = await client.get(NSE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/xml'
      },
      timeout: 15000
    });

    const parsed = await xml2js.parseStringPromise(res.data);

    const items = parsed.rss.channel[0].item;

    return items.slice(0, 20).map(item => ({
      title: item.title?.[0] || '',
      link: item.link?.[0] || '',
      description: item.description?.[0] || '',
      pubDate: item.pubDate?.[0] || ''
    }));

  } catch (err) {
    console.error('Fetch error:', err.message);
    return [];
  }
}

module.exports = { fetchNSE };

