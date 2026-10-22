// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/contentHoverTypes.ts



// src/vs/editor/contrib/hover/browser/contentHoverTypes.ts
var ContentHoverResult = class {
  constructor(hoverParts, isComplete, options3) {
    this.hoverParts = hoverParts;
    this.isComplete = isComplete;
    this.options = options3;
  }
  filter(anchor) {
    const filteredHoverParts = this.hoverParts.filter((m) => m.isValidForHoverAnchor(anchor));
    if (filteredHoverParts.length === this.hoverParts.length) {
      return this;
    }
    return new FilteredContentHoverResult(this, filteredHoverParts, this.isComplete, this.options);
  }
};

var FilteredContentHoverResult = class extends ContentHoverResult {
  constructor(original, messages, isComplete, options3) {
    super(messages, isComplete, options3);
    this.original = original;
  }
  filter(anchor) {
    return this.original.filter(anchor);
  }
};
export { ContentHoverResult, FilteredContentHoverResult };
