// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/list/listView.ts
import { distinct, equals, splice } from "./module-0007.mjs";
import { Delayer, disposableTimeout } from "./module-0036.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { RowCache } from "./module-0457.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { Scrollable } from "./module-0099.mjs";
import { addDisposableListener, animate, getActiveElement, getContentHeight, getContentWidth, getDocument, getTopLeftOffset, getWindow, isAncestor, isHTMLElement, isSVGElement, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { SmoothScrollableElement } from "./module-0259.mjs";
import { RangeMap, shift } from "./module-0456.mjs";
import { Range3 } from "./module-0455.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { DataTransfers } from "./module-0263.mjs";
import { applyDragImage } from "./module-0458.mjs";
import { clamp } from "./module-0040.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";


// src/vs/base/browser/ui/list/listView.ts
var StaticDND = {
  CurrentDragAndDropData: void 0
};

var DefaultOptions = {
  useShadows: true,
  verticalScrollMode: 1 /* Auto */,
  setRowLineHeight: true,
  setRowHeight: true,
  supportDynamicHeights: false,
  dnd: {
    getDragElements(e) {
      return [e];
    },
    getDragURI() {
      return null;
    },
    onDragStart() {
    },
    onDragOver() {
      return false;
    },
    drop() {
    },
    dispose() {
    }
  },
  horizontalScrolling: false,
  transformOptimization: true,
  alwaysConsumeMouseWheel: true
};

var ElementsDragAndDropData = class {
  get context() {
    return this._context;
  }
  set context(value2) {
    this._context = value2;
  }
  constructor(elements) {
    this.elements = elements;
  }
  update() {
  }
  getData() {
    return this.elements;
  }
};

var ExternalElementsDragAndDropData = class {
  constructor(elements) {
    this.elements = elements;
  }
  update() {
  }
  getData() {
    return this.elements;
  }
};

var NativeDragAndDropData = class {
  constructor() {
    this.types = [];
    this.files = [];
  }
  update(dataTransfer) {
    if (dataTransfer.types) {
      this.types.splice(0, this.types.length, ...dataTransfer.types);
    }
    if (dataTransfer.files) {
      this.files.splice(0, this.files.length);
      for (let i2 = 0; i2 < dataTransfer.files.length; i2++) {
        const file = dataTransfer.files.item(i2);
        if (file && (file.size || file.type)) {
          this.files.push(file);
        }
      }
    }
  }
  getData() {
    return {
      types: this.types,
      files: this.files
    };
  }
};

function equalsDragFeedback(f1, f2) {
  if (Array.isArray(f1) && Array.isArray(f2)) {
    return equals(f1, f2);
  }
  return f1 === f2;
}

var ListViewAccessibilityProvider = class {
  constructor(accessibilityProvider) {
    if (accessibilityProvider?.getSetSize) {
      this.getSetSize = accessibilityProvider.getSetSize.bind(accessibilityProvider);
    } else {
      this.getSetSize = (e, i2, l) => l;
    }
    if (accessibilityProvider?.getPosInSet) {
      this.getPosInSet = accessibilityProvider.getPosInSet.bind(accessibilityProvider);
    } else {
      this.getPosInSet = (e, i2) => i2 + 1;
    }
    if (accessibilityProvider?.getRole) {
      this.getRole = accessibilityProvider.getRole.bind(accessibilityProvider);
    } else {
      this.getRole = (_) => "listitem";
    }
    if (accessibilityProvider?.isChecked) {
      this.isChecked = accessibilityProvider.isChecked.bind(accessibilityProvider);
    } else {
      this.isChecked = (_) => void 0;
    }
  }
};

var _ListView = class _ListView {
  constructor(container3, virtualDelegate, renderers, options3 = DefaultOptions) {
    this.virtualDelegate = virtualDelegate;
    this.domId = `list_id_${++_ListView.InstanceCount}`;
    this.renderers = /* @__PURE__ */ new Map();
    this.renderWidth = 0;
    this._scrollHeight = 0;
    this.scrollableElementUpdateDisposable = null;
    this.scrollableElementWidthDelayer = new Delayer(50);
    this.splicing = false;
    this.dragOverAnimationStopDisposable = Disposable.None;
    this.dragOverMouseY = 0;
    this.disposables = new DisposableStore();
    this.canDrop = false;
    this.currentDragFeedbackDisposable = Disposable.None;
    this.onDragLeaveTimeout = Disposable.None;
    this.currentSelectionDisposable = this.disposables.add(new MutableDisposable());
    this.currentSelectionMovementDisposable = this.disposables.add(new MutableDisposable());
    this._onDidChangeContentHeight = this.disposables.add(new Emitter());
    this._onDidChangeContentWidth = this.disposables.add(new Emitter());
    this.onDidChangeContentHeight = Event2.latch(this._onDidChangeContentHeight.event, void 0, this.disposables);
    this.onDidChangeContentWidth = Event2.latch(this._onDidChangeContentWidth.event, void 0, this.disposables);
    this._horizontalScrolling = false;
    if (options3.horizontalScrolling && options3.supportDynamicHeights) {
      throw new Error("Horizontal scrolling and dynamic heights not supported simultaneously");
    }
    this.items = [];
    this.itemId = 0;
    this.rangeMap = this.createRangeMap(options3.paddingTop ?? 0);
    for (const renderer of renderers) {
      this.renderers.set(renderer.templateId, renderer);
    }
    this.cache = this.disposables.add(new RowCache(this.renderers));
    this.lastRenderTop = 0;
    this.lastRenderHeight = 0;
    this.domNode = document.createElement("div");
    this.domNode.className = "monaco-list";
    this.domNode.classList.add(this.domId);
    this.domNode.tabIndex = 0;
    this.domNode.classList.toggle("mouse-support", typeof options3.mouseSupport === "boolean" ? options3.mouseSupport : true);
    this._horizontalScrolling = options3.horizontalScrolling ?? DefaultOptions.horizontalScrolling;
    this.domNode.classList.toggle("horizontal-scrolling", this._horizontalScrolling);
    this.paddingBottom = typeof options3.paddingBottom === "undefined" ? 0 : options3.paddingBottom;
    this.accessibilityProvider = new ListViewAccessibilityProvider(options3.accessibilityProvider);
    this.rowsContainer = document.createElement("div");
    this.rowsContainer.className = "monaco-list-rows";
    const transformOptimization = options3.transformOptimization ?? DefaultOptions.transformOptimization;
    if (transformOptimization) {
      this.rowsContainer.style.transform = "translate3d(0px, 0px, 0px)";
      this.rowsContainer.style.overflow = "hidden";
      this.rowsContainer.style.contain = "strict";
    }
    this.disposables.add(Gesture.addTarget(this.rowsContainer));
    this.scrollable = this.disposables.add(new Scrollable({
      forceIntegerValues: true,
      smoothScrollDuration: options3.smoothScrolling ?? false ? 125 : 0,
      scheduleAtNextAnimationFrame: (cb) => scheduleAtNextAnimationFrame(getWindow(this.domNode), cb)
    }));
    this.scrollableElement = this.disposables.add(new SmoothScrollableElement(this.rowsContainer, {
      alwaysConsumeMouseWheel: options3.alwaysConsumeMouseWheel ?? DefaultOptions.alwaysConsumeMouseWheel,
      horizontal: 1 /* Auto */,
      vertical: options3.verticalScrollMode ?? DefaultOptions.verticalScrollMode,
      useShadows: options3.useShadows ?? DefaultOptions.useShadows,
      mouseWheelScrollSensitivity: options3.mouseWheelScrollSensitivity,
      fastScrollSensitivity: options3.fastScrollSensitivity,
      scrollByPage: options3.scrollByPage
    }, this.scrollable));
    this.domNode.appendChild(this.scrollableElement.getDomNode());
    container3.appendChild(this.domNode);
    this.scrollableElement.onScroll(this.onScroll, this, this.disposables);
    this.disposables.add(addDisposableListener(this.rowsContainer, EventType2.Change, (e) => this.onTouchChange(e)));
    this.disposables.add(addDisposableListener(this.scrollableElement.getDomNode(), "scroll", (e) => {
      const element = e.target;
      const scrollValue = element.scrollTop;
      element.scrollTop = 0;
      if (options3.scrollToActiveElement) {
        this.setScrollTop(this.scrollTop + scrollValue);
      }
    }));
    this.disposables.add(addDisposableListener(this.domNode, "dragover", (e) => this.onDragOver(this.toDragEvent(e))));
    this.disposables.add(addDisposableListener(this.domNode, "drop", (e) => this.onDrop(this.toDragEvent(e))));
    this.disposables.add(addDisposableListener(this.domNode, "dragleave", (e) => this.onDragLeave(this.toDragEvent(e))));
    this.disposables.add(addDisposableListener(this.domNode, "dragend", (e) => this.onDragEnd(e)));
    if (options3.userSelection) {
      if (options3.dnd) {
        throw new Error("DND and user selection cannot be used simultaneously");
      }
      this.disposables.add(addDisposableListener(this.domNode, "mousedown", (e) => this.onPotentialSelectionStart(e)));
    }
    this.setRowLineHeight = options3.setRowLineHeight ?? DefaultOptions.setRowLineHeight;
    this.setRowHeight = options3.setRowHeight ?? DefaultOptions.setRowHeight;
    this.supportDynamicHeights = options3.supportDynamicHeights ?? DefaultOptions.supportDynamicHeights;
    this.dnd = options3.dnd ?? this.disposables.add(DefaultOptions.dnd);
    this.layout(options3.initialSize?.height, options3.initialSize?.width);
    if (options3.scrollToActiveElement) {
      this._setupFocusObserver(container3);
    }
  }
  static {
    this.InstanceCount = 0;
  }
  get contentHeight() {
    return this.rangeMap.size;
  }
  get contentWidth() {
    return this.scrollWidth ?? 0;
  }
  get onDidScroll() {
    return this.scrollableElement.onScroll;
  }
  get onWillScroll() {
    return this.scrollableElement.onWillScroll;
  }
  get containerDomNode() {
    return this.rowsContainer;
  }
  get scrollableElementDomNode() {
    return this.scrollableElement.getDomNode();
  }
  get horizontalScrolling() {
    return this._horizontalScrolling;
  }
  set horizontalScrolling(value2) {
    if (value2 === this._horizontalScrolling) {
      return;
    }
    if (value2 && this.supportDynamicHeights) {
      throw new Error("Horizontal scrolling and dynamic heights not supported simultaneously");
    }
    this._horizontalScrolling = value2;
    this.domNode.classList.toggle("horizontal-scrolling", this._horizontalScrolling);
    if (this._horizontalScrolling) {
      this.measureItemWidths(this.items);
      this.updateScrollWidth();
      this.scrollableElement.setScrollDimensions({ width: getContentWidth(this.domNode) });
      this.rowsContainer.style.width = `${Math.max(this.scrollWidth || 0, this.renderWidth)}px`;
    } else {
      this.scrollableElementWidthDelayer.cancel();
      this.scrollableElement.setScrollDimensions({ width: this.renderWidth, scrollWidth: this.renderWidth });
      this.rowsContainer.style.width = "";
      this.domNode.style.removeProperty("--list-scroll-right-offset");
    }
  }
  _setupFocusObserver(container3) {
    this.disposables.add(addDisposableListener(container3, "focus", () => {
      const element = getActiveElement();
      if (this.activeElement !== element && element !== null) {
        this.activeElement = element;
        this._scrollToActiveElement(this.activeElement, container3);
      }
    }, true));
  }
  _scrollToActiveElement(element, container3) {
    const containerRect = container3.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const topOffset = elementRect.top - containerRect.top;
    if (topOffset < 0) {
      this.setScrollTop(this.scrollTop + topOffset);
    }
  }
  updateOptions(options3) {
    if (options3.paddingBottom !== void 0) {
      this.paddingBottom = options3.paddingBottom;
      this.scrollableElement.setScrollDimensions({ scrollHeight: this.scrollHeight });
    }
    if (options3.smoothScrolling !== void 0) {
      this.scrollable.setSmoothScrollDuration(options3.smoothScrolling ? 125 : 0);
    }
    if (options3.horizontalScrolling !== void 0) {
      this.horizontalScrolling = options3.horizontalScrolling;
    }
    let scrollableOptions;
    if (options3.scrollByPage !== void 0) {
      scrollableOptions = { ...scrollableOptions ?? {}, scrollByPage: options3.scrollByPage };
    }
    if (options3.mouseWheelScrollSensitivity !== void 0) {
      scrollableOptions = { ...scrollableOptions ?? {}, mouseWheelScrollSensitivity: options3.mouseWheelScrollSensitivity };
    }
    if (options3.fastScrollSensitivity !== void 0) {
      scrollableOptions = { ...scrollableOptions ?? {}, fastScrollSensitivity: options3.fastScrollSensitivity };
    }
    if (scrollableOptions) {
      this.scrollableElement.updateOptions(scrollableOptions);
    }
    if (options3.paddingTop !== void 0 && options3.paddingTop !== this.rangeMap.paddingTop) {
      const lastRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
      const offset = options3.paddingTop - this.rangeMap.paddingTop;
      this.rangeMap.paddingTop = options3.paddingTop;
      this.render(lastRenderRange, Math.max(0, this.lastRenderTop + offset), this.lastRenderHeight, void 0, void 0, true);
      this.setScrollTop(this.lastRenderTop);
      this.eventuallyUpdateScrollDimensions();
      if (this.supportDynamicHeights) {
        this._rerender(this.lastRenderTop, this.lastRenderHeight);
      }
    }
  }
  delegateScrollFromMouseWheelEvent(browserEvent) {
    this.scrollableElement.delegateScrollFromMouseWheelEvent(browserEvent);
  }
  delegateVerticalScrollbarPointerDown(browserEvent) {
    this.scrollableElement.delegateVerticalScrollbarPointerDown(browserEvent);
  }
  updateElementHeight(index2, size3, anchorIndex) {
    if (index2 < 0 || index2 >= this.items.length) {
      return;
    }
    const originalSize = this.items[index2].size;
    if (typeof size3 === "undefined") {
      if (!this.supportDynamicHeights) {
        console.warn("Dynamic heights not supported", new Error().stack);
        return;
      }
      this.items[index2].lastDynamicHeightWidth = void 0;
      size3 = originalSize + this.probeDynamicHeight(index2);
    }
    if (originalSize === size3) {
      return;
    }
    const lastRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
    let heightDiff2 = 0;
    if (index2 < lastRenderRange.start) {
      heightDiff2 = size3 - originalSize;
    } else {
      if (anchorIndex !== null && anchorIndex > index2 && anchorIndex < lastRenderRange.end) {
        heightDiff2 = size3 - originalSize;
      } else {
        heightDiff2 = 0;
      }
    }
    this.rangeMap.splice(index2, 1, [{ size: size3 }]);
    this.items[index2].size = size3;
    this.render(lastRenderRange, Math.max(0, this.lastRenderTop + heightDiff2), this.lastRenderHeight, void 0, void 0, true);
    this.setScrollTop(this.lastRenderTop);
    this.eventuallyUpdateScrollDimensions();
    if (this.supportDynamicHeights) {
      this._rerender(this.lastRenderTop, this.lastRenderHeight);
    } else {
      this._onDidChangeContentHeight.fire(this.contentHeight);
    }
  }
  createRangeMap(paddingTop) {
    return new RangeMap(paddingTop);
  }
  splice(start, deleteCount, elements = []) {
    if (this.splicing) {
      throw new Error("Can't run recursive splices.");
    }
    this.splicing = true;
    try {
      return this._splice(start, deleteCount, elements);
    } finally {
      this.splicing = false;
      this._onDidChangeContentHeight.fire(this.contentHeight);
    }
  }
  _splice(start, deleteCount, elements = []) {
    const previousRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
    const deleteRange = { start, end: start + deleteCount };
    const removeRange = Range3.intersect(previousRenderRange, deleteRange);
    const rowsToDispose = /* @__PURE__ */ new Map();
    for (let i2 = removeRange.end - 1; i2 >= removeRange.start; i2--) {
      const item = this.items[i2];
      item.dragStartDisposable.dispose();
      item.checkedDisposable.dispose();
      if (item.row) {
        let rows = rowsToDispose.get(item.templateId);
        if (!rows) {
          rows = [];
          rowsToDispose.set(item.templateId, rows);
        }
        const renderer = this.renderers.get(item.templateId);
        if (renderer && renderer.disposeElement) {
          renderer.disposeElement(item.element, i2, item.row.templateData, { height: item.size });
        }
        rows.unshift(item.row);
      }
      item.row = null;
      item.stale = true;
    }
    const previousRestRange = { start: start + deleteCount, end: this.items.length };
    const previousRenderedRestRange = Range3.intersect(previousRestRange, previousRenderRange);
    const previousUnrenderedRestRanges = Range3.relativeComplement(previousRestRange, previousRenderRange);
    const inserted = elements.map((element) => ({
      id: String(this.itemId++),
      element,
      templateId: this.virtualDelegate.getTemplateId(element),
      size: this.virtualDelegate.getHeight(element),
      width: void 0,
      hasDynamicHeight: !!this.virtualDelegate.hasDynamicHeight && this.virtualDelegate.hasDynamicHeight(element),
      lastDynamicHeightWidth: void 0,
      row: null,
      uri: void 0,
      dropTarget: false,
      dragStartDisposable: Disposable.None,
      checkedDisposable: Disposable.None,
      stale: false
    }));
    let deleted;
    if (start === 0 && deleteCount >= this.items.length) {
      this.rangeMap = this.createRangeMap(this.rangeMap.paddingTop);
      this.rangeMap.splice(0, 0, inserted);
      deleted = this.items;
      this.items = inserted;
    } else {
      this.rangeMap.splice(start, deleteCount, inserted);
      deleted = splice(this.items, start, deleteCount, inserted);
    }
    const delta2 = elements.length - deleteCount;
    const renderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
    const renderedRestRange = shift(previousRenderedRestRange, delta2);
    const updateRange = Range3.intersect(renderRange, renderedRestRange);
    for (let i2 = updateRange.start; i2 < updateRange.end; i2++) {
      if (this.items[i2].row) {
        this.updateItemInDOM(this.items[i2], i2);
      }
    }
    const removeRanges = Range3.relativeComplement(renderedRestRange, renderRange);
    for (const range2 of removeRanges) {
      for (let i2 = range2.start; i2 < range2.end; i2++) {
        this.removeItemFromDOM(i2);
      }
    }
    const unrenderedRestRanges = previousUnrenderedRestRanges.map((r2) => shift(r2, delta2));
    const elementsRange = { start, end: start + elements.length };
    const insertRanges = [elementsRange, ...unrenderedRestRanges].map((r2) => Range3.intersect(renderRange, r2)).reverse();
    const insertedItems = [];
    for (const range2 of insertRanges) {
      for (let i2 = range2.end - 1; i2 >= range2.start; i2--) {
        const item = this.items[i2];
        const rows = rowsToDispose.get(item.templateId);
        const row = rows?.pop();
        this.insertItemInDOM(i2, row);
        insertedItems.push(item);
      }
    }
    for (const rows of rowsToDispose.values()) {
      for (const row of rows) {
        this.cache.release(row);
      }
    }
    if (this.horizontalScrolling && insertedItems.length > 0) {
      this.measureItemWidths(insertedItems);
      this.eventuallyUpdateScrollWidth();
    }
    this.eventuallyUpdateScrollDimensions();
    if (this.supportDynamicHeights) {
      this._rerender(this.scrollTop, this.renderHeight);
    }
    return deleted.map((i2) => i2.element);
  }
  eventuallyUpdateScrollDimensions() {
    this._scrollHeight = this.contentHeight;
    this.rowsContainer.style.height = `${this._scrollHeight}px`;
    if (!this.scrollableElementUpdateDisposable) {
      this.scrollableElementUpdateDisposable = scheduleAtNextAnimationFrame(getWindow(this.domNode), () => {
        this.scrollableElement.setScrollDimensions({ scrollHeight: this.scrollHeight });
        this.updateScrollWidth();
        this.scrollableElementUpdateDisposable = null;
      });
    }
  }
  eventuallyUpdateScrollWidth() {
    if (!this.horizontalScrolling) {
      this.scrollableElementWidthDelayer.cancel();
      return;
    }
    this.scrollableElementWidthDelayer.trigger(() => this.updateScrollWidth());
  }
  updateScrollWidth() {
    if (!this.horizontalScrolling) {
      return;
    }
    let scrollWidth = 0;
    for (const item of this.items) {
      if (typeof item.width !== "undefined") {
        scrollWidth = Math.max(scrollWidth, item.width);
      }
    }
    this.scrollWidth = scrollWidth;
    this.scrollableElement.setScrollDimensions({ scrollWidth: scrollWidth === 0 ? 0 : scrollWidth + 10 });
    this._onDidChangeContentWidth.fire(this.scrollWidth);
  }
  updateWidth(index2) {
    if (!this.horizontalScrolling || typeof this.scrollWidth === "undefined") {
      return;
    }
    const item = this.items[index2];
    this.measureItemWidths([item]);
    if (typeof item.width !== "undefined" && item.width > this.scrollWidth) {
      this.scrollWidth = item.width;
      this.scrollableElement.setScrollDimensions({ scrollWidth: this.scrollWidth + 10 });
      this._onDidChangeContentWidth.fire(this.scrollWidth);
    }
  }
  rerender() {
    if (!this.supportDynamicHeights) {
      return;
    }
    for (const item of this.items) {
      item.lastDynamicHeightWidth = void 0;
    }
    this._rerender(this.lastRenderTop, this.lastRenderHeight);
  }
  get length() {
    return this.items.length;
  }
  get renderHeight() {
    const scrollDimensions = this.scrollableElement.getScrollDimensions();
    return scrollDimensions.height;
  }
  get firstVisibleIndex() {
    const range2 = this.getVisibleRange(this.lastRenderTop, this.lastRenderHeight);
    return range2.start;
  }
  get firstMostlyVisibleIndex() {
    const firstVisibleIndex = this.firstVisibleIndex;
    const firstElTop = this.rangeMap.positionAt(firstVisibleIndex);
    const nextElTop = this.rangeMap.positionAt(firstVisibleIndex + 1);
    if (nextElTop !== -1) {
      const firstElMidpoint = (nextElTop - firstElTop) / 2 + firstElTop;
      if (firstElMidpoint < this.scrollTop) {
        return firstVisibleIndex + 1;
      }
    }
    return firstVisibleIndex;
  }
  get lastVisibleIndex() {
    const range2 = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
    return range2.end - 1;
  }
  element(index2) {
    return this.items[index2].element;
  }
  indexOf(element) {
    return this.items.findIndex((item) => item.element === element);
  }
  domElement(index2) {
    const row = this.items[index2].row;
    return row && row.domNode;
  }
  elementHeight(index2) {
    return this.items[index2].size;
  }
  elementTop(index2) {
    return this.rangeMap.positionAt(index2);
  }
  indexAt(position2) {
    return this.rangeMap.indexAt(position2);
  }
  indexAfter(position2) {
    return this.rangeMap.indexAfter(position2);
  }
  layout(height, width2) {
    const scrollDimensions = {
      height: typeof height === "number" ? height : getContentHeight(this.domNode)
    };
    if (this.scrollableElementUpdateDisposable) {
      this.scrollableElementUpdateDisposable.dispose();
      this.scrollableElementUpdateDisposable = null;
      scrollDimensions.scrollHeight = this.scrollHeight;
    }
    this.scrollableElement.setScrollDimensions(scrollDimensions);
    if (typeof width2 !== "undefined") {
      this.renderWidth = width2;
      if (this.supportDynamicHeights) {
        this._rerender(this.scrollTop, this.renderHeight);
      }
    }
    if (this.horizontalScrolling) {
      this.scrollableElement.setScrollDimensions({
        width: typeof width2 === "number" ? width2 : getContentWidth(this.domNode)
      });
      const scrollPos = this.scrollableElement.getScrollPosition();
      const scrollDims = this.scrollableElement.getScrollDimensions();
      const rightOffset = Math.max(0, scrollDims.scrollWidth - scrollPos.scrollLeft - this.renderWidth);
      this.domNode.style.setProperty("--list-scroll-right-offset", `${Math.max(rightOffset - 12, 0)}px`);
    }
  }
  // Render
  render(previousRenderRange, renderTop, renderHeight, renderLeft, scrollWidth, updateItemsInDOM = false, onScroll = false) {
    const renderRange = this.getRenderRange(renderTop, renderHeight);
    const rangesToInsert = Range3.relativeComplement(renderRange, previousRenderRange).reverse();
    const rangesToRemove = Range3.relativeComplement(previousRenderRange, renderRange);
    if (updateItemsInDOM) {
      const rangesToUpdate = Range3.intersect(previousRenderRange, renderRange);
      for (let i2 = rangesToUpdate.start; i2 < rangesToUpdate.end; i2++) {
        this.updateItemInDOM(this.items[i2], i2);
      }
    }
    const insertedItems = [];
    this.cache.transact(() => {
      for (const range2 of rangesToRemove) {
        for (let i2 = range2.start; i2 < range2.end; i2++) {
          this.removeItemFromDOM(i2, onScroll);
        }
      }
      for (const range2 of rangesToInsert) {
        for (let i2 = range2.end - 1; i2 >= range2.start; i2--) {
          this.insertItemInDOM(i2);
          insertedItems.push(this.items[i2]);
        }
      }
    });
    if (this.horizontalScrolling && insertedItems.length > 0) {
      this.measureItemWidths(insertedItems);
      this.eventuallyUpdateScrollWidth();
    }
    if (renderLeft !== void 0) {
      this.rowsContainer.style.left = `-${renderLeft}px`;
    }
    this.rowsContainer.style.top = `-${renderTop}px`;
    if (this.horizontalScrolling && scrollWidth !== void 0) {
      this.rowsContainer.style.width = `${Math.max(scrollWidth, this.renderWidth)}px`;
      const rightOffset = Math.max(0, scrollWidth - (renderLeft ?? 0) - this.renderWidth);
      this.domNode.style.setProperty("--list-scroll-right-offset", `${Math.max(rightOffset - 12, 0)}px`);
    }
    this.lastRenderTop = renderTop;
    this.lastRenderHeight = renderHeight;
  }
  // DOM operations
  insertItemInDOM(index2, row, alreadyRendered = false) {
    const item = this.items[index2];
    if (!item.row) {
      if (row) {
        item.row = row;
        item.stale = true;
      } else {
        const result = this.cache.alloc(item.templateId);
        item.row = result.row;
        item.stale ||= result.isReusingConnectedDomNode;
      }
    }
    const role = this.accessibilityProvider.getRole(item.element) || "listitem";
    item.row.domNode.setAttribute("role", role);
    const checked = this.accessibilityProvider.isChecked(item.element);
    const toAriaState = (value2) => value2 === "mixed" ? "mixed" : String(!!value2);
    if (typeof checked === "boolean" || checked === "mixed") {
      item.row.domNode.setAttribute("aria-checked", toAriaState(checked));
    } else if (checked) {
      const update = (value2) => item.row.domNode.setAttribute("aria-checked", toAriaState(value2));
      update(checked.value);
      item.checkedDisposable = checked.onDidChange(() => update(checked.value));
    }
    if (item.stale || !item.row.domNode.parentElement) {
      const referenceNode = this.items.at(index2 + 1)?.row?.domNode ?? null;
      if (item.row.domNode.parentElement !== this.rowsContainer || item.row.domNode.nextElementSibling !== referenceNode) {
        this.rowsContainer.insertBefore(item.row.domNode, referenceNode);
      }
      item.stale = false;
    }
    this.updateItemInDOM(item, index2);
    const renderer = this.renderers.get(item.templateId);
    if (!renderer) {
      throw new Error(`No renderer found for template id ${item.templateId}`);
    }
    if (!alreadyRendered) {
      renderer.renderElement(item.element, index2, item.row.templateData, { height: item.size });
    }
    const uri5 = this.dnd.getDragURI(item.element);
    item.dragStartDisposable.dispose();
    item.row.domNode.draggable = !!uri5;
    if (uri5) {
      item.dragStartDisposable = addDisposableListener(item.row.domNode, "dragstart", (event) => this.onDragStart(item.element, uri5, event));
    }
  }
  measureItemWidths(items) {
    const itemsWithRows = [];
    for (const item of items) {
      if (item.row) {
        itemsWithRows.push({ item, domNode: item.row.domNode });
      }
    }
    for (const { domNode } of itemsWithRows) {
      domNode.style.width = "fit-content";
    }
    for (const { item, domNode } of itemsWithRows) {
      item.width = getContentWidth(domNode);
      const style = getWindow(domNode).getComputedStyle(domNode);
      if (style.paddingLeft) {
        item.width += parseFloat(style.paddingLeft);
      }
      if (style.paddingRight) {
        item.width += parseFloat(style.paddingRight);
      }
    }
    for (const { domNode } of itemsWithRows) {
      domNode.style.width = "";
    }
  }
  updateItemInDOM(item, index2) {
    item.row.domNode.style.top = `${this.elementTop(index2)}px`;
    if (this.setRowHeight) {
      item.row.domNode.style.height = `${item.size}px`;
    }
    if (this.setRowLineHeight) {
      item.row.domNode.style.lineHeight = `${item.size}px`;
    }
    item.row.domNode.setAttribute("data-index", `${index2}`);
    item.row.domNode.setAttribute("data-last-element", index2 === this.length - 1 ? "true" : "false");
    item.row.domNode.setAttribute("data-parity", index2 % 2 === 0 ? "even" : "odd");
    item.row.domNode.setAttribute("aria-setsize", String(this.accessibilityProvider.getSetSize(item.element, index2, this.length)));
    item.row.domNode.setAttribute("aria-posinset", String(this.accessibilityProvider.getPosInSet(item.element, index2)));
    item.row.domNode.setAttribute("id", this.getElementDomId(index2));
    item.row.domNode.classList.toggle("drop-target", item.dropTarget);
  }
  removeItemFromDOM(index2, onScroll) {
    const item = this.items[index2];
    item.dragStartDisposable.dispose();
    item.checkedDisposable.dispose();
    if (item.row) {
      const renderer = this.renderers.get(item.templateId);
      if (renderer && renderer.disposeElement) {
        renderer.disposeElement(item.element, index2, item.row.templateData, { height: item.size, onScroll });
      }
      this.cache.release(item.row);
      item.row = null;
    }
    if (this.horizontalScrolling) {
      this.eventuallyUpdateScrollWidth();
    }
  }
  getScrollTop() {
    const scrollPosition = this.scrollableElement.getScrollPosition();
    return scrollPosition.scrollTop;
  }
  setScrollTop(scrollTop, reuseAnimation) {
    if (this.scrollableElementUpdateDisposable) {
      this.scrollableElementUpdateDisposable.dispose();
      this.scrollableElementUpdateDisposable = null;
      this.scrollableElement.setScrollDimensions({ scrollHeight: this.scrollHeight });
    }
    this.scrollableElement.setScrollPosition({ scrollTop, reuseAnimation });
  }
  getScrollLeft() {
    const scrollPosition = this.scrollableElement.getScrollPosition();
    return scrollPosition.scrollLeft;
  }
  setScrollLeft(scrollLeft) {
    if (this.scrollableElementUpdateDisposable) {
      this.scrollableElementUpdateDisposable.dispose();
      this.scrollableElementUpdateDisposable = null;
      this.scrollableElement.setScrollDimensions({ scrollWidth: this.scrollWidth });
    }
    this.scrollableElement.setScrollPosition({ scrollLeft });
  }
  get scrollTop() {
    return this.getScrollTop();
  }
  set scrollTop(scrollTop) {
    this.setScrollTop(scrollTop);
  }
  get scrollHeight() {
    return this._scrollHeight + (this.horizontalScrolling ? 10 : 0) + this.paddingBottom;
  }
  get onMouseClick() {
    return Event2.map(this.disposables.add(new DomEmitter(this.domNode, "click")).event, (e) => this.toMouseEvent(e), this.disposables);
  }
  get onMouseDblClick() {
    return Event2.map(this.disposables.add(new DomEmitter(this.domNode, "dblclick")).event, (e) => this.toMouseEvent(e), this.disposables);
  }
  get onMouseMiddleClick() {
    return Event2.filter(Event2.map(this.disposables.add(new DomEmitter(this.domNode, "auxclick")).event, (e) => this.toMouseEvent(e), this.disposables), (e) => e.browserEvent.button === 1, this.disposables);
  }
  get onMouseUp() {
    return Event2.map(this.disposables.add(new DomEmitter(this.domNode, "mouseup")).event, (e) => this.toMouseEvent(e), this.disposables);
  }
  get onMouseDown() {
    return Event2.map(this.disposables.add(new DomEmitter(this.domNode, "mousedown")).event, (e) => this.toMouseEvent(e), this.disposables);
  }
  get onMouseOver() {
    return Event2.map(this.disposables.add(new DomEmitter(this.domNode, "mouseover")).event, (e) => this.toMouseEvent(e), this.disposables);
  }
  get onMouseMove() {
    return Event2.map(this.disposables.add(new DomEmitter(this.domNode, "mousemove")).event, (e) => this.toMouseEvent(e), this.disposables);
  }
  get onMouseOut() {
    return Event2.map(this.disposables.add(new DomEmitter(this.domNode, "mouseout")).event, (e) => this.toMouseEvent(e), this.disposables);
  }
  get onContextMenu() {
    return Event2.any(Event2.map(this.disposables.add(new DomEmitter(this.domNode, "contextmenu")).event, (e) => this.toMouseEvent(e), this.disposables), Event2.map(this.disposables.add(new DomEmitter(this.domNode, EventType2.Contextmenu)).event, (e) => this.toGestureEvent(e), this.disposables));
  }
  get onTouchStart() {
    return Event2.map(this.disposables.add(new DomEmitter(this.domNode, "touchstart")).event, (e) => this.toTouchEvent(e), this.disposables);
  }
  get onTap() {
    return Event2.map(this.disposables.add(new DomEmitter(this.rowsContainer, EventType2.Tap)).event, (e) => this.toGestureEvent(e), this.disposables);
  }
  toMouseEvent(browserEvent) {
    const index2 = this.getItemIndexFromEventTarget(browserEvent.target || null);
    const item = typeof index2 === "undefined" ? void 0 : this.items[index2];
    const element = item && item.element;
    return { browserEvent, index: index2, element };
  }
  toTouchEvent(browserEvent) {
    const index2 = this.getItemIndexFromEventTarget(browserEvent.target || null);
    const item = typeof index2 === "undefined" ? void 0 : this.items[index2];
    const element = item && item.element;
    return { browserEvent, index: index2, element };
  }
  toGestureEvent(browserEvent) {
    const index2 = this.getItemIndexFromEventTarget(browserEvent.initialTarget || null);
    const item = typeof index2 === "undefined" ? void 0 : this.items[index2];
    const element = item && item.element;
    return { browserEvent, index: index2, element };
  }
  toDragEvent(browserEvent) {
    const index2 = this.getItemIndexFromEventTarget(browserEvent.target || null);
    const item = typeof index2 === "undefined" ? void 0 : this.items[index2];
    const element = item && item.element;
    const sector = this.getTargetSector(browserEvent, index2);
    return { browserEvent, index: index2, element, sector };
  }
  onScroll(e) {
    try {
      const previousRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
      this.render(previousRenderRange, e.scrollTop, e.height, e.scrollLeft, e.scrollWidth, void 0, true);
      if (this.supportDynamicHeights) {
        this._rerender(e.scrollTop, e.height, e.inSmoothScrolling);
      }
    } catch (err) {
      console.error("Got bad scroll event:", e);
      throw err;
    }
  }
  onTouchChange(event) {
    event.preventDefault();
    event.stopPropagation();
    this.scrollTop -= event.translationY;
  }
  // DND
  onDragStart(element, uri5, event) {
    if (!event.dataTransfer) {
      return;
    }
    const elements = this.dnd.getDragElements(element);
    event.dataTransfer.effectAllowed = "copyMove";
    event.dataTransfer.setData(DataTransfers.TEXT, uri5);
    let label3;
    if (this.dnd.getDragLabel) {
      label3 = this.dnd.getDragLabel(elements, event);
    }
    if (typeof label3 === "undefined") {
      label3 = String(elements.length);
    }
    applyDragImage(event, this.domNode, label3, [
      this.domId
      /* add domId to get list specific styling */
    ]);
    this.domNode.classList.add("dragging");
    this.currentDragData = new ElementsDragAndDropData(elements);
    StaticDND.CurrentDragAndDropData = new ExternalElementsDragAndDropData(elements);
    this.dnd.onDragStart?.(this.currentDragData, event);
  }
  onPotentialSelectionStart(e) {
    const doc = getDocument(this.domNode);
    this.currentSelectionMovementDisposable.clear();
    if (e.shiftKey && this.currentSelectionBounds && doc.getSelection()?.isCollapsed === false) {
      this.currentSelectionMovementDisposable.value = this.createSelectionMovementStore(doc);
      return;
    }
    this.currentSelectionDisposable.clear();
    const selectionStore = new DisposableStore();
    this.currentSelectionDisposable.value = selectionStore;
    this.currentSelectionMovementDisposable.value = this.createSelectionMovementStore(doc);
    selectionStore.add(toDisposable(() => {
      this.currentSelectionMovementDisposable.clear();
      const previousRenderRange = this.getRenderRange(this.lastRenderTop, this.lastRenderHeight);
      this.currentSelectionBounds = void 0;
      this.render(previousRenderRange, this.lastRenderTop, this.lastRenderHeight, void 0, void 0);
    }));
    selectionStore.add(addDisposableListener(doc, "selectionchange", () => {
      const selection = doc.getSelection();
      if (!selection || selection.isCollapsed) {
        if (!this.currentSelectionMovementDisposable.value) {
          this.currentSelectionDisposable.clear();
        }
        return;
      }
      let start = this.getIndexOfListElement(selection.anchorNode);
      let end = this.getIndexOfListElement(selection.focusNode);
      if (start !== void 0 && end !== void 0) {
        if (end < start) {
          [start, end] = [end, start];
        }
        this.currentSelectionBounds = { start, end };
      }
    }));
  }
  createSelectionMovementStore(doc) {
    const movementStore = new DisposableStore();
    movementStore.add(addDisposableListener(this.domNode, "selectstart", () => {
      movementStore.add(addDisposableListener(doc, "mousemove", (e) => {
        if (doc.getSelection()?.isCollapsed === false) {
          this.setupDragAndDropScrollTopAnimation(e);
        }
      }));
    }));
    movementStore.add(addDisposableListener(doc, "mouseup", () => {
      this.currentSelectionMovementDisposable.clear();
      this.teardownDragAndDropScrollTopAnimation();
      if (doc.getSelection()?.isCollapsed !== false) {
        this.currentSelectionDisposable.clear();
      }
    }));
    return movementStore;
  }
  getIndexOfListElement(element) {
    if (!element || !this.domNode.contains(element)) {
      return void 0;
    }
    while (element && element !== this.domNode) {
      if (element.dataset?.index) {
        return Number(element.dataset.index);
      }
      element = element.parentElement;
    }
    return void 0;
  }
  onDragOver(event) {
    event.browserEvent.preventDefault();
    this.onDragLeaveTimeout.dispose();
    if (StaticDND.CurrentDragAndDropData && StaticDND.CurrentDragAndDropData.getData() === "vscode-ui") {
      return false;
    }
    this.setupDragAndDropScrollTopAnimation(event.browserEvent);
    if (!event.browserEvent.dataTransfer) {
      return false;
    }
    if (!this.currentDragData) {
      if (StaticDND.CurrentDragAndDropData) {
        this.currentDragData = StaticDND.CurrentDragAndDropData;
      } else {
        if (!event.browserEvent.dataTransfer.types) {
          return false;
        }
        this.currentDragData = new NativeDragAndDropData();
      }
    }
    const result = this.dnd.onDragOver(this.currentDragData, event.element, event.index, event.sector, event.browserEvent);
    this.canDrop = typeof result === "boolean" ? result : result.accept;
    if (!this.canDrop) {
      this.currentDragFeedback = void 0;
      this.currentDragFeedbackDisposable.dispose();
      return false;
    }
    event.browserEvent.dataTransfer.dropEffect = typeof result !== "boolean" && result.effect?.type === 0 /* Copy */ ? "copy" : "move";
    let feedback;
    if (typeof result !== "boolean" && result.feedback) {
      feedback = result.feedback;
    } else {
      if (typeof event.index === "undefined") {
        feedback = [-1];
      } else {
        feedback = [event.index];
      }
    }
    feedback = distinct(feedback).filter((i2) => i2 >= -1 && i2 < this.length).sort((a, b) => a - b);
    feedback = feedback[0] === -1 ? [-1] : feedback;
    let dragOverEffectPosition = typeof result !== "boolean" && result.effect && result.effect.position ? result.effect.position : "drop-target" /* Over */;
    if (equalsDragFeedback(this.currentDragFeedback, feedback) && this.currentDragFeedbackPosition === dragOverEffectPosition) {
      return true;
    }
    this.currentDragFeedback = feedback;
    this.currentDragFeedbackPosition = dragOverEffectPosition;
    this.currentDragFeedbackDisposable.dispose();
    if (feedback[0] === -1) {
      this.domNode.classList.add(dragOverEffectPosition);
      this.rowsContainer.classList.add(dragOverEffectPosition);
      this.currentDragFeedbackDisposable = toDisposable(() => {
        this.domNode.classList.remove(dragOverEffectPosition);
        this.rowsContainer.classList.remove(dragOverEffectPosition);
      });
    } else {
      if (feedback.length > 1 && dragOverEffectPosition !== "drop-target" /* Over */) {
        throw new Error("Can't use multiple feedbacks with position different than 'over'");
      }
      if (dragOverEffectPosition === "drop-target-after" /* After */) {
        if (feedback[0] < this.length - 1) {
          feedback[0] += 1;
          dragOverEffectPosition = "drop-target-before" /* Before */;
        }
      }
      for (const index2 of feedback) {
        const item = this.items[index2];
        item.dropTarget = true;
        item.row?.domNode.classList.add(dragOverEffectPosition);
      }
      this.currentDragFeedbackDisposable = toDisposable(() => {
        for (const index2 of feedback) {
          const item = this.items[index2];
          item.dropTarget = false;
          item.row?.domNode.classList.remove(dragOverEffectPosition);
        }
      });
    }
    return true;
  }
  onDragLeave(event) {
    this.onDragLeaveTimeout.dispose();
    this.onDragLeaveTimeout = disposableTimeout(() => this.clearDragOverFeedback(), 100, this.disposables);
    if (this.currentDragData) {
      this.dnd.onDragLeave?.(this.currentDragData, event.element, event.index, event.browserEvent);
    }
  }
  onDrop(event) {
    if (!this.canDrop) {
      return;
    }
    const dragData = this.currentDragData;
    this.teardownDragAndDropScrollTopAnimation();
    this.clearDragOverFeedback();
    this.domNode.classList.remove("dragging");
    this.currentDragData = void 0;
    StaticDND.CurrentDragAndDropData = void 0;
    if (!dragData || !event.browserEvent.dataTransfer) {
      return;
    }
    event.browserEvent.preventDefault();
    dragData.update(event.browserEvent.dataTransfer);
    this.dnd.drop(dragData, event.element, event.index, event.sector, event.browserEvent);
  }
  onDragEnd(event) {
    this.canDrop = false;
    this.teardownDragAndDropScrollTopAnimation();
    this.clearDragOverFeedback();
    this.domNode.classList.remove("dragging");
    this.currentDragData = void 0;
    StaticDND.CurrentDragAndDropData = void 0;
    this.dnd.onDragEnd?.(event);
  }
  clearDragOverFeedback() {
    this.currentDragFeedback = void 0;
    this.currentDragFeedbackPosition = void 0;
    this.currentDragFeedbackDisposable.dispose();
    this.currentDragFeedbackDisposable = Disposable.None;
  }
  // DND scroll top animation
  setupDragAndDropScrollTopAnimation(event) {
    if (!this.dragOverAnimationDisposable) {
      const viewTop = getTopLeftOffset(this.domNode).top;
      this.dragOverAnimationDisposable = animate(getWindow(this.domNode), this.animateDragAndDropScrollTop.bind(this, viewTop));
    }
    this.dragOverAnimationStopDisposable.dispose();
    this.dragOverAnimationStopDisposable = disposableTimeout(() => {
      if (this.dragOverAnimationDisposable) {
        this.dragOverAnimationDisposable.dispose();
        this.dragOverAnimationDisposable = void 0;
      }
    }, 1e3, this.disposables);
    this.dragOverMouseY = event.pageY;
  }
  animateDragAndDropScrollTop(viewTop) {
    if (this.dragOverMouseY === void 0) {
      return;
    }
    const diff4 = this.dragOverMouseY - viewTop;
    const upperLimit = this.renderHeight - 35;
    if (diff4 < 35) {
      this.scrollTop += Math.max(-14, Math.floor(0.3 * (diff4 - 35)));
    } else if (diff4 > upperLimit) {
      this.scrollTop += Math.min(14, Math.floor(0.3 * (diff4 - upperLimit)));
    }
  }
  teardownDragAndDropScrollTopAnimation() {
    this.dragOverAnimationStopDisposable.dispose();
    if (this.dragOverAnimationDisposable) {
      this.dragOverAnimationDisposable.dispose();
      this.dragOverAnimationDisposable = void 0;
    }
  }
  // Util
  getTargetSector(browserEvent, targetIndex) {
    if (targetIndex === void 0) {
      return void 0;
    }
    const relativePosition = browserEvent.offsetY / this.items[targetIndex].size;
    const sector = Math.floor(relativePosition / 0.25);
    return clamp(sector, 0, 3);
  }
  getItemIndexFromEventTarget(target) {
    const scrollableElement = this.scrollableElement.getDomNode();
    let element = target;
    while ((isHTMLElement(element) || isSVGElement(element)) && element !== this.rowsContainer && scrollableElement.contains(element)) {
      const rawIndex = element.getAttribute("data-index");
      if (rawIndex) {
        const index2 = Number(rawIndex);
        if (!isNaN(index2)) {
          return index2;
        }
      }
      element = element.parentElement;
    }
    return void 0;
  }
  getVisibleRange(renderTop, renderHeight) {
    return {
      start: this.rangeMap.indexAt(renderTop),
      end: this.rangeMap.indexAfter(renderTop + renderHeight - 1)
    };
  }
  getRenderRange(renderTop, renderHeight) {
    const range2 = this.getVisibleRange(renderTop, renderHeight);
    if (this.currentSelectionBounds) {
      const max = this.rangeMap.count;
      range2.start = Math.min(range2.start, this.currentSelectionBounds.start, max);
      range2.end = Math.min(Math.max(range2.end, this.currentSelectionBounds.end + 1), max);
    }
    return range2;
  }
  /**
   * Given a stable rendered state, checks every rendered element whether it needs
   * to be probed for dynamic height. Adjusts scroll height and top if necessary.
   */
  _rerender(renderTop, renderHeight, inSmoothScrolling) {
    let previousRenderRange = this.getRenderRange(renderTop, renderHeight);
    const retainedMeasurements = /* @__PURE__ */ new Map();
    let anchorElementIndex;
    let anchorElementTopDelta;
    const updateAnchorElement = () => {
      anchorElementIndex = void 0;
      anchorElementTopDelta = void 0;
      if (renderTop === this.elementTop(previousRenderRange.start)) {
        anchorElementIndex = previousRenderRange.start;
        anchorElementTopDelta = 0;
      } else if (previousRenderRange.end - previousRenderRange.start > 1) {
        anchorElementIndex = previousRenderRange.start + 1;
        anchorElementTopDelta = this.elementTop(anchorElementIndex) - renderTop;
      }
    };
    updateAnchorElement();
    let heightDiff2 = 0;
    try {
      while (true) {
        const renderRange = this.getRenderRange(renderTop, renderHeight);
        let didChange = false;
        const probedItems = this.items.slice(renderRange.start, renderRange.end);
        const dynamicHeightDiffs = this.probeDynamicHeights(renderRange, retainedMeasurements);
        const modelDidChange = this.items.length < renderRange.end || probedItems.some((item, index2) => item !== this.items[renderRange.start + index2]);
        if (modelDidChange) {
          for (let index2 = 0; index2 < probedItems.length; index2++) {
            const diff4 = dynamicHeightDiffs[index2];
            const currentIndex = this.items.indexOf(probedItems[index2]);
            if (diff4 !== 0 && currentIndex !== -1) {
              this.rangeMap.splice(currentIndex, 1, [probedItems[index2]]);
              heightDiff2 += diff4;
            }
          }
          this.disposeDynamicHeightMeasurements(retainedMeasurements);
          previousRenderRange = this.getRenderRange(renderTop, renderHeight);
          updateAnchorElement();
          continue;
        }
        for (let i2 = renderRange.start; i2 < renderRange.end; i2++) {
          const diff4 = dynamicHeightDiffs[i2 - renderRange.start];
          if (diff4 !== 0) {
            this.rangeMap.splice(i2, 1, [this.items[i2]]);
          }
          heightDiff2 += diff4;
          didChange = didChange || diff4 !== 0;
        }
        if (!didChange) {
          if (heightDiff2 !== 0) {
            this.eventuallyUpdateScrollDimensions();
          }
          const unrenderRanges = Range3.relativeComplement(previousRenderRange, renderRange);
          for (const range2 of unrenderRanges) {
            for (let i2 = range2.start; i2 < range2.end; i2++) {
              if (this.items[i2].row) {
                this.removeItemFromDOM(i2);
              }
            }
          }
          const insertedItems = [];
          for (let i2 = renderRange.end - 1; i2 >= renderRange.start; i2--) {
            const item = this.items[i2];
            if (!item.row) {
              const measurement = retainedMeasurements.get(i2);
              const canPromoteMeasurement = measurement?.item === item && measurement.item.templateId === item.templateId;
              if (canPromoteMeasurement) {
                retainedMeasurements.delete(i2);
              }
              this.insertItemInDOM(i2, canPromoteMeasurement ? measurement.row : void 0, canPromoteMeasurement);
              insertedItems.push(item);
            }
          }
          this.disposeDynamicHeightMeasurements(retainedMeasurements);
          if (this.horizontalScrolling && insertedItems.length > 0) {
            this.measureItemWidths(insertedItems);
            this.eventuallyUpdateScrollWidth();
          }
          for (let i2 = renderRange.start; i2 < renderRange.end; i2++) {
            if (this.items[i2].row) {
              this.updateItemInDOM(this.items[i2], i2);
            }
          }
          if (typeof anchorElementIndex === "number") {
            const deltaScrollTop = this.scrollable.getFutureScrollPosition().scrollTop - renderTop;
            const newScrollTop = this.elementTop(anchorElementIndex) - anchorElementTopDelta + deltaScrollTop;
            this.setScrollTop(newScrollTop, inSmoothScrolling);
          }
          this._onDidChangeContentHeight.fire(this.contentHeight);
          return;
        }
      }
    } finally {
      this.disposeDynamicHeightMeasurements(retainedMeasurements);
    }
  }
  probeDynamicHeight(index2) {
    const item = this.items[index2];
    return this.probeDynamicHeightForItem(item, index2);
  }
  probeDynamicHeightForItem(item, index2) {
    const delegateHeightDiff = this.probeDynamicHeightFromDelegate(item);
    if (delegateHeightDiff !== void 0) {
      return delegateHeightDiff;
    }
    if (!this.shouldProbeDynamicHeight(item)) {
      return 0;
    }
    const size3 = item.size;
    if (item.row) {
      item.row.domNode.style.height = "";
      item.size = item.row.domNode.offsetHeight;
      if (item.size === 0) {
        if (!isAncestor(item.row.domNode, getWindow(item.row.domNode).document.body)) {
          console.warn("Measuring item node that is not in DOM! Add ListView to the DOM before measuring row height!", new Error().stack);
        } else {
          console.warn("Measured item node at 0px- ensure that ListView is not display:none before measuring row height!", new Error().stack);
        }
      }
      item.lastDynamicHeightWidth = this.renderWidth;
      this.publishDynamicHeight(item);
      return item.size - size3;
    }
    const { row } = this.cache.alloc(item.templateId);
    row.domNode.style.height = "";
    this.rowsContainer.appendChild(row.domNode);
    const renderer = this.renderers.get(item.templateId);
    if (!renderer) {
      throw new BugIndicatingError("Missing renderer for templateId: " + item.templateId);
    }
    renderer.renderElement(item.element, index2, row.templateData);
    item.size = row.domNode.offsetHeight;
    renderer.disposeElement?.(item.element, index2, row.templateData);
    item.lastDynamicHeightWidth = this.renderWidth;
    this.publishDynamicHeight(item);
    row.domNode.remove();
    this.cache.release(row);
    return item.size - size3;
  }
  probeDynamicHeights(range2, retainedMeasurements) {
    const diffs = new Array(range2.end - range2.start).fill(0);
    const measurements = [];
    for (let index2 = range2.start; index2 < range2.end; index2++) {
      const item = this.items[index2];
      const delegateHeightDiff = this.probeDynamicHeightFromDelegate(item);
      if (delegateHeightDiff !== void 0) {
        diffs[index2 - range2.start] = delegateHeightDiff;
        continue;
      }
      if (!this.shouldProbeDynamicHeight(item) || retainedMeasurements.has(index2)) {
        continue;
      }
      if (item.row) {
        item.row.domNode.style.height = "";
        measurements.push({ item, index: index2, previousSize: item.size, row: item.row, rendered: true });
        continue;
      }
      const { row } = this.cache.alloc(item.templateId);
      const measurement = { item, index: index2, previousSize: item.size, row, rendered: false };
      retainedMeasurements.set(index2, measurement);
      measurements.push(measurement);
      row.domNode.style.height = "";
      this.rowsContainer.appendChild(row.domNode);
      const renderer = this.renderers.get(item.templateId);
      if (!renderer) {
        throw new BugIndicatingError("Missing renderer for templateId: " + item.templateId);
      }
      measurement.rendered = true;
      renderer.renderElement(item.element, index2, row.templateData, { height: item.size });
    }
    for (const measurement of measurements) {
      measurement.item.size = measurement.row.domNode.offsetHeight;
    }
    for (const measurement of measurements) {
      const { item, index: index2, previousSize, row } = measurement;
      if (item.size === 0) {
        if (!isAncestor(row.domNode, getWindow(row.domNode).document.body)) {
          console.warn("Measuring item node that is not in DOM! Add ListView to the DOM before measuring row height!", new Error().stack);
        } else {
          console.warn("Measured item node at 0px- ensure that ListView is not display:none before measuring row height!", new Error().stack);
        }
      }
      item.lastDynamicHeightWidth = this.renderWidth;
      this.publishDynamicHeight(item);
      diffs[index2 - range2.start] = item.size - previousSize;
    }
    return diffs;
  }
  disposeDynamicHeightMeasurements(measurements) {
    for (const [measurementIndex, { item, index: index2, row, rendered }] of measurements) {
      measurements.delete(measurementIndex);
      try {
        if (rendered) {
          this.renderers.get(item.templateId)?.disposeElement?.(item.element, index2, row.templateData, { height: item.size });
        }
      } finally {
        row.domNode.remove();
        this.cache.release(row);
      }
    }
  }
  probeDynamicHeightFromDelegate(item) {
    const newSize = this.virtualDelegate.getDynamicHeight?.(item.element);
    if (newSize === void 0 || newSize === null) {
      return void 0;
    }
    const size3 = item.size;
    item.size = newSize;
    item.lastDynamicHeightWidth = this.renderWidth;
    this.publishDynamicHeight(item);
    return newSize - size3;
  }
  shouldProbeDynamicHeight(item) {
    if (!item.hasDynamicHeight || item.lastDynamicHeightWidth === this.renderWidth) {
      return false;
    }
    return !this.virtualDelegate.hasDynamicHeight || this.virtualDelegate.hasDynamicHeight(item.element);
  }
  publishDynamicHeight(item) {
    if (item.size > 0) {
      this.virtualDelegate.setDynamicHeight?.(item.element, item.size);
    }
  }
  getElementDomId(index2) {
    return `${this.domId}_${index2}`;
  }
  // Dispose
  dispose() {
    this.currentSelectionDisposable.clear();
    for (const item of this.items) {
      item.dragStartDisposable.dispose();
      item.checkedDisposable.dispose();
      if (item.row) {
        const renderer = this.renderers.get(item.row.templateId);
        if (renderer) {
          renderer.disposeElement?.(item.element, -1, item.row.templateData, void 0);
          renderer.disposeTemplate(item.row.templateData);
        }
      }
    }
    this.items = [];
    this.domNode?.remove();
    this.dragOverAnimationDisposable?.dispose();
    this.disposables.dispose();
  }
};

__decorateClass([
  memoize
], _ListView.prototype, "onMouseClick", 1);

__decorateClass([
  memoize
], _ListView.prototype, "onMouseDblClick", 1);

__decorateClass([
  memoize
], _ListView.prototype, "onMouseMiddleClick", 1);

__decorateClass([
  memoize
], _ListView.prototype, "onMouseUp", 1);

__decorateClass([
  memoize
], _ListView.prototype, "onMouseDown", 1);

__decorateClass([
  memoize
], _ListView.prototype, "onMouseOver", 1);

__decorateClass([
  memoize
], _ListView.prototype, "onMouseMove", 1);

__decorateClass([
  memoize
], _ListView.prototype, "onMouseOut", 1);

__decorateClass([
  memoize
], _ListView.prototype, "onContextMenu", 1);

__decorateClass([
  memoize
], _ListView.prototype, "onTouchStart", 1);

__decorateClass([
  memoize
], _ListView.prototype, "onTap", 1);

var ListView = _ListView;
export { equalsDragFeedback, StaticDND, DefaultOptions, ElementsDragAndDropData, ExternalElementsDragAndDropData, NativeDragAndDropData, ListViewAccessibilityProvider, _ListView, ListView };
