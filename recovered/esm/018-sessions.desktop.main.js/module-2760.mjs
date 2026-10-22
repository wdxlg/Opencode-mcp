// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/domWidget/browser/domWidget.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { isHotReloadEnabled } from "./module-0442.mjs";
import { autorun } from "./module-0052.mjs";
import { constObservable } from "./module-0061.mjs";
import { derived } from "./module-0054.mjs";
import { observableValue } from "./module-0048.mjs";


// src/vs/platform/domWidget/browser/domWidget.ts
var DomWidget = class extends Disposable {
  /**
   * Appends the widget to the provided DOM element.
  */
  static createAppend(dom, store, ...params) {
    if (!isHotReloadEnabled()) {
      const widget = new this(...params);
      dom.appendChild(widget.element);
      store.add(widget);
      return;
    }
    const observable = this.createObservable(store, ...params);
    store.add(autorun((reader) => {
      const widget = observable.read(reader);
      dom.appendChild(widget.element);
      reader.store.add(toDisposable(() => widget.element.remove()));
      reader.store.add(widget);
    }));
  }
  /**
   * Creates the widget in a new div element with "display: contents".
  */
  static createInContents(store, ...params) {
    const div = document.createElement("div");
    div.style.display = "contents";
    this.createAppend(div, store, ...params);
    return div;
  }
  /**
   * Creates an observable instance of the widget.
   * The observable will change when hot module replacement occurs.
  */
  static createObservable(store, ...params) {
    if (!isHotReloadEnabled()) {
      return constObservable(new this(...params));
    }
    const id2 = this[_hotReloadId];
    const observable = id2 ? hotReloadedWidgets.get(id2) : void 0;
    if (!observable) {
      return constObservable(new this(...params));
    }
    return derived((reader) => {
      const Ctor = observable.read(reader);
      return new Ctor(...params);
    });
  }
  /**
   * Appends the widget to the provided DOM element.
  */
  static instantiateAppend(instantiationService, dom, store, ...params) {
    if (!isHotReloadEnabled()) {
      const widget = instantiationService.createInstance(this, ...params);
      dom.appendChild(widget.element);
      store.add(widget);
      return;
    }
    const observable = this.instantiateObservable(instantiationService, store, ...params);
    let lastWidget = void 0;
    store.add(autorun((reader) => {
      const widget = observable.read(reader);
      if (lastWidget) {
        lastWidget.element.replaceWith(widget.element);
      } else {
        dom.appendChild(widget.element);
      }
      lastWidget = widget;
      reader.delayedStore.add(widget);
    }));
  }
  /**
   * Creates the widget in a new div element with "display: contents".
   * If possible, prefer `instantiateAppend`, as it avoids an extra div in the DOM.
  */
  static instantiateInContents(instantiationService, store, ...params) {
    const div = document.createElement("div");
    div.style.display = "contents";
    this.instantiateAppend(instantiationService, div, store, ...params);
    return div;
  }
  /**
   * Creates an observable instance of the widget.
   * The observable will change when hot module replacement occurs.
  */
  static instantiateObservable(instantiationService, store, ...params) {
    if (!isHotReloadEnabled()) {
      return constObservable(instantiationService.createInstance(this, ...params));
    }
    const id2 = this[_hotReloadId];
    const observable = id2 ? hotReloadedWidgets.get(id2) : void 0;
    if (!observable) {
      return constObservable(instantiationService.createInstance(this, ...params));
    }
    return derived((reader) => {
      const Ctor = observable.read(reader);
      return instantiationService.createInstance(Ctor, ...params);
    });
  }
  /**
   * @deprecated Do not call manually! Only for use by the hot reload system (a vite plugin will inject calls to this method in dev mode).
  */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static registerWidgetHotReplacement(id2) {
    if (!isHotReloadEnabled()) {
      return;
    }
    let observable = hotReloadedWidgets.get(id2);
    if (!observable) {
      observable = observableValue(id2, this);
      hotReloadedWidgets.set(id2, observable);
    } else {
      observable.set(this, void 0);
    }
    this[_hotReloadId] = id2;
  }
};

var _hotReloadId = /* @__PURE__ */ Symbol("DomWidgetHotReloadId");

var hotReloadedWidgets = /* @__PURE__ */ new Map();
export { DomWidget, _hotReloadId, hotReloadedWidgets };
