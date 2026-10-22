// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/part.ts
import { Component } from "./module-1086.mjs";
import { Emitter } from "./module-0017.mjs";
import { Dimension, getActiveDocument, prepend, size } from "./module-0075.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { toDisposable } from "./module-0012.mjs";


// src/vs/workbench/browser/part.ts
var Part = class extends Component {
  constructor(id2, options3, themeService, storageService, layoutService) {
    super(id2, themeService, storageService);
    this.options = options3;
    this.layoutService = layoutService;
    this._onDidVisibilityChange = this._register(new Emitter());
    this.onDidVisibilityChange = this._onDidVisibilityChange.event;
    //#region ISerializableView
    this._onDidChange = this._register(new Emitter());
    this._register(layoutService.registerPart(this));
  }
  get dimension() {
    return this._dimension;
  }
  get contentPosition() {
    return this._contentPosition;
  }
  onThemeChange(theme) {
    if (this.parent) {
      super.onThemeChange(theme);
    }
  }
  /**
   * Note: Clients should not call this method, the workbench calls this
   * method. Calling it otherwise may result in unexpected behavior.
   *
   * Called to create title and content area of the part.
   */
  create(parent, options3) {
    this.parent = parent;
    this.titleArea = this.createTitleArea(parent, options3);
    this.contentArea = this.createContentArea(parent, options3);
    this.partLayout = new PartLayout(this.options, this.contentArea, this.layoutService);
    this.updateStyles();
  }
  /**
   * Returns the overall part container.
   */
  getContainer() {
    return this.parent;
  }
  /**
   * Subclasses override to provide a title area implementation.
   */
  createTitleArea(parent, options3) {
    return void 0;
  }
  /**
   * Subclasses override to provide a content area implementation.
   */
  createContentArea(parent, options3) {
    return void 0;
  }
  setHeaderArea(headerContainer) {
    if (this.headerArea) {
      throw new Error("Header already exists");
    }
    if (!this.parent || !this.titleArea) {
      return;
    }
    prepend(this.parent, headerContainer);
    headerContainer.classList.add("header-or-footer");
    headerContainer.classList.add("header");
    this.headerArea = headerContainer;
    this.partLayout?.setHeaderVisibility(true);
    this.relayout();
  }
  setFooterArea(footerContainer) {
    if (this.footerArea) {
      throw new Error("Footer already exists");
    }
    if (!this.parent || !this.titleArea) {
      return;
    }
    this.parent.appendChild(footerContainer);
    footerContainer.classList.add("header-or-footer");
    footerContainer.classList.add("footer");
    this.footerArea = footerContainer;
    this.partLayout?.setFooterVisibility(true);
    this.relayout();
  }
  removeHeaderArea() {
    if (this.headerArea) {
      this.headerArea.remove();
      this.headerArea = void 0;
      this.partLayout?.setHeaderVisibility(false);
      this.relayout();
    }
  }
  removeFooterArea() {
    if (this.footerArea) {
      this.footerArea.remove();
      this.footerArea = void 0;
      this.partLayout?.setFooterVisibility(false);
      this.relayout();
    }
  }
  relayout() {
    const dimension = this.getRelayoutDimension();
    if (dimension && this.contentPosition) {
      this.layout(dimension.width, dimension.height, this.contentPosition.top, this.contentPosition.left);
    }
  }
  /**
   * The dimension to use when the part re-lays out itself in response to internal
   * changes (e.g. title, header or footer visibility). Subclasses that reduce the
   * dimension passed to {@link layout} (for example to reserve space for a floating
   * card margin) must override this to return the original, unreduced dimension so
   * the reduction is not applied repeatedly on every relayout.
   */
  getRelayoutDimension() {
    return this._dimension;
  }
  /**
   * Layout title and content area in the given dimension.
   */
  layoutContents(width2, height) {
    const partLayout = assertReturnsDefined(this.partLayout);
    return partLayout.layout(width2, height);
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  layout(width2, height, top2, left) {
    this._dimension = new Dimension(width2, height);
    this._contentPosition = { top: top2, left };
  }
  setVisible(visible) {
    this._onDidVisibilityChange.fire(visible);
  }
  //#endregion
};

var PartLayout = class _PartLayout {
  constructor(options3, contentArea, layoutService) {
    this.options = options3;
    this.contentArea = contentArea;
    this.layoutService = layoutService;
    this.headerVisible = false;
    this.footerVisible = false;
  }
  static {
    this.HEADER_HEIGHT = 35;
  }
  static {
    this.TITLE_HEIGHT = 35;
  }
  static {
    this.FOOTER_HEIGHT = 35;
  }
  static {
    // KEEP IN SYNC WITH: modernUI/browser/media/padding.css
    this.AREA_HEIGHT_MODERN_UI = 32;
  }
  layout(width2, height) {
    let titleSize;
    if (this.options.hasTitle) {
      const titleHeight = this.layoutService.isFloatingPanelsEnabled() ? _PartLayout.AREA_HEIGHT_MODERN_UI : _PartLayout.TITLE_HEIGHT;
      titleSize = new Dimension(width2, Math.min(height, titleHeight));
    } else {
      titleSize = Dimension.None;
    }
    let headerSize;
    if (this.headerVisible) {
      const headerHeight = this.layoutService.isFloatingPanelsEnabled() ? _PartLayout.AREA_HEIGHT_MODERN_UI : _PartLayout.HEADER_HEIGHT;
      headerSize = new Dimension(width2, Math.min(height, headerHeight));
    } else {
      headerSize = Dimension.None;
    }
    let footerSize;
    if (this.footerVisible) {
      const footerHeight = this.layoutService.isFloatingPanelsEnabled() ? _PartLayout.AREA_HEIGHT_MODERN_UI : _PartLayout.FOOTER_HEIGHT;
      footerSize = new Dimension(width2, Math.min(height, footerHeight));
    } else {
      footerSize = Dimension.None;
    }
    let contentWidth = width2;
    if (this.options && typeof this.options.borderWidth === "function") {
      contentWidth -= this.options.borderWidth();
    }
    const contentSize = new Dimension(contentWidth, height - titleSize.height - headerSize.height - footerSize.height);
    if (this.contentArea) {
      size(this.contentArea, contentSize.width, contentSize.height);
    }
    return { headerSize, titleSize, contentSize, footerSize };
  }
  setFooterVisibility(visible) {
    this.footerVisible = visible;
  }
  setHeaderVisibility(visible) {
    this.headerVisible = visible;
  }
};

var MultiWindowParts = class extends Component {
  constructor() {
    super(...arguments);
    this._parts = /* @__PURE__ */ new Set();
  }
  get parts() {
    return Array.from(this._parts);
  }
  registerPart(part) {
    this._parts.add(part);
    return toDisposable(() => this.unregisterPart(part));
  }
  unregisterPart(part) {
    this._parts.delete(part);
  }
  getPart(container2) {
    return this.getPartByDocument(container2.ownerDocument);
  }
  getPartByDocument(document2) {
    if (this._parts.size > 1) {
      for (const part of this._parts) {
        if (part.element?.ownerDocument === document2) {
          return part;
        }
      }
    }
    return this.mainPart;
  }
  get activePart() {
    return this.getPartByDocument(getActiveDocument());
  }
};
export { Part, PartLayout, MultiWindowParts };
