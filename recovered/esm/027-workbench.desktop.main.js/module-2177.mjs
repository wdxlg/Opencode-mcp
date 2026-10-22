// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatInputPickerResponsiveLayout.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { $, DisposableResizeObserver, getWindow, isHTMLElement } from "./module-0075.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatInputPickerResponsiveLayout.ts
var WIDTH_TOLERANCE = 1;

function isChatInputPickerResponsiveState(candidate) {
  return !!candidate && "isCompact" in candidate && typeof candidate.isCompact === "function" && "setCompact" in candidate && typeof candidate.setCompact === "function";
}

var ChatInputPickerResponsiveLayout = class extends Disposable {
  constructor(name, _element, _delegate2) {
    super();
    this._element = _element;
    this._delegate = _delegate2;
    this._isLayouting = false;
    const targetWindow = getWindow(_element);
    const resizeObserver = this._register(new DisposableResizeObserver(name, () => this.layout(), targetWindow));
    this._register(resizeObserver.observe(_element));
    this._mutationObserver = new targetWindow.MutationObserver(() => this.layout());
    this._observeMutations();
    this._register(toDisposable(() => this._mutationObserver.disconnect()));
  }
  layout() {
    if (this._isLayouting || !this._element.isConnected) {
      return;
    }
    const availableWidth = this._element.getBoundingClientRect().width;
    if (availableWidth <= 0) {
      return;
    }
    this._isLayouting = true;
    this._mutationObserver.disconnect();
    try {
      this._setAllCompact(true);
      this._delegate.relayout?.();
      this._setAllCompact(true);
      this._delegate.relayout?.();
      if (this._delegate.hasOverflow?.()) {
        return;
      }
      const items = this._getOrderedVisibleItems();
      for (const item of items) {
        item.setCompact(false);
      }
      for (const item of items) {
        if (this._fitsAvailableWidth(availableWidth)) {
          break;
        }
        item.setCompact(true);
      }
      this._delegate.relayout?.();
    } finally {
      this._observeMutations();
      this._isLayouting = false;
    }
  }
  areAllItemsCompact() {
    return this._delegate.getItems().every((item) => item.isCompact());
  }
  _setAllCompact(compact2) {
    for (const item of this._delegate.getItems()) {
      item.setCompact(compact2);
    }
  }
  _getOrderedVisibleItems() {
    return this._delegate.getItems().filter((item) => item.element?.isConnected && item.element.getClientRects().length > 0).sort((a, b) => (b.compactPriority ?? 0) - (a.compactPriority ?? 0) || b.element.getBoundingClientRect().left - a.element.getBoundingClientRect().left);
  }
  _fitsAvailableWidth(availableWidth) {
    const items = this._getOrderedVisibleItems();
    const preferredLayout = this._measurePreferredLayout(items);
    if (preferredLayout.width > availableWidth + WIDTH_TOLERANCE) {
      return false;
    }
    const laneBounds = this._element.getBoundingClientRect();
    const itemBounds = items.map((item) => ({ item, bounds: item.element.getBoundingClientRect() })).sort((a, b) => a.bounds.left - b.bounds.left);
    for (let index2 = 0; index2 < itemBounds.length; index2++) {
      const { item, bounds } = itemBounds[index2];
      if (bounds.left < laneBounds.left - WIDTH_TOLERANCE || bounds.right > laneBounds.right + WIDTH_TOLERANCE) {
        return false;
      }
      if (index2 > 0 && bounds.left < itemBounds[index2 - 1].bounds.right - WIDTH_TOLERANCE) {
        return false;
      }
      const preferredWidth = preferredLayout.itemWidths.get(item);
      if (preferredWidth !== void 0 && bounds.width < preferredWidth - WIDTH_TOLERANCE) {
        return false;
      }
    }
    return true;
  }
  _measurePreferredLayout(items) {
    const parent = this._element.parentElement;
    if (!parent) {
      return { width: 0, itemWidths: /* @__PURE__ */ new Map() };
    }
    const measurementHost = $(".chat-input-picker-measurement-host");
    measurementHost.style.position = "fixed";
    measurementHost.style.inset = "0 auto auto 0";
    measurementHost.style.width = "0";
    measurementHost.style.height = "0";
    measurementHost.style.overflow = "hidden";
    measurementHost.style.contain = "strict";
    measurementHost.style.visibility = "hidden";
    measurementHost.style.pointerEvents = "none";
    const measurement = this._element.cloneNode(true);
    measurement.setAttribute("aria-hidden", "true");
    measurement.setAttribute("inert", "");
    measurement.style.position = "absolute";
    measurement.style.left = "0";
    measurement.style.top = "0";
    measurement.style.width = "max-content";
    measurement.style.minWidth = "max-content";
    measurement.style.maxWidth = "none";
    measurement.style.flex = "none";
    measurementHost.appendChild(measurement);
    parent.appendChild(measurementHost);
    try {
      const itemWidths = /* @__PURE__ */ new Map();
      for (const item of items) {
        const path = item.element ? this._getElementPath(item.element) : void 0;
        const measuredItem = path ? this._getElementAtPath(measurement, path) : void 0;
        if (measuredItem) {
          measuredItem.style.flex = "none";
          measuredItem.style.width = "max-content";
          measuredItem.style.minWidth = "max-content";
          measuredItem.style.maxWidth = "none";
          itemWidths.set(item, measuredItem.getBoundingClientRect().width);
        }
      }
      return { width: measurement.getBoundingClientRect().width, itemWidths };
    } finally {
      measurementHost.remove();
    }
  }
  _getElementPath(element) {
    const path = [];
    let current = element;
    while (current && current !== this._element) {
      const parent = current.parentElement;
      if (!parent) {
        return void 0;
      }
      const index2 = Array.from(parent.children).indexOf(current);
      if (index2 < 0) {
        return void 0;
      }
      path.unshift(index2);
      current = parent;
    }
    return current === this._element ? path : void 0;
  }
  _getElementAtPath(root, path) {
    let current = root;
    for (const index2 of path) {
      const child = current.children.item(index2);
      if (!child) {
        return void 0;
      }
      current = child;
    }
    return isHTMLElement(current) ? current : void 0;
  }
  _observeMutations() {
    this._mutationObserver.observe(this._element, {
      attributes: true,
      attributeFilter: ["class", "hidden", "style"],
      characterData: true,
      childList: true,
      subtree: true
    });
  }
};
export { isChatInputPickerResponsiveState, WIDTH_TOLERANCE, ChatInputPickerResponsiveLayout };
