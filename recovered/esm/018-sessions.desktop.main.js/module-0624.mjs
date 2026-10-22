// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/list/listPaging.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { List } from "./module-0460.mjs";
import { isActiveElement } from "./module-0075.mjs";
import { Event2 } from "./module-0017.mjs";
import { range } from "./module-0007.mjs";


// src/vs/base/browser/ui/list/listPaging.ts
var PagedRenderer = class {
  constructor(renderer, modelProvider) {
    this.renderer = renderer;
    this.modelProvider = modelProvider;
  }
  get templateId() {
    return this.renderer.templateId;
  }
  renderTemplate(container2) {
    const data = this.renderer.renderTemplate(container2);
    return { data, disposable: Disposable.None };
  }
  renderElement(index2, _, data, details) {
    data.disposable?.dispose();
    if (!data.data) {
      return;
    }
    const model = this.modelProvider();
    if (model.isResolved(index2)) {
      return this.renderer.renderElement(model.get(index2), index2, data.data, details);
    }
    const cts = new CancellationTokenSource();
    const promise = model.resolve(index2, cts.token);
    data.disposable = { dispose: () => cts.cancel() };
    this.renderer.renderPlaceholder(index2, data.data);
    promise.then((entry) => this.renderer.renderElement(entry, index2, data.data, details));
  }
  disposeTemplate(data) {
    if (data.disposable) {
      data.disposable.dispose();
      data.disposable = void 0;
    }
    if (data.data) {
      this.renderer.disposeTemplate(data.data);
      data.data = void 0;
    }
  }
};

var PagedAccessibilityProvider = class {
  constructor(modelProvider, accessibilityProvider) {
    this.modelProvider = modelProvider;
    this.accessibilityProvider = accessibilityProvider;
  }
  getWidgetAriaLabel() {
    return this.accessibilityProvider.getWidgetAriaLabel();
  }
  getAriaLabel(index2) {
    const model = this.modelProvider();
    if (!model.isResolved(index2)) {
      return null;
    }
    return this.accessibilityProvider.getAriaLabel(model.get(index2));
  }
};

function fromPagedListOptions(modelProvider, options3) {
  return {
    ...options3,
    accessibilityProvider: options3.accessibilityProvider && new PagedAccessibilityProvider(modelProvider, options3.accessibilityProvider)
  };
}

var PagedList = class {
  constructor(user, container2, virtualDelegate, renderers, options3 = {}) {
    this.modelDisposables = new DisposableStore();
    const modelProvider = () => this.model;
    const pagedRenderers = renderers.map((r2) => new PagedRenderer(r2, modelProvider));
    this.list = new List(user, container2, virtualDelegate, pagedRenderers, fromPagedListOptions(modelProvider, options3));
  }
  updateOptions(options3) {
    this.list.updateOptions(options3);
  }
  getHTMLElement() {
    return this.list.getHTMLElement();
  }
  isDOMFocused() {
    return isActiveElement(this.getHTMLElement());
  }
  domFocus() {
    this.list.domFocus();
  }
  get onDidFocus() {
    return this.list.onDidFocus;
  }
  get onDidBlur() {
    return this.list.onDidBlur;
  }
  get widget() {
    return this.list;
  }
  get onDidDispose() {
    return this.list.onDidDispose;
  }
  get onMouseClick() {
    return Event2.map(this.list.onMouseClick, ({ element, index: index2, browserEvent }) => ({ element: element === void 0 ? void 0 : this._model.get(element), index: index2, browserEvent }));
  }
  get onMouseDblClick() {
    return Event2.map(this.list.onMouseDblClick, ({ element, index: index2, browserEvent }) => ({ element: element === void 0 ? void 0 : this._model.get(element), index: index2, browserEvent }));
  }
  get onTap() {
    return Event2.map(this.list.onTap, ({ element, index: index2, browserEvent }) => ({ element: element === void 0 ? void 0 : this._model.get(element), index: index2, browserEvent }));
  }
  get onPointer() {
    return Event2.map(this.list.onPointer, ({ element, index: index2, browserEvent }) => ({ element: element === void 0 ? void 0 : this._model.get(element), index: index2, browserEvent }));
  }
  get onDidChangeFocus() {
    return Event2.map(this.list.onDidChangeFocus, ({ elements, indexes, browserEvent }) => ({ elements: elements.map((e4) => this._model.get(e4)), indexes, browserEvent }));
  }
  get onDidChangeSelection() {
    return Event2.map(this.list.onDidChangeSelection, ({ elements, indexes, browserEvent }) => ({ elements: elements.map((e4) => this._model.get(e4)), indexes, browserEvent }));
  }
  get onContextMenu() {
    return Event2.map(this.list.onContextMenu, ({ element, index: index2, anchor, browserEvent }) => typeof element === "undefined" ? { element, index: index2, anchor, browserEvent } : { element: this._model.get(element), index: index2, anchor, browserEvent });
  }
  get model() {
    return this._model;
  }
  set model(model) {
    this.modelDisposables.clear();
    this._model = model;
    this.list.splice(0, this.list.length, range(model.length));
    this.modelDisposables.add(model.onDidIncrementLength((newLength) => this.list.splice(this.list.length, 0, range(this.list.length, newLength))));
  }
  get length() {
    return this.list.length;
  }
  get scrollTop() {
    return this.list.scrollTop;
  }
  set scrollTop(scrollTop) {
    this.list.scrollTop = scrollTop;
  }
  get scrollLeft() {
    return this.list.scrollLeft;
  }
  set scrollLeft(scrollLeft) {
    this.list.scrollLeft = scrollLeft;
  }
  setAnchor(index2) {
    this.list.setAnchor(index2);
  }
  getAnchor() {
    return this.list.getAnchor();
  }
  setFocus(indexes) {
    this.list.setFocus(indexes);
  }
  focusNext(n2, loop) {
    this.list.focusNext(n2, loop);
  }
  focusPrevious(n2, loop) {
    this.list.focusPrevious(n2, loop);
  }
  focusNextPage() {
    return this.list.focusNextPage();
  }
  focusPreviousPage() {
    return this.list.focusPreviousPage();
  }
  focusLast() {
    this.list.focusLast();
  }
  focusFirst() {
    this.list.focusFirst();
  }
  getFocus() {
    return this.list.getFocus();
  }
  setSelection(indexes, browserEvent) {
    this.list.setSelection(indexes, browserEvent);
  }
  getSelection() {
    return this.list.getSelection();
  }
  getSelectedElements() {
    return this.getSelection().map((i2) => this.model.get(i2));
  }
  layout(height, width2) {
    this.list.layout(height, width2);
  }
  triggerTypeNavigation() {
    this.list.triggerTypeNavigation();
  }
  reveal(index2, relativeTop) {
    this.list.reveal(index2, relativeTop);
  }
  style(styles) {
    this.list.style(styles);
  }
  dispose() {
    this.list.dispose();
    this.modelDisposables.dispose();
  }
};
export { fromPagedListOptions, PagedRenderer, PagedAccessibilityProvider, PagedList };
