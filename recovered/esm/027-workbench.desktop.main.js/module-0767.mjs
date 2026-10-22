// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/stickyScroll/browser/stickyScrollElement.ts



// src/vs/editor/contrib/stickyScroll/browser/stickyScrollElement.ts
var StickyRange = class {
  constructor(startLineNumber, endLineNumber) {
    this.startLineNumber = startLineNumber;
    this.endLineNumber = endLineNumber;
  }
};

var StickyElement = class {
  constructor(range2, children, parent) {
    this.range = range2;
    this.children = children;
    this.parent = parent;
  }
};

var StickyModel = class {
  constructor(uri5, version2, element, outlineProviderId) {
    this.uri = uri5;
    this.version = version2;
    this.element = element;
    this.outlineProviderId = outlineProviderId;
  }
};
export { StickyRange, StickyElement, StickyModel };
