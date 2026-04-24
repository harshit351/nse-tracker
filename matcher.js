
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

// Extract BSE code from title like: "ABC Ltd (532123)"
function extractBSECode(title) {
  if (!title) return null;
  const match = title.match(/\((\d{5,6})\)/);
  return match ? match[1] : null;
}

// Extract NSE symbol from link like:
// https://nsearchives.nseindia.com/corporate/DIACABS_...
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
    const text = normalize(title);

    const bseCode = extractBSECode(title);
    const nseSymbol = extractNSESymbol(item.link);

    let matchedCompany = null;

    // =====================================================
    // ✅ STEP 1: HARD MATCH (ONLY TRUST THESE)
    // =====================================================

    for (const company of companies) {

      // BSE exact match
      if (company.bse && bseCode && company.bse === bseCode) {
        matchedCompany = company;
        break;
      }

      // NSE exact match
      if (company.nse && nseSymbol && company.nse === nseSymbol) {
        matchedCompany = company;
        break;
      }
    }

    // =====================================================
    // 🚨 STEP 2: STRICT NAME MATCH (ONLY IF NO IDENTIFIERS)
    // =====================================================

    if (!matchedCompany && !bseCode && !nseSymbol) {

      let bestMatch = null;
      let bestScore = 0;

      for (const company of companies) {

        const companyName = normalize(company.name);

        const words = companyName
          .split(" ")
          .filter(w =>
            w.length > 4 && // stricter words only
            ![
              "POWER", "PAPER", "POLY", "FILM",
              "INDIA", "LIMITED", "INDUSTRIES",
              "CORPORATION", "GROUP"
            ].includes(w)
          );

        if (words.length === 0) continue;

        let matches = 0;

        for (const w of words) {
          if (text.includes(w)) {
            matches++;
          }
        }

        // Only accept strong matches
        if (matches >= 2) {
          let score = matches;

          if (score > bestScore) {
            bestScore = score;
            bestMatch = company;
          }
        }
      }

      // Only accept if strong confidence
      if (bestScore >= 2 && bestMatch) {
        matchedCompany = bestMatch;
      }
    }

    // =====================================================
    // ✅ FINAL OUTPUT (ONLY IF MATCHED)
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

    // ❌ else: skip completely (NO RANDOM MATCHING)
  }

  return results;
}

module.exports = { matchCompanies };
