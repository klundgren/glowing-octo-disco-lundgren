"use strict";

const createProxiedLogSourceCache = require('./log-source-cache');
const { insertAndMaintainDateOrder } = require('./util/util');

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
      insertAndMaintainDateOrder(logSourcesSortedReverse, logSourceWithEarliestDate);
    }
  }

  printer.done();

  return new Promise((resolve, reject) => {
    resolve(console.log("Async sort complete."));
  });
}
