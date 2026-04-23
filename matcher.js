
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






function matchCompanies(items, companies, seenSet) {

  const results = [];

  for (const item of items) {

    const id = generateId(item);
    if (seenSet.has(id)) continue;

    const text = normalize((item.title || "") + " " + (item.description || ""));

    let bestMatch = null;
    let bestScore = 0;

    for (const company of companies) {

      let score = 0;

      // 🔥 NSE symbol match (strong)
      if (company.nse && text.includes(company.nse)) {
        score += 3;
      }

      // 🔥 BSE code match (medium)
      if (company.bse && text.includes(company.bse)) {
        score += 2;
      }

      // 🔥 Name match (important)
      const words = normalize(company.name).split(" ");

      for (const w of words) {
        if (w.length < 3) continue;
        if (text.includes(w)) score++;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = company;
      }
    }

    // threshold tuned
    if (bestScore >= 2 && bestMatch) {
      results.push({
        ...item,
        company: bestMatch.name,
        symbol: bestMatch.nse || bestMatch.bse,
        id
      });

      seenSet.add(id);
    }
  }

  return results;
}


module.exports = { matchCompanies };

