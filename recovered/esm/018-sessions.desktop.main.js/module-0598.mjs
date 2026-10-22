// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/navigator.ts



// src/vs/base/common/navigator.ts
var ArrayNavigator = class {
  constructor(items, start = 0, end = items.length, index2 = start - 1) {
    this.items = items;
    this.start = start;
    this.end = end;
    this.index = index2;
  }
  current() {
    if (this.index === this.start - 1 || this.index === this.end) {
      return null;
    }
    return this.items[this.index];
  }
  next() {
    this.index = Math.min(this.index + 1, this.end);
    return this.current();
  }
  previous() {
    this.index = Math.max(this.index - 1, this.start - 1);
    return this.current();
  }
  first() {
    this.index = this.start;
    return this.current();
  }
  last() {
    this.index = this.end - 1;
    return this.current();
  }
};
export { ArrayNavigator };
