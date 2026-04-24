
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
    console.log("----- RUN START -----");
console.log("RUN TIME (IST):", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
    const companies = await loadCompanies();
    console.log("COMPANIES LOADED:", companies.length);

    const raw = await fetchAllFeeds();
    console.log("TOTAL ITEMS:", raw.length);


// ==============================
// 🔍 RECENT FEED WINDOW (FIXED)
// ==============================

const now = new Date();
const cutoff = new Date(now - 60 * 60 * 1000); // last 60 minutes

const recentDates = raw
  .map(x => new Date(x.pubDate))
  .filter(d => !isNaN(d) && d > cutoff);

recentDates.sort((a, b) => a - b);

if (recentDates.length > 0) {
  const oldest = recentDates[0];
  const newest = recentDates[recentDates.length - 1];

  const diffMinutes = (newest - oldest) / (1000 * 60);

  console.log("RECENT WINDOW (minutes):", diffMinutes.toFixed(2));
  console.log("RECENT OLDEST:", oldest.toISOString());
  console.log("RECENT NEWEST:", newest.toISOString());
}



// ==============================
// ⚡ BURST DENSITY CHECK
// ==============================
const last5min = new Date(Date.now() - 5 * 60 * 1000);

const recentItems = raw.filter(x => {
  const d = new Date(x.pubDate);
  return !isNaN(d) && d > last5min;
});

    const processed = matchCompanies(raw, companies, new Set());

    if (processed.length === 0) {
      console.log("No matches found");
      return;
    }

    await axios.post(SHEET_API, processed);

    console.log(`Sent ${processed.length} items to sheet`);

  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

// 🔁 Run immediately
main();

// 🔁 Run every 15 minutes
setInterval(main, 5 * 60 * 1000);

