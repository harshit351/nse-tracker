const crypto = require('crypto');

function generateId(item) {
  return crypto
    .createHash('md5')
    .update((item.link || '') + (item.title || ''))
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

// Extract BSE scrip code from title like: "ABC Ltd (532123)"
function extractBSECode(title) {
  if (!title) return null;
  const match = title.match(/\((\d{5,6})\)/);
  return match ? match[1] : null;
}

// Extract NSE symbol from link (very reliable for NSE)
function extractNSESymbol(link) {
  if (!link) return null;

  const match = link.match(/\/corporate\/([A-Z0-9]+)_/);
  return match ? match[1] : null;
}

function matchCompanies(items, companies, seenSet) {

  const results = [];

  for (const item of items) {

    const id = generateId(item);
    if (seenSet.has(id)) continue;

    const title = item.title || "";
    const text = normalize(title); // 🚨 ONLY TITLE (no description)

    const bseCode = extractBSECode(title);
    const nseSymbol = extractNSESymbol(item.link);

    let matchedCompany = null;

    // =====================================================
    // 🔥 STEP 1: HARD MATCH (100% RELIABLE)
    // =====================================================

    for (const company of companies) {

      if (company.bse && bseCode && company.bse === bseCode) {
        matchedCompany = company;
        break;
      }

      if (company.nse && nseSymbol && company.nse === nseSymbol) {
        matchedCompany = company;
        break;
      }
    }

    // =====================================================
    // 🔥 STEP 2: STRICT NAME MATCH (fallback only)
    // =====================================================

    if (!matchedCompany) {

      let bestScore = 0;
      let bestMatch = null;

      for (const company of companies) {

        const companyName = normalize(company.name);

        const words = companyName
          .split(" ")
          .filter(w =>
            w.length > 3 &&
            !["POWER", "PAPER", "POLY", "FILM", "INDIA"].includes(w)
          );

        let matches = 0;

        for (const w of words) {
          if (text.includes(w)) {
            matches++;
          }
        }

        let score = 0;

        if (matches >= 2) score = 5;
        else if (matches === 1) score = 1;

        if (score > bestScore) {
          bestScore = score;
          bestMatch = company;
        }
      }

      // 🚨 STRICT THRESHOLD
      if (bestScore >= 5) {
        matchedCompany = bestMatch;
      }
    }

    // =====================================================
    // ✅ FINAL PUSH
    // =====================================================

    if (matchedCompany) {

      results.push({
        ...item,
        company: matchedCompany.name,
        symbol: matchedCompany.nse || matchedCompany.bse,
        id
      });

      seenSet.add(id);
    }
  }

  return results;
}

module.exports = { matchCompanies };