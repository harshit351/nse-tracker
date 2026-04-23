
const axios = require('axios');
const { fetchAllFeeds } = require('./fetch');
const { matchCompanies } = require('./matcher');


const SHEET_API = "https://script.google.com/macros/s/AKfycbwXx4I8vvKuvjsnEflYylCgHU9dCJGZrtuTzRVi4ZrnFJ1QwFk1i5Ik2Hi_Ky-bV18fTQ/exec";

async function main() {



async function loadCompanies() {
  const res = await axios.get(SHEET_API);
  const list = res.data;

  return list; // no mapping into symbol map anymore
}

}

const companyMap = await loadCompanies();

  const seenSet = new Set();

const raw = await fetchAllFeeds();


console.log("TOTAL ITEMS:", raw.length);
console.log("SAMPLE ITEM:", raw[0]);
console.log("COMPANIES LOADED:", Object.keys(companyMap).length);

  const processed = raw.slice(0, 5).map(item => ({
  ...item,
  company: "UNFILTERED",
  symbol: "NA",
  id: Date.now() + Math.random()
}));

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

