// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchFindInput.ts
import { ContextScopedFindInput } from "./module-0603.mjs";
import { Emitter } from "./module-0017.mjs";
import { NotebookFindInputFilterButton } from "./module-2426.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/search/browser/searchFindInput.ts
var SearchFindInput = class extends ContextScopedFindInput {
  constructor(container3, contextViewProvider, options3, contextKeyService, contextMenuService, instantiationService, filters2, filterStartVisiblitity) {
    super(container3, contextViewProvider, options3, contextKeyService);
    this.contextMenuService = contextMenuService;
    this.instantiationService = instantiationService;
    this.filters = filters2;
    this._filterChecked = false;
    this._onDidChangeAIToggle = this._register(new Emitter());
    this.onDidChangeAIToggle = this._onDidChangeAIToggle.event;
    this._findFilter = this._register(
      new NotebookFindInputFilterButton(
        filters2,
        contextMenuService,
        instantiationService,
        options3,
        localize(19148, null)
      )
    );
    this._updatePadding();
    this.controls.appendChild(this._findFilter.container);
    this._findFilter.container.classList.add("monaco-custom-toggle");
    this.filterVisible = filterStartVisiblitity;
  }
  _updatePadding() {
    this.inputBox.paddingRight = (this.caseSensitive?.visible ? this.caseSensitive.width() : 0) + (this.wholeWords?.visible ? this.wholeWords.width() : 0) + (this.regex?.visible ? this.regex.width() : 0) + (this._findFilter.visible ? this._findFilter.width() : 0);
  }
  set filterVisible(visible) {
    this._findFilter.visible = visible;
    this.updateFilterStyles();
    this._updatePadding();
  }
  setEnabled(enabled) {
    super.setEnabled(enabled);
    if (enabled && (!this._filterChecked || !this._findFilter.visible)) {
      this.regex?.enable();
    } else {
      this.regex?.disable();
    }
  }
  updateFilterStyles() {
    this._filterChecked = !this.filters.markupInput || !this.filters.markupPreview || !this.filters.codeInput || !this.filters.codeOutput;
    this._findFilter.applyStyles(this._filterChecked);
  }
};
export { SearchFindInput };
