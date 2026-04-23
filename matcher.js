
const crypto = require('crypto');

function generateId(item) {
  return crypto
    .createHash('md5')
    .update(item.link + item.title)
    .digest('hex');
}


function normalize(text) {
  if (!text) return "";

  return text
    .toString()
    .toUpperCase()
    .replace(/LTD|LIMITED|PVT|PRIVATE/g, '')
    .replace(/[^A-Z0-9 ]/g, '')
    .trim();
}




function matchCompanies(items, companyMap, seenSet) {

  const results = [];

  for (const item of items) {

    const id = generateId(item);
    if (seenSet.has(id)) continue;

    const text = normalize((item.title || "") + " " + (item.description || ""));

    let matched = null;

    for (const symbol in companyMap) {

      const company = companyMap[symbol];

      // 🔥 Break company name into keywords
      const words = normalize(company.name)
        .split(" ")
        .filter(w => w.length > 3); // ignore small words

      let matchCount = 0;

      for (const w of words) {
        if (text.includes(w)) {
          matchCount++;
        }
      }

      // 🔥 If 2+ words match → strong signal
      if (matchCount >= 2) {
        matched = company;
        break;
      }
    }

    if (!matched) continue;

    results.push({
      ...item,
      company: matched.name,
      symbol: matched.symbol,
      id
    });

    seenSet.add(id);
  }

  return results;
}

module.exports = { matchCompanies };

