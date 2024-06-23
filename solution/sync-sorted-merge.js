"use strict";

const { insertAndMaintainDateOrder } = require('./util/util');

module.exports = (logSources, printer) => {

  logSources.filter(logSource => !logSource.drained).forEach(logSource => logSource.pop());

  let logSourcesSortedReverse = logSources.filter(logSource => !logSource.drained).sort((a, b) => b.last.date - a.last.date);

  while (logSourcesSortedReverse.length > 0) {

    const logSourceWithEarliestDate = logSourcesSortedReverse.pop();

    printer.print(logSourceWithEarliestDate.last);

    logSourceWithEarliestDate.pop();

    if (!logSourceWithEarliestDate.drained) {
      insertAndMaintainDateOrder(logSourcesSortedReverse, logSourceWithEarliestDate);
    }
  }

  printer.done();

  return console.log("Sync sort complete.")
}
