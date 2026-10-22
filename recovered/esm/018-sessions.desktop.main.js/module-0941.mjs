// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/common/notebookRange.ts



// src/vs/workbench/contrib/notebook/common/notebookRange.ts
function isICellRange(candidate) {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }
  return typeof candidate.start === "number" && typeof candidate.end === "number";
}

function cellIndexesToRanges(indexes) {
  indexes.sort((a, b) => a - b);
  const first2 = indexes.shift();
  if (first2 === void 0) {
    return [];
  }
  return indexes.reduce(function(ranges, num) {
    if (num <= ranges[0][1]) {
      ranges[0][1] = num + 1;
    } else {
      ranges.unshift([num, num + 1]);
    }
    return ranges;
  }, [[first2, first2 + 1]]).reverse().map((val) => ({ start: val[0], end: val[1] }));
}

function cellRangesToIndexes(ranges) {
  const indexes = ranges.reduce((a, b) => {
    for (let i2 = b.start; i2 < b.end; i2++) {
      a.push(i2);
    }
    return a;
  }, []);
  return indexes;
}

function reduceCellRanges(ranges) {
  const sorted = ranges.sort((a, b) => a.start - b.start);
  const first2 = sorted[0];
  if (!first2) {
    return [];
  }
  const reduced = sorted.reduce((prev, curr) => {
    const last = prev[prev.length - 1];
    if (last.end >= curr.start) {
      last.end = Math.max(last.end, curr.end);
    } else {
      prev.push(curr);
    }
    return prev;
  }, [first2]);
  if (reduced.length > 1) {
    return reduced.filter((range2) => !(range2.start === range2.end && range2.start === 0));
  }
  return reduced;
}

function cellRangesEqual(a, b) {
  a = reduceCellRanges(a);
  b = reduceCellRanges(b);
  if (a.length !== b.length) {
    return false;
  }
  for (let i2 = 0; i2 < a.length; i2++) {
    if (a[i2].start !== b[i2].start || a[i2].end !== b[i2].end) {
      return false;
    }
  }
  return true;
}

function cellRangeContains(range2, other) {
  return other.start >= range2.start && other.end <= range2.end;
}
export { isICellRange, cellIndexesToRanges, cellRangesToIndexes, reduceCellRanges, cellRangesEqual, cellRangeContains };
