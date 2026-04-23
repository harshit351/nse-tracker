
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

    // 🔥 1. Symbol match (fast)
    for (const symbol in companyMap) {
      if (text.includes(symbol)) {
        matched = companyMap[symbol];
        break;
      }
    }

    // 🔥 2. Name match (important)
    if (!matched) {
      for (const symbol in companyMap) {
        const name = normalize(companyMap[symbol].name);
        if (name.length > 5 && text.includes(name)) {
          matched = companyMap[symbol];
          break;
        }
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

