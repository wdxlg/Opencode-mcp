// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/accessibility/browser/unfocusedViewDimmingContribution.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { clamp } from "./module-0040.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/accessibility/browser/unfocusedViewDimmingContribution.ts
var UnfocusedViewDimmingContribution = class extends Disposable {
  constructor(configurationService) {
    super();
    this._styleElementDisposables = void 0;
    this._register(toDisposable(() => this._removeStyleElement()));
    this._register(Event2.runAndSubscribe(configurationService.onDidChangeConfiguration, (e) => {
      if (e && !e.affectsConfiguration("accessibility.dimUnfocused.enabled" /* DimUnfocusedEnabled */) && !e.affectsConfiguration("accessibility.dimUnfocused.opacity" /* DimUnfocusedOpacity */)) {
        return;
      }
      let cssTextContent = "";
      const enabled = ensureBoolean(configurationService.getValue("accessibility.dimUnfocused.enabled" /* DimUnfocusedEnabled */), false);
      if (enabled) {
        const opacity = clamp(
          ensureNumber(configurationService.getValue("accessibility.dimUnfocused.opacity" /* DimUnfocusedOpacity */), 0.75 /* Default */),
          0.2 /* Minimum */,
          1 /* Maximum */
        );
        if (opacity !== 1) {
          const rules = /* @__PURE__ */ new Set();
          const filterRule = `filter: opacity(${opacity});`;
          rules.add(`.monaco-workbench .pane-body.integrated-terminal:not(:focus-within) .tabs-container { ${filterRule} }`);
          rules.add(`.monaco-workbench .pane-body.integrated-terminal .terminal-wrapper:not(:focus-within) { ${filterRule} }`);
          rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .monaco-editor { ${filterRule} }`);
          rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .breadcrumbs-below-tabs { ${filterRule} }`);
          rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .terminal-wrapper { ${filterRule} }`);
          rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .settings-editor { ${filterRule} }`);
          rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .keybindings-editor { ${filterRule} }`);
          rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .monaco-editor-pane-placeholder { ${filterRule} }`);
          rules.add(`.monaco-workbench .editor-instance:not(:focus-within) .gettingStartedContainer { ${filterRule} }`);
          cssTextContent = [...rules].join("\n");
        }
      }
      if (cssTextContent.length === 0) {
        this._removeStyleElement();
      } else {
        this._getStyleElement().textContent = cssTextContent;
      }
    }));
  }
  _getStyleElement() {
    if (!this._styleElement) {
      this._styleElementDisposables = new DisposableStore();
      this._styleElement = createStyleSheet(void 0, void 0, this._styleElementDisposables);
      this._styleElement.className = "accessibilityUnfocusedViewOpacity";
    }
    return this._styleElement;
  }
  _removeStyleElement() {
    this._styleElementDisposables?.dispose();
    this._styleElementDisposables = void 0;
    this._styleElement = void 0;
  }
};

UnfocusedViewDimmingContribution = __decorateClass([
  __decorateParam(0, IConfigurationService)
], UnfocusedViewDimmingContribution);

function ensureBoolean(value2, defaultValue) {
  return typeof value2 === "boolean" ? value2 : defaultValue;
}

function ensureNumber(value2, defaultValue) {
  return typeof value2 === "number" ? value2 : defaultValue;
}
export { ensureBoolean, ensureNumber, UnfocusedViewDimmingContribution };
