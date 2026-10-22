// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/list/splice.ts



// src/vs/base/browser/ui/list/splice.ts
var CombinedSpliceable = class {
  constructor(spliceables) {
    this.spliceables = spliceables;
  }
  splice(start, deleteCount, elements) {
    this.spliceables.forEach((s) => s.splice(start, deleteCount, elements));
  }
};
export { CombinedSpliceable };
