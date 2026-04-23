
const axios = require('axios');
const { fetchAllFeeds } = require('./fetch');
const { matchCompanies } = require('./matcher');


const SHEET_API = "https://script.google.com/macros/s/AKfycbwXx4I8vvKuvjsnEflYylCgHU9dCJGZrtuTzRVi4ZrnFJ1QwFk1i5Ik2Hi_Ky-bV18fTQ/exec";

async function main() {


async function loadCompanies() {
  const res = await axios.get(SHEET_API);
  const list = res.data;

  const map = {};

  for (const c of list) {
    map[c.symbol] = {
      name: c.name,
      symbol: c.symbol
    };
  }

  return map;
}

const companyMap = await loadCompanies();

  const seenSet = new Set();

const raw = await fetchAllFeeds();


console.log("TOTAL ITEMS:", raw.length);
console.log("SAMPLE ITEM:", raw[0]);

  const processed = matchCompanies(raw, companyMap, seenSet);

 if (processed.length === 0) {
  console.log('No matches, sending test row');

  await axios.post(SHEET_API, [{
    company: "TEST",
    title: "Test Entry",
    link: "https://test.com",
    id: Date.now()
  }]);

  return;
}

  await axios.post(SHEET_API, processed);

  console.log(`Pushed ${processed.length} items`);
}

// run every 5 mins
setInterval(main, 5 * 60 * 1000);
main();

