// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/list/rangeMap.ts
import { Range3 } from "./module-0455.mjs";


// src/vs/base/browser/ui/list/rangeMap.ts
function groupIntersect(range2, groups) {
  const result = [];
  for (const r2 of groups) {
    if (range2.start >= r2.range.end) {
      continue;
    }
    if (range2.end < r2.range.start) {
      break;
    }
    const intersection2 = Range3.intersect(range2, r2.range);
    if (Range3.isEmpty(intersection2)) {
      continue;
    }
    result.push({
      range: intersection2,
      size: r2.size
    });
  }
  return result;
}

function shift({ start, end }, much) {
  return { start: start + much, end: end + much };
}

function consolidate(groups) {
  const result = [];
  let previousGroup = null;
  for (const group2 of groups) {
    const start = group2.range.start;
    const end = group2.range.end;
    const size3 = group2.size;
    if (previousGroup && size3 === previousGroup.size) {
      previousGroup.range.end = end;
      continue;
    }
    previousGroup = { range: { start, end }, size: size3 };
    result.push(previousGroup);
  }
  return result;
}

function concat3(...groups) {
  return consolidate(groups.reduce((r2, g) => r2.concat(g), []));
}

var RangeMap = class {
  constructor(topPadding) {
    this.groups = [];
    this._size = 0;
    this._paddingTop = 0;
    this._paddingTop = topPadding ?? 0;
    this._size = this._paddingTop;
  }
  get paddingTop() {
    return this._paddingTop;
  }
  set paddingTop(paddingTop) {
    this._size = this._size + paddingTop - this._paddingTop;
    this._paddingTop = paddingTop;
  }
  splice(index2, deleteCount, items = []) {
    const diff4 = items.length - deleteCount;
    const before = groupIntersect({ start: 0, end: index2 }, this.groups);
    const after2 = groupIntersect({ start: index2 + deleteCount, end: Number.POSITIVE_INFINITY }, this.groups).map((g) => ({ range: shift(g.range, diff4), size: g.size }));
    const middle = items.map((item, i2) => ({
      range: { start: index2 + i2, end: index2 + i2 + 1 },
      size: item.size
    }));
    this.groups = concat3(before, middle, after2);
    this._size = this._paddingTop + this.groups.reduce((t2, g) => t2 + g.size * (g.range.end - g.range.start), 0);
  }
  /**
   * Returns the number of items in the range map.
   */
  get count() {
    const len = this.groups.length;
    if (!len) {
      return 0;
    }
    return this.groups[len - 1].range.end;
  }
  /**
   * Returns the sum of the sizes of all items in the range map.
   */
  get size() {
    return this._size;
  }
  /**
   * Returns the index of the item at the given position.
   */
  indexAt(position2) {
    if (position2 < 0) {
      return -1;
    }
    if (position2 < this._paddingTop) {
      return 0;
    }
    let index2 = 0;
    let size3 = this._paddingTop;
    for (const group2 of this.groups) {
      const count2 = group2.range.end - group2.range.start;
      const newSize = size3 + count2 * group2.size;
      if (position2 < newSize) {
        return index2 + Math.floor((position2 - size3) / group2.size);
      }
      index2 += count2;
      size3 = newSize;
    }
    return index2;
  }
  /**
   * Returns the index of the item right after the item at the
   * index of the given position.
   */
  indexAfter(position2) {
    return Math.min(this.indexAt(position2) + 1, this.count);
  }
  /**
   * Returns the start position of the item at the given index.
   */
  positionAt(index2) {
    if (index2 < 0) {
      return -1;
    }
    let position2 = 0;
    let count2 = 0;
    for (const group2 of this.groups) {
      const groupCount = group2.range.end - group2.range.start;
      const newCount = count2 + groupCount;
      if (index2 < newCount) {
        return this._paddingTop + position2 + (index2 - count2) * group2.size;
      }
      position2 += groupCount * group2.size;
      count2 = newCount;
    }
    return -1;
  }
};
export { groupIntersect, shift, consolidate, concat3, RangeMap };
