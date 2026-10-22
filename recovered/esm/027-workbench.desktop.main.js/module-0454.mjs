// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/list/list.ts



// src/vs/base/browser/ui/list/list.ts
var NotSelectableGroupId = "notSelectable";

var ListError = class extends Error {
  constructor(user, message) {
    super(`ListError [${user}] ${message}`);
  }
};

var CachedListVirtualDelegate = class {
  constructor() {
    this.cache = /* @__PURE__ */ new WeakMap();
  }
  getHeight(element) {
    return this.cache.get(element) ?? this.estimateHeight(element);
  }
  getCachedHeight(element) {
    return this.cache.get(element);
  }
  setDynamicHeight(element, height) {
    if (height > 0) {
      this.cache.set(element, height);
    }
  }
};
export { NotSelectableGroupId, ListError, CachedListVirtualDelegate };
