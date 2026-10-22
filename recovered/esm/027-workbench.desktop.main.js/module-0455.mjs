// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/range.ts



// src/vs/base/common/range.ts
var Range3;

((Range7) => {
  function intersect(one, other) {
    if (one.start >= other.end || other.start >= one.end) {
      return { start: 0, end: 0 };
    }
    const start = Math.max(one.start, other.start);
    const end = Math.min(one.end, other.end);
    if (end - start <= 0) {
      return { start: 0, end: 0 };
    }
    return { start, end };
  }
  Range7.intersect = intersect;
  function isEmpty(range2) {
    return range2.end - range2.start <= 0;
  }
  Range7.isEmpty = isEmpty;
  function intersects4(one, other) {
    return !isEmpty(intersect(one, other));
  }
  Range7.intersects = intersects4;
  function relativeComplement2(one, other) {
    const result = [];
    const first2 = { start: one.start, end: Math.min(other.start, one.end) };
    const second = { start: Math.max(other.end, one.start), end: one.end };
    if (!isEmpty(first2)) {
      result.push(first2);
    }
    if (!isEmpty(second)) {
      result.push(second);
    }
    return result;
  }
  Range7.relativeComplement = relativeComplement2;
})(Range3 || (Range3 = {}));
export { Range3 };
