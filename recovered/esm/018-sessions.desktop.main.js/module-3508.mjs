// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/customViewGridPart.ts
import { Part } from "./module-1563.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { $, size } from "./module-0075.mjs";
import { CustomViewNode } from "./module-3507.mjs";
import { applyAgentsPartCardStyles, getAgentsPartCardContentSize } from "./module-3465.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/sessions/browser/parts/customViewGridPart.ts
var CustomViewGridPart = class extends Part {
  constructor(themeService, storageService, agentWorkbenchLayoutService, instantiationService) {
    super(
      "workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */,
      { hasTitle: false, borderWidth: () => 0 },
      themeService,
      storageService,
      agentWorkbenchLayoutService
    );
    this.agentWorkbenchLayoutService = agentWorkbenchLayoutService;
    this.instantiationService = instantiationService;
    this.minimumWidth = 300;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this.minimumHeight = 0;
    this.maximumHeight = Number.POSITIVE_INFINITY;
    this.priority = 2 /* High */;
    this._node = this._register(new MutableDisposable());
  }
  get snap() {
    return false;
  }
  create(parent) {
    this.element = parent;
    super.create(parent);
  }
  createContentArea(parent) {
    const contentArea = $(".custom-view-grid");
    parent.appendChild(contentArea);
    this._contentArea = contentArea;
    this._renderView();
    return contentArea;
  }
  /** Renders the given custom view, replacing (and disposing) the previous one. */
  setView(descriptor) {
    if (this._descriptor === descriptor) {
      return;
    }
    this._descriptor = descriptor;
    this._renderView();
  }
  _renderView() {
    if (!this._contentArea) {
      return;
    }
    this._node.clear();
    if (!this._descriptor) {
      return;
    }
    const node = this.instantiationService.createInstance(CustomViewNode, this._descriptor);
    this._node.value = node;
    this._contentArea.appendChild(node.element);
    if (this._lastContentSize) {
      this._layoutNode(this._lastContentSize.width, this._lastContentSize.height);
    }
  }
  focus() {
    this._node.value?.focus();
  }
  updateStyles() {
    super.updateStyles();
    applyAgentsPartCardStyles(assertReturnsDefined(this.getContainer()), this.theme);
  }
  layout(width2, height, top2, left) {
    if (!this.layoutService.isVisible("workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */)) {
      return;
    }
    const cardSize = getAgentsPartCardContentSize(width2, height, this.agentWorkbenchLayoutService.isEditorPaneVisible());
    const { contentSize } = this.layoutContents(cardSize.width, cardSize.height);
    this._layoutNode(contentSize.width, contentSize.height);
    super.layout(width2, height, top2, left);
  }
  _layoutNode(width2, height) {
    this._lastContentSize = { width: width2, height };
    const node = this._node.value;
    if (!node) {
      return;
    }
    size(node.element, width2, height);
    node.layout(width2, height);
  }
  toJSON() {
    return {
      type: "workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */
    };
  }
};

CustomViewGridPart = __decorateClass([
  __decorateParam(0, IThemeService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IAgentWorkbenchLayoutService),
  __decorateParam(3, IInstantiationService)
], CustomViewGridPart);
export { CustomViewGridPart };
