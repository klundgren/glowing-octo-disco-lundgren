function insertAndMaintainDateOrder(logSourcesSortedReverseChron, log) {
  const index = logSourcesSortedReverseChron.findIndex(logSource => logSource.last.date < log.last.date);

  if (index === -1) {
    logSourcesSortedReverseChron.push(log);
  } else {
    logSourcesSortedReverseChron.splice(index, 0, log);
  }
}

module.exports = {
  insertAndMaintainDateOrder
}