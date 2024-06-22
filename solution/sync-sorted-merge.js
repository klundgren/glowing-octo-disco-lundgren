"use strict";

module.exports = (logSources, printer) => {

  logSources.filter(logSource => !logSource.drained).forEach(logSource => logSource.pop());

  let logSourcesSortedReverse = logSources.filter(logSource => !logSource.drained).sort((a, b) => b.last.date - a.last.date);

  while (logSourcesSortedReverse.length > 0) {

    const logSourceWithEarliestDate = logSourcesSortedReverse.pop();

    printer.print(logSourceWithEarliestDate.last);

    logSourceWithEarliestDate.pop();

    if (!logSourceWithEarliestDate.drained) {
      const index = logSourcesSortedReverse.findIndex(logSource => logSource.last.date < logSourceWithEarliestDate.last.date);

      if (index === -1) {
        logSourcesSortedReverse.push(logSourceWithEarliestDate);
      } else {
        logSourcesSortedReverse.splice(index, 0, logSourceWithEarliestDate);
      }
    }
  }

  printer.done();

  return console.log("Sync sort complete.")
}
