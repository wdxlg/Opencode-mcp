// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/splitview/paneview.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, clearNode, getWindow, isHTMLElement, trackFocus } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { Color, RGBA } from "./module-0197.mjs";
import { isFirefox2 } from "./module-0018.mjs";
import { DataTransfers } from "./module-0263.mjs";
import { applyDragImage } from "./module-0458.mjs";
import { Sizing, SplitView } from "./module-0625.mjs";


// src/vs/base/browser/ui/splitview/paneview.ts
var DEFAULT_PANE_HEADER_SIZE = 22;

var globalPaneHeaderSize = DEFAULT_PANE_HEADER_SIZE;

function setGlobalPaneHeaderSize(size3) {
  globalPaneHeaderSize = size3;
}

var Pane = class extends Disposable {
  constructor(options3) {
    super();
    this.expandedSize = void 0;
    this._headerVisible = true;
    this._collapsible = true;
    this._bodyRendered = false;
    this.styles = {
      dropBackground: void 0,
      headerBackground: void 0,
      headerBorder: void 0,
      headerForeground: void 0,
      leftBorder: void 0
    };
    this.animationTimer = void 0;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._onDidChangeExpansionState = this._register(new Emitter());
    this.onDidChangeExpansionState = this._onDidChangeExpansionState.event;
    this.orthogonalSize = 0;
    this._expanded = typeof options3.expanded === "undefined" ? true : !!options3.expanded;
    this._orientation = typeof options3.orientation === "undefined" ? 0 /* VERTICAL */ : options3.orientation;
    this._ariaHeaderLabel = this.getAriaHeaderLabel(options3.title);
    this._minimumBodySize = typeof options3.minimumBodySize === "number" ? options3.minimumBodySize : this._orientation === 1 /* HORIZONTAL */ ? 200 : 120;
    this._maximumBodySize = typeof options3.maximumBodySize === "number" ? options3.maximumBodySize : Number.POSITIVE_INFINITY;
    this.element = $(".pane");
  }
  get ariaHeaderLabel() {
    return this._ariaHeaderLabel;
  }
  set ariaHeaderLabel(newLabel) {
    this._ariaHeaderLabel = newLabel;
    this.header?.setAttribute("aria-label", this.ariaHeaderLabel);
  }
  get draggableElement() {
    return this.header;
  }
  get dropTargetElement() {
    return this.element;
  }
  get dropBackground() {
    return this.styles.dropBackground;
  }
  get minimumBodySize() {
    return this._minimumBodySize;
  }
  set minimumBodySize(size3) {
    this._minimumBodySize = size3;
    this._onDidChange.fire(void 0);
  }
  get maximumBodySize() {
    return this._maximumBodySize;
  }
  set maximumBodySize(size3) {
    this._maximumBodySize = size3;
    this._onDidChange.fire(void 0);
  }
  get headerSize() {
    return this.headerVisible ? globalPaneHeaderSize : 0;
  }
  get minimumSize() {
    const headerSize = this.headerSize;
    const expanded2 = !this.headerVisible || this.isExpanded();
    const minimumBodySize = expanded2 ? this.minimumBodySize : 0;
    return headerSize + minimumBodySize;
  }
  get maximumSize() {
    const headerSize = this.headerSize;
    const expanded2 = !this.headerVisible || this.isExpanded();
    const maximumBodySize = expanded2 ? this.maximumBodySize : 0;
    return headerSize + maximumBodySize;
  }
  getAriaHeaderLabel(title) {
    return localize(31, null, title);
  }
  isExpanded() {
    return this._expanded;
  }
  setExpanded(expanded2) {
    if (!expanded2 && !this.collapsible) {
      return false;
    }
    if (this._expanded === !!expanded2) {
      return false;
    }
    this.element?.classList.toggle("expanded", expanded2);
    this._expanded = !!expanded2;
    this.updateHeader();
    if (expanded2) {
      if (!this._bodyRendered) {
        this.renderBody(this.body);
        this._bodyRendered = true;
      }
      if (typeof this.animationTimer === "number") {
        getWindow(this.element).clearTimeout(this.animationTimer);
      }
      append(this.element, this.body);
    } else {
      this.animationTimer = getWindow(this.element).setTimeout(() => {
        this.body.remove();
      }, 200);
    }
    this._onDidChangeExpansionState.fire(expanded2);
    this._onDidChange.fire(expanded2 ? this.expandedSize : void 0);
    return true;
  }
  get headerVisible() {
    return this._headerVisible;
  }
  set headerVisible(visible) {
    if (this._headerVisible === !!visible) {
      return;
    }
    this._headerVisible = !!visible;
    this.updateHeader();
    this._onDidChange.fire(void 0);
  }
  get collapsible() {
    return this._collapsible;
  }
  set collapsible(collapsible) {
    if (this._collapsible === !!collapsible) {
      return;
    }
    this._collapsible = !!collapsible;
    this.updateHeader();
  }
  get orientation() {
    return this._orientation;
  }
  set orientation(orientation) {
    if (this._orientation === orientation) {
      return;
    }
    this._orientation = orientation;
    if (this.element) {
      this.element.classList.toggle("horizontal", this.orientation === 1 /* HORIZONTAL */);
      this.element.classList.toggle("vertical", this.orientation === 0 /* VERTICAL */);
    }
    if (this.header) {
      this.updateHeader();
    }
  }
  render() {
    this.element.classList.toggle("expanded", this.isExpanded());
    this.element.classList.toggle("horizontal", this.orientation === 1 /* HORIZONTAL */);
    this.element.classList.toggle("vertical", this.orientation === 0 /* VERTICAL */);
    this.header = $(".pane-header");
    append(this.element, this.header);
    this.header.setAttribute("tabindex", "0");
    this.header.setAttribute("role", "button");
    this.header.setAttribute("aria-label", this.ariaHeaderLabel);
    this.renderHeader(this.header);
    const focusTracker = trackFocus(this.header);
    this._register(focusTracker);
    this._register(focusTracker.onDidFocus(() => this.header?.classList.add("focused"), null));
    this._register(focusTracker.onDidBlur(() => this.header?.classList.remove("focused"), null));
    this.updateHeader();
    const eventDisposables = this._register(new DisposableStore());
    const onKeyDown = this._register(new DomEmitter(this.header, "keydown"));
    const onHeaderKeyDown = Event2.map(onKeyDown.event, (e) => new StandardKeyboardEvent(e), eventDisposables);
    this._register(Event2.filter(onHeaderKeyDown, (e) => e.keyCode === 3 /* Enter */ || e.keyCode === 10 /* Space */, eventDisposables)(() => this.setExpanded(!this.isExpanded()), null));
    this._register(Event2.filter(onHeaderKeyDown, (e) => e.keyCode === 15 /* LeftArrow */, eventDisposables)(() => this.setExpanded(false), null));
    this._register(Event2.filter(onHeaderKeyDown, (e) => e.keyCode === 17 /* RightArrow */, eventDisposables)(() => this.setExpanded(true), null));
    this._register(Gesture.addTarget(this.header));
    const header2 = this.header;
    [EventType.CLICK, EventType2.Tap].forEach((eventType) => {
      this._register(addDisposableListener(header2, eventType, (e) => {
        if (!e.defaultPrevented) {
          this.setExpanded(!this.isExpanded());
        }
      }));
    });
    this.body = append(this.element, $(".pane-body"));
    if (!this._bodyRendered && this.isExpanded()) {
      this.renderBody(this.body);
      this._bodyRendered = true;
    }
    if (!this.isExpanded()) {
      this.body.remove();
    }
  }
  layout(size3) {
    const headerSize = this.headerSize;
    const width2 = this._orientation === 0 /* VERTICAL */ ? this.orthogonalSize : size3;
    const height = this._orientation === 0 /* VERTICAL */ ? size3 - headerSize : this.orthogonalSize - headerSize;
    if (this.isExpanded()) {
      this.body.classList.toggle("wide", width2 >= 600);
      this.layoutBody(height, width2);
      this.expandedSize = size3;
    }
  }
  style(styles) {
    this.styles = styles;
    if (!this.header) {
      return;
    }
    this.updateHeader();
  }
  updateHeader() {
    if (!this.header) {
      return;
    }
    const expanded2 = !this.headerVisible || this.isExpanded();
    if (this.collapsible) {
      this.header.setAttribute("tabindex", "0");
      this.header.setAttribute("role", "button");
    } else {
      this.header.removeAttribute("tabindex");
      this.header.removeAttribute("role");
    }
    this.header.classList.toggle("hidden", !this.headerVisible);
    this.header.classList.toggle("expanded", expanded2);
    this.header.classList.toggle("not-collapsible", !this.collapsible);
    this.header.setAttribute("aria-expanded", String(expanded2));
    this.header.style.color = this.collapsible ? this.styles.headerForeground ?? "" : "";
    this.header.style.backgroundColor = (this.collapsible ? this.styles.headerBackground : "transparent") ?? "";
    this.header.style.borderTop = this.styles.headerBorder && this.orientation === 0 /* VERTICAL */ ? `1px solid ${this.styles.headerBorder}` : "";
    this.element.style.borderLeft = this.styles.leftBorder && this.orientation === 1 /* HORIZONTAL */ ? `1px solid ${this.styles.leftBorder}` : "";
  }
};

