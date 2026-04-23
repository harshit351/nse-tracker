
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
    .toUpperCase()
    .replace(/LIMITED|LTD|PVT|PRIVATE|INDUSTRIES|INDUSTRY/g, '')
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
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

      // 🔥 NSE symbol (strong)
      if (company.nse && text.includes(company.nse)) score += 4;

      // 🔥 BSE code (medium)
      if (company.bse && text.includes(company.bse)) score += 2;

      // 🔥 Name matching
      const companyName = normalize(company.name);
      const words = companyName.split(" ").filter(w => w.length > 3);

      let wordMatches = 0;

      for (const w of words) {
        if (text.includes(w)) {
          wordMatches++;
        }
      }

      if (wordMatches >= 2) {
        score += 3;
      } else if (wordMatches === 1) {
        score += 1;
      }

      // ✅ THIS WAS MISSING
      if (score > bestScore) {
        bestScore = score;
        bestMatch = company;
      }
    }

    // threshold tuned
    if (bestScore >= 3 && bestMatch) {
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

