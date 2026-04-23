
const crypto = require('crypto');

function generateId(item) {
  return crypto
    .createHash('md5')
    .update(item.link + item.title)
    .digest('hex');
}

function matchCompanies(items, companyMap, seenSet) {
  const results = [];

  for (const item of items) {
    const id = generateId(item);

    if (seenSet.has(id)) continue;

    const text = (item.title + ' ' + item.description).toUpperCase();
    const tokens = text.match(/\b[A-Z0-9]{3,15}\b/g) || [];

    let matched = null;

    for (const t of tokens) {
      if (companyMap[t]) {
        matched = companyMap[t];
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

