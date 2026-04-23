
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
if (text.includes("PAPER")) {
  console.log("PAPER FOUND IN:", item.title);
}
    let bestMatch = null;
    let bestScore = 0;

    for (const symbol in companyMap) {

      const company = companyMap[symbol];

      const words = normalize(company.name).split(" ");

      let score = 0;

      for (const w of words) {
        if (w.length < 2) continue; // ignore garbage, keep short valid like JK
        if (text.includes(w)) score++;
      }

      // bonus if symbol appears
      if (text.includes(symbol)) score += 2;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = company;
      }
    }

    // 🔥 threshold = 2 (tuned for your dataset)
    if (bestScore >= 2 && bestMatch) {
      results.push({
        ...item,
        company: bestMatch.name,
        symbol: bestMatch.symbol,
        id
      });

      seenSet.add(id);
    }
  }

  return results;
}


module.exports = { matchCompanies };

