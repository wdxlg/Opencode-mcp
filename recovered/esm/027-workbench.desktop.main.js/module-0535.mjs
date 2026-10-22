// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/hierarchicalKind.ts



// src/vs/base/common/hierarchicalKind.ts
var HierarchicalKind = class _HierarchicalKind {
  constructor(value2) {
    this.value = value2;
  }
  static {
    this.sep = ".";
  }
  static {
    this.None = new _HierarchicalKind("@@none@@");
  }
  static {
    // Special kind that matches nothing
    this.Empty = new _HierarchicalKind("");
  }
  equals(other) {
    return this.value === other.value;
  }
  contains(other) {
    return this.equals(other) || this.value === "" || other.value.startsWith(this.value + _HierarchicalKind.sep);
  }
  intersects(other) {
    return this.contains(other) || other.contains(this);
  }
  append(...parts) {
    return new _HierarchicalKind((this.value ? [this.value, ...parts] : parts).join(_HierarchicalKind.sep));
  }
};
export { HierarchicalKind };