var PaneDraggable = class _PaneDraggable extends Disposable {
  constructor(pane, dnd, context2) {
    super();
    this.pane = pane;
    this.dnd = dnd;
    this.context = context2;
    this.dragOverCounter = 0;
    // see https://github.com/microsoft/vscode/issues/14470
    this._onDidDrop = this._register(new Emitter());
    this.onDidDrop = this._onDidDrop.event;
    pane.draggableElement.draggable = true;
    this._register(addDisposableListener(pane.draggableElement, "dragstart", (e) => this.onDragStart(e)));
    this._register(addDisposableListener(pane.dropTargetElement, "dragenter", (e) => this.onDragEnter(e)));
    this._register(addDisposableListener(pane.dropTargetElement, "dragleave", (e) => this.onDragLeave(e)));
    this._register(addDisposableListener(pane.dropTargetElement, "dragend", (e) => this.onDragEnd(e)));
    this._register(addDisposableListener(pane.dropTargetElement, "drop", (e) => this.onDrop(e)));
  }
  static {
    this.DefaultDragOverBackgroundColor = new Color(new RGBA(128, 128, 128, 0.5));
  }
  onDragStart(e) {
    if (!this.dnd.canDrag(this.pane) || !e.dataTransfer) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const label3 = this.pane.draggableElement?.textContent || "";
    e.dataTransfer.effectAllowed = "move";
    if (isFirefox2) {
      e.dataTransfer?.setData(DataTransfers.TEXT, label3);
    }
    applyDragImage(e, this.pane.element, label3);
    this.context.draggable = this;
  }
  onDragEnter(e) {
    if (!this.context.draggable || this.context.draggable === this) {
      return;
    }
    if (!this.dnd.canDrop(this.context.draggable.pane, this.pane)) {
      return;
    }
    this.dragOverCounter++;
    this.render();
  }
  onDragLeave(e) {
    if (!this.context.draggable || this.context.draggable === this) {
      return;
    }
    if (!this.dnd.canDrop(this.context.draggable.pane, this.pane)) {
      return;
    }
    this.dragOverCounter--;
    if (this.dragOverCounter === 0) {
      this.render();
    }
  }
  onDragEnd(e) {
    if (!this.context.draggable) {
      return;
    }
    this.dragOverCounter = 0;
    this.render();
    this.context.draggable = null;
  }
  onDrop(e) {
    if (!this.context.draggable) {
      return;
    }
    EventHelper.stop(e);
    this.dragOverCounter = 0;
    this.render();
    if (this.dnd.canDrop(this.context.draggable.pane, this.pane) && this.context.draggable !== this) {
      this._onDidDrop.fire({ from: this.context.draggable.pane, to: this.pane });
    }
    this.context.draggable = null;
  }
  render() {
    let backgroundColor = null;
    if (this.dragOverCounter > 0) {
      backgroundColor = this.pane.dropBackground ?? _PaneDraggable.DefaultDragOverBackgroundColor.toString();
    }
    this.pane.dropTargetElement.style.backgroundColor = backgroundColor || "";
  }
};

