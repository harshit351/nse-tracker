
const axios = require('axios');
const { fetchAllFeeds } = require('./fetch');
const { matchCompanies } = require('./matcher');

const SHEET_API = "https://script.google.com/macros/s/AKfycbwXx4I8vvKuvjsnEflYylCgHU9dCJGZrtuTzRVi4ZrnFJ1QwFk1i5Ik2Hi_Ky-bV18fTQ/exec";

async function loadCompanies() {
  const res = await axios.get(SHEET_API);
  return res.data;
}

async function main() {
  try {
    const companies = await loadCompanies();
    console.log("COMPANIES LOADED:", companies.length);

    const raw = await fetchAllFeeds();
    console.log("TOTAL ITEMS:", raw.length);

    const processed = matchCompanies(raw, companies, new Set());

    if (processed.length === 0) {
      console.log("No matches, sending test row");

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

  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

// ✅ IMPORTANT — this is what runs it
main();

