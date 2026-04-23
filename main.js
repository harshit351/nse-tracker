
const axios = require('axios');
const { fetchNSE } = require('./fetch');
const { matchCompanies } = require('./matcher');

const SHEET_API = "https://script.google.com/macros/s/AKfycbwXx4I8vvKuvjsnEflYylCgHU9dCJGZrtuTzRVi4ZrnFJ1QwFk1i5Ik2Hi_Ky-bV18fTQ/exec";

async function main() {

  const companyMap = {
    RELIANCE: { name: 'Reliance Industries', symbol: 'RELIANCE' },
    TCS: { name: 'Tata Consultancy Services', symbol: 'TCS' }
  };

  const seenSet = new Set();

  const raw = await fetchNSE();

  const processed = matchCompanies(raw, companyMap, seenSet);

  if (processed.length === 0) {
    console.log('No new items');
    return;
  }

  await axios.post(SHEET_API, processed);

  console.log(`Pushed ${processed.length} items`);
}

// run every 5 mins
setInterval(main, 5 * 60 * 1000);
main();