var PaneView = class extends Disposable {
  constructor(container3, options3 = {}) {
    super();
    this.dndContext = { draggable: null };
    this.paneItems = [];
    this.orthogonalSize = 0;
    this.size = 0;
    this.animationTimer = void 0;
    this._onDidDrop = this._register(new Emitter());
    this.onDidDrop = this._onDidDrop.event;
    this.dnd = options3.dnd;
    this.orientation = options3.orientation ?? 0 /* VERTICAL */;
    this.element = append(container3, $(".monaco-pane-view"));
    this.splitview = this._register(new SplitView(this.element, { orientation: this.orientation }));
    this.onDidSashReset = this.splitview.onDidSashReset;
    this.onDidSashChange = this.splitview.onDidSashChange;
    this.onDidScroll = this.splitview.onDidScroll;
    const eventDisposables = this._register(new DisposableStore());
    const onKeyDown = this._register(new DomEmitter(this.element, "keydown"));
    const onHeaderKeyDown = Event2.map(Event2.filter(onKeyDown.event, (e) => isHTMLElement(e.target) && e.target.classList.contains("pane-header"), eventDisposables), (e) => new StandardKeyboardEvent(e), eventDisposables);
    this._register(Event2.filter(onHeaderKeyDown, (e) => e.keyCode === 16 /* UpArrow */, eventDisposables)(() => this.focusPrevious()));
    this._register(Event2.filter(onHeaderKeyDown, (e) => e.keyCode === 18 /* DownArrow */, eventDisposables)(() => this.focusNext()));
  }
  addPane(pane, size3, index2 = this.splitview.length) {
    const disposables = new DisposableStore();
    pane.onDidChangeExpansionState(this.setupAnimation, this, disposables);
    const paneItem = { pane, disposable: disposables };
    this.paneItems.splice(index2, 0, paneItem);
    pane.orientation = this.orientation;
    pane.orthogonalSize = this.orthogonalSize;
    this.splitview.addView(pane, size3, index2);
    if (this.dnd) {
      const draggable = new PaneDraggable(pane, this.dnd, this.dndContext);
      disposables.add(draggable);
      disposables.add(draggable.onDidDrop(this._onDidDrop.fire, this._onDidDrop));
    }
  }
  removePane(pane) {
    const index2 = this.paneItems.findIndex((item) => item.pane === pane);
    if (index2 === -1) {
      return;
    }
    this.splitview.removeView(index2, pane.isExpanded() ? Sizing.Distribute : void 0);
    const paneItem = this.paneItems.splice(index2, 1)[0];
    paneItem.disposable.dispose();
  }
  movePane(from, to) {
    const fromIndex = this.paneItems.findIndex((item) => item.pane === from);
    const toIndex = this.paneItems.findIndex((item) => item.pane === to);
    if (fromIndex === -1 || toIndex === -1) {
      return;
    }
    const [paneItem] = this.paneItems.splice(fromIndex, 1);
    this.paneItems.splice(toIndex, 0, paneItem);
    this.splitview.moveView(fromIndex, toIndex);
  }
  resizePane(pane, size3) {
    const index2 = this.paneItems.findIndex((item) => item.pane === pane);
    if (index2 === -1) {
      return;
    }
    this.splitview.resizeView(index2, size3);
  }
  getPaneSize(pane) {
    const index2 = this.paneItems.findIndex((item) => item.pane === pane);
    if (index2 === -1) {
      return -1;
    }
    return this.splitview.getViewSize(index2);
  }
  layout(height, width2) {
    this.orthogonalSize = this.orientation === 0 /* VERTICAL */ ? width2 : height;
    this.size = this.orientation === 1 /* HORIZONTAL */ ? width2 : height;
    for (const paneItem of this.paneItems) {
      paneItem.pane.orthogonalSize = this.orthogonalSize;
    }
    this.splitview.layout(this.size);
  }
  setBoundarySashes(sashes) {
    this.boundarySashes = sashes;
    this.updateSplitviewOrthogonalSashes(sashes);
  }
  updateSplitviewOrthogonalSashes(sashes) {
    if (this.orientation === 0 /* VERTICAL */) {
      this.splitview.orthogonalStartSash = sashes?.left;
      this.splitview.orthogonalEndSash = sashes?.right;
    } else {
      this.splitview.orthogonalEndSash = sashes?.bottom;
    }
  }
  flipOrientation(height, width2) {
    this.orientation = this.orientation === 0 /* VERTICAL */ ? 1 /* HORIZONTAL */ : 0 /* VERTICAL */;
    const paneSizes = this.paneItems.map((pane) => this.getPaneSize(pane.pane));
    this.splitview.dispose();
    clearNode(this.element);
    this.splitview = this._register(new SplitView(this.element, { orientation: this.orientation }));
    this.updateSplitviewOrthogonalSashes(this.boundarySashes);
    const newOrthogonalSize = this.orientation === 0 /* VERTICAL */ ? width2 : height;
    const newSize = this.orientation === 1 /* HORIZONTAL */ ? width2 : height;
    this.paneItems.forEach((pane, index2) => {
      pane.pane.orthogonalSize = newOrthogonalSize;
      pane.pane.orientation = this.orientation;
      const viewSize = this.size === 0 ? 0 : newSize * paneSizes[index2] / this.size;
      this.splitview.addView(pane.pane, viewSize, index2);
    });
    this.size = newSize;
    this.orthogonalSize = newOrthogonalSize;
    this.splitview.layout(this.size);
  }
  setupAnimation() {
    if (typeof this.animationTimer === "number") {
      getWindow(this.element).clearTimeout(this.animationTimer);
    }
    this.element.classList.add("animated");
    this.animationTimer = getWindow(this.element).setTimeout(() => {
      this.animationTimer = void 0;
      this.element.classList.remove("animated");
    }, 200);
  }
  getPaneHeaderElements() {
    return [...this.element.querySelectorAll(".pane-header")];
  }
  focusPrevious() {
    const headers = this.getPaneHeaderElements();
    const index2 = headers.indexOf(this.element.ownerDocument.activeElement);
    if (index2 === -1) {
      return;
    }
    headers[Math.max(index2 - 1, 0)].focus();
  }
  focusNext() {
    const headers = this.getPaneHeaderElements();
    const index2 = headers.indexOf(this.element.ownerDocument.activeElement);
    if (index2 === -1) {
      return;
    }
    headers[Math.min(index2 + 1, headers.length - 1)].focus();
  }
  dispose() {
    super.dispose();
    this.paneItems.forEach((i2) => i2.disposable.dispose());
  }
};
export { setGlobalPaneHeaderSize, DEFAULT_PANE_HEADER_SIZE, globalPaneHeaderSize, Pane, PaneDraggable, PaneView };
