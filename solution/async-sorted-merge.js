"use strict";
const createProxiedLogSourceCache = require('./log-source-cache');

module.exports = async (logSources, printer) => {

  const logSourceCaches = [];

  await Promise.all(logSources.map(async logSource => {
    const cache = createProxiedLogSourceCache(logSource);
    logSourceCaches.push(cache);
    await cache.loadBatch();
  }));

  logSourceCaches.filter(logSource => logSource.records.length > 0).forEach(async logSource => await logSource.pop());

  let logSourcesSortedReverse = logSourceCaches.filter(logSource => logSource.records.length > 0).sort((a, b) => b.last.date - a.last.date);

  while (logSourcesSortedReverse.length > 0) {

    const logSourceWithEarliestDate = logSourcesSortedReverse.pop();

    printer.print(logSourceWithEarliestDate.last);

    await logSourceWithEarliestDate.pop();

    if (logSourceWithEarliestDate.records.length > 0) {
      const index = logSourcesSortedReverse.findIndex(logSource => logSource.last.date < logSourceWithEarliestDate.last.date);

      if (index === -1) {
        logSourcesSortedReverse.push(logSourceWithEarliestDate);
      } else {
        logSourcesSortedReverse.splice(index, 0, logSourceWithEarliestDate);
      }
    }
  }

  printer.done();

  return new Promise((resolve, reject) => {
    resolve(console.log("Async sort complete."));
  });
}
