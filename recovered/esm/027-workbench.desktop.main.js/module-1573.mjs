// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/breadcrumbs/breadcrumbsWidget.ts
import { $, Dimension, addStandardDisposableListener, clearNode, getWindow, isAncestorOfActiveElement, measure, modify, trackFocus } from "./module-0075.mjs";
import { DisposableStore, MutableDisposable, dispose } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { commonPrefixLength } from "./module-0007.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/base/browser/ui/breadcrumbs/breadcrumbsWidget.ts
var BreadcrumbsItem = class {
};

var BreadcrumbsWidget = class {
  constructor(container3, horizontalScrollbarSize, horizontalScrollbarVisibility = 1 /* Auto */, separatorIcon2, styles, _measure = measure) {
    this._measure = _measure;
    this._disposables = new DisposableStore();
    this._onDidSelectItem = new Emitter();
    this._onDidFocusItem = new Emitter();
    this._onDidChangeFocus = new Emitter();
    this.onDidSelectItem = this._onDidSelectItem.event;
    this.onDidFocusItem = this._onDidFocusItem.event;
    this.onDidChangeFocus = this._onDidChangeFocus.event;
    this._items = new Array();
    this._nodes = new Array();
    this._freeNodes = new Array();
    this._enabled = true;
    this._focusedItemIdx = -1;
    this._selectedItemIdx = -1;
    this._pendingReveal = this._disposables.add(new MutableDisposable());
    this._domNode = document.createElement("div");
    this._domNode.className = "monaco-breadcrumbs";
    this._domNode.tabIndex = 0;
    this._domNode.setAttribute("role", "list");
    this._scrollable = new DomScrollableElement(this._domNode, {
      vertical: 2 /* Hidden */,
      horizontal: horizontalScrollbarVisibility,
      horizontalScrollbarSize,
      useShadows: false,
      scrollYToX: true
    });
    this._separatorIcon = separatorIcon2;
    this._disposables.add(this._scrollable);
    this._disposables.add(addStandardDisposableListener(this._domNode, "click", (e) => this._onClick(e)));
    container3.appendChild(this._scrollable.getDomNode());
    const styleElement = createStyleSheet(this._domNode);
    this._style(styleElement, styles);
    const focusTracker = trackFocus(this._domNode);
    this._disposables.add(focusTracker);
    this._disposables.add(focusTracker.onDidBlur((_) => this._onDidChangeFocus.fire(false)));
    this._disposables.add(focusTracker.onDidFocus((_) => this._onDidChangeFocus.fire(true)));
  }
  setHorizontalScrollbarSize(size3) {
    this._scrollable.updateOptions({
      horizontalScrollbarSize: size3
    });
  }
  setHorizontalScrollbarVisibility(visibility) {
    this._scrollable.updateOptions({
      horizontal: visibility
    });
  }
  dispose() {
    this._disposables.dispose();
    this._pendingLayout?.dispose();
    this._pendingDimLayout?.dispose();
    this._onDidSelectItem.dispose();
    this._onDidFocusItem.dispose();
    this._onDidChangeFocus.dispose();
    this._domNode.remove();
    dispose(this._items);
    this._items.length = 0;
    this._nodes.length = 0;
    this._freeNodes.length = 0;
  }
  layout(dim) {
    if (dim && Dimension.equals(dim, this._dimension)) {
      return;
    }
    if (dim) {
      this._pendingDimLayout?.dispose();
      this._pendingDimLayout = this._updateDimensions(dim);
    } else {
      this._pendingLayout?.dispose();
      this._pendingLayout = this._updateScrollbar();
    }
  }
  _updateDimensions(dim) {
    const disposables = new DisposableStore();
    disposables.add(modify(getWindow(this._domNode), () => {
      this._dimension = dim;
      this._domNode.style.width = `${dim.width}px`;
      this._domNode.style.height = `${dim.height}px`;
      disposables.add(this._updateScrollbar());
    }));
    return disposables;
  }
  _updateScrollbar() {
    return measure(getWindow(this._domNode), () => {
      measure(getWindow(this._domNode), () => {
        this._scrollable.setRevealOnScroll(false);
        this._scrollable.scanDomNode();
        this._scrollable.setRevealOnScroll(true);
      });
    });
  }
  _style(styleElement, style) {
    let content2 = "";
    if (style.breadcrumbsBackground) {
      content2 += `.monaco-breadcrumbs { background-color: ${style.breadcrumbsBackground}}
`;
    }
    if (style.breadcrumbsForeground) {
      content2 += `.monaco-breadcrumbs .monaco-breadcrumb-item { color: ${style.breadcrumbsForeground}}
`;
    }
    if (style.breadcrumbsFocusForeground) {
      content2 += `.monaco-breadcrumbs .monaco-breadcrumb-item.focused { color: ${style.breadcrumbsFocusForeground}}
`;
    }
    if (style.breadcrumbsFocusAndSelectionForeground) {
      content2 += `.monaco-breadcrumbs .monaco-breadcrumb-item.focused.selected { color: ${style.breadcrumbsFocusAndSelectionForeground}}
`;
    }
    if (style.breadcrumbsHoverForeground) {
      content2 += `.monaco-breadcrumbs:not(.disabled) .monaco-breadcrumb-item:hover:not(.focused):not(.selected) { color: ${style.breadcrumbsHoverForeground}}
`;
    }
    styleElement.textContent = content2;
  }
  setEnabled(value2) {
    this._enabled = value2;
    this._domNode.classList.toggle("disabled", !this._enabled);
  }
  domFocus() {
    const idx = this._focusedItemIdx >= 0 ? this._focusedItemIdx : this._items.length - 1;
    if (idx >= 0 && idx < this._items.length) {
      this._focus(idx, void 0);
    } else {
      this._domNode.focus();
    }
  }
  isDOMFocused() {
    return isAncestorOfActiveElement(this._domNode);
  }
  getFocused() {
    return this._items[this._focusedItemIdx];
  }
  setFocused(item, payload) {
    this._focus(this._items.indexOf(item), payload);
  }
  focusPrev(payload) {
    if (this._focusedItemIdx > 0) {
      this._focus(this._focusedItemIdx - 1, payload);
    }
  }
  focusNext(payload) {
    if (this._focusedItemIdx + 1 < this._nodes.length) {
      this._focus(this._focusedItemIdx + 1, payload);
    }
  }
  _focus(nth, payload) {
    this._focusedItemIdx = -1;
    for (let i2 = 0; i2 < this._nodes.length; i2++) {
      const node = this._nodes[i2];
      if (i2 !== nth) {
        node.classList.remove("focused");
      } else {
        this._focusedItemIdx = i2;
        node.classList.add("focused");
        node.focus();
      }
    }
    this._reveal(this._focusedItemIdx, true);
    this._onDidFocusItem.fire({ type: "focus", item: this._items[this._focusedItemIdx], node: this._nodes[this._focusedItemIdx], payload });
  }
  reveal(item) {
    const idx = this._items.indexOf(item);
    if (idx >= 0) {
      this._reveal(idx, false);
    }
  }
  revealLast() {
    this._reveal(this._items.length - 1, false);
  }
  _reveal(nth, minimal) {
    this._pendingReveal.clear();
    if (nth < 0 || nth >= this._nodes.length) {
      return;
    }
    const node = this._nodes[nth];
    if (!node) {
      return;
    }
    if (!minimal) {
      this._pendingReveal.value = this._measure(getWindow(this._domNode), () => {
        if (this._nodes[nth] === node) {
          this._revealNode(node, false);
        }
      });
      return;
    }
    this._revealNode(node, true);
  }
  _revealNode(node, minimal) {
    const { width: width2 } = this._scrollable.getScrollDimensions();
    const { scrollLeft } = this._scrollable.getScrollPosition();
    const nodeOffsetLeft = node.offsetLeft;
    if (!minimal || nodeOffsetLeft > scrollLeft + width2 || nodeOffsetLeft < scrollLeft) {
      this._scrollable.setRevealOnScroll(false);
      this._scrollable.setScrollPosition({ scrollLeft: nodeOffsetLeft });
      this._scrollable.setRevealOnScroll(true);
    }
  }
  getSelection() {
    return this._items[this._selectedItemIdx];
  }
  setSelection(item, payload) {
    this._select(this._items.indexOf(item), payload);
  }
  _select(nth, payload) {
    this._selectedItemIdx = -1;
    for (let i2 = 0; i2 < this._nodes.length; i2++) {
      const node = this._nodes[i2];
      if (i2 !== nth) {
        node.classList.remove("selected");
      } else {
        this._selectedItemIdx = i2;
        node.classList.add("selected");
      }
    }
    this._onDidSelectItem.fire({ type: "select", item: this._items[this._selectedItemIdx], node: this._nodes[this._selectedItemIdx], payload });
  }
  getItems() {
    return this._items;
  }
  setItems(items) {
    let prefix;
    let removed = [];
    try {
      prefix = commonPrefixLength(this._items, items, (a, b) => a.equals(b));
      removed = this._items.splice(prefix, this._items.length - prefix, ...items.slice(prefix));
      this._render(prefix);
      dispose(removed);
      dispose(items.slice(0, prefix));
      this._focus(-1, void 0);
    } catch (e) {
      const newError = new Error(`BreadcrumbsItem#setItems: newItems: ${items.length}, prefix: ${prefix}, removed: ${removed.length}`);
      newError.name = e.name;
      newError.stack = e.stack;
      throw newError;
    }
  }
  _render(start) {
    let didChange = false;
    for (; start < this._items.length && start < this._nodes.length; start++) {
      const item = this._items[start];
      const node = this._nodes[start];
      this._renderItem(item, node);
      didChange = true;
    }
    while (start < this._nodes.length) {
      const free = this._nodes.pop();
      if (free) {
        this._freeNodes.push(free);
        free.remove();
        didChange = true;
      }
    }
    for (; start < this._items.length; start++) {
      const item = this._items[start];
      const node = this._freeNodes.length > 0 ? this._freeNodes.pop() : document.createElement("div");
      if (node) {
        this._renderItem(item, node);
        this._domNode.appendChild(node);
        this._nodes.push(node);
        didChange = true;
      }
    }
    if (didChange) {
      this.layout(void 0);
    }
  }
  _renderItem(item, container3) {
    clearNode(container3);
    container3.className = "";
    try {
      item.render(container3);
    } catch (err) {
      container3.textContent = "<<RENDER ERROR>>";
      console.error(err);
    }
    container3.tabIndex = -1;
    container3.setAttribute("role", "listitem");
    container3.classList.add("monaco-breadcrumb-item");
    const iconContainer = $(ThemeIcon.asCSSSelector(this._separatorIcon));
    container3.appendChild(iconContainer);
  }
  _onClick(event) {
    if (!this._enabled) {
      return;
    }
    for (let el = event.target; el; el = el.parentElement) {
      const idx = this._nodes.indexOf(el);
      if (idx >= 0) {
        this._focus(idx, event);
        this._select(idx, event);
        break;
      }
    }
  }
};
export { BreadcrumbsItem, BreadcrumbsWidget };
