// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/layout/browser/zIndexRegistry.ts
import { createCSSRule, createStyleSheet } from "./module-0224.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { clearNode } from "./module-0075.mjs";


// src/vs/platform/layout/browser/zIndexRegistry.ts
var ZIndex = /* @__PURE__ */ ((ZIndex2) => {
  ZIndex2[ZIndex2["Base"] = 0] = "Base";
  ZIndex2[ZIndex2["Sash"] = 35] = "Sash";
  ZIndex2[ZIndex2["SuggestWidget"] = 40] = "SuggestWidget";
  ZIndex2[ZIndex2["Hover"] = 50] = "Hover";
  ZIndex2[ZIndex2["DragImage"] = 1e3] = "DragImage";
  ZIndex2[ZIndex2["MenubarMenuItemsHolder"] = 2e3] = "MenubarMenuItemsHolder";
  ZIndex2[ZIndex2["ContextView"] = 2500] = "ContextView";
  ZIndex2[ZIndex2["ModalDialog"] = 2600] = "ModalDialog";
  ZIndex2[ZIndex2["PaneDropOverlay"] = 1e4] = "PaneDropOverlay";
  return ZIndex2;
})(ZIndex || {});

var ZIndexValues = Object.keys(ZIndex).filter((key3) => !isNaN(Number(key3))).map((key3) => Number(key3)).sort((a, b) => b - a);

function findBase(z) {
  for (const zi of ZIndexValues) {
    if (z >= zi) {
      return zi;
    }
  }
  return -1;
}

var ZIndexRegistry = class {
  constructor() {
    this.styleSheet = createStyleSheet();
    this.zIndexMap = /* @__PURE__ */ new Map();
    this.scheduler = new RunOnceScheduler(() => this.updateStyleElement(), 200);
  }
  registerZIndex(relativeLayer, z, name) {
    if (this.zIndexMap.get(name)) {
      throw new Error(`z-index with name ${name} has already been registered.`);
    }
    const proposedZValue = relativeLayer + z;
    if (findBase(proposedZValue) !== relativeLayer) {
      throw new Error(`Relative layer: ${relativeLayer} + z-index: ${z} exceeds next layer ${proposedZValue}.`);
    }
    this.zIndexMap.set(name, proposedZValue);
    this.scheduler.schedule();
    return this.getVarName(name);
  }
  getVarName(name) {
    return `--z-index-${name}`;
  }
  updateStyleElement() {
    clearNode(this.styleSheet);
    let ruleBuilder = "";
    this.zIndexMap.forEach((zIndex, name) => {
      ruleBuilder += `${this.getVarName(name)}: ${zIndex};
`;
    });
    createCSSRule(":root", ruleBuilder, this.styleSheet);
  }
};

var zIndexRegistry = new ZIndexRegistry();

function registerZIndex(relativeLayer, z, name) {
  return zIndexRegistry.registerZIndex(relativeLayer, z, name);
}
export { findBase, registerZIndex, ZIndex, ZIndexValues, ZIndexRegistry, zIndexRegistry };
