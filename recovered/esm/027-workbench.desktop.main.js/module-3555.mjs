// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedList.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $ } from "./module-0075.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { equals } from "./module-0007.mjs";


// src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedList.ts
var GettingStartedIndexList = class extends Disposable {
  constructor(options3) {
    super();
    this.options = options3;
    this._onDidChangeEntries = this._register(new Emitter());
    this.onDidChangeEntries = this._onDidChangeEntries.event;
    this.isDisposed = false;
    this.contextKeysToWatch = /* @__PURE__ */ new Set();
    this.contextService = options3.contextService;
    this.entries = void 0;
    this.itemCount = 0;
    this.list = $("ul");
    this.scrollbar = this._register(new DomScrollableElement(this.list, {}));
    this._register(this.onDidChangeEntries(() => this.scrollbar.scanDomNode()));
    this.domElement = $(
      ".index-list." + options3.klass,
      {},
      $("h2", {}, options3.title),
      this.scrollbar.getDomNode()
    );
    this._register(this.contextService.onDidChangeContext((e) => {
      if (e.affectsSome(this.contextKeysToWatch)) {
        this.rerender();
      }
    }));
  }
  getDomElement() {
    return this.domElement;
  }
  layout(size3) {
    this.scrollbar.scanDomNode();
  }
  onDidChange(listener) {
    this._register(this.onDidChangeEntries(listener));
  }
  register(d) {
    if (this.isDisposed) {
      d.dispose();
    } else {
      this._register(d);
    }
  }
  dispose() {
    this.isDisposed = true;
    super.dispose();
  }
  setLimit(limit) {
    this.options.limit = limit;
    this.setEntries(this.entries);
  }
  rerender() {
    this.setEntries(this.entries);
  }
  setEntries(entries2) {
    let entryList = entries2 ?? [];
    this.itemCount = 0;
    const ranker = this.options.rankElement;
    if (ranker) {
      entryList = entryList.filter((e) => ranker(e) !== null);
      entryList.sort((a, b) => ranker(b) - ranker(a));
    }
    const activeEntries = entryList.filter((e) => !e.when || this.contextService.contextMatchesRules(e.when));
    const limitedEntries = activeEntries.slice(0, this.options.limit);
    const toRender = limitedEntries.map((e) => e.id);
    if (this.entries === entries2 && equals(toRender, this.lastRendered)) {
      return;
    }
    this.entries = entries2;
    this.contextKeysToWatch.clear();
    entryList.forEach((e) => {
      const keys = e.when?.keys();
      keys?.forEach((key3) => this.contextKeysToWatch.add(key3));
    });
    this.lastRendered = toRender;
    this.itemCount = limitedEntries.length;
    while (this.list.firstChild) {
      this.list.firstChild.remove();
    }
    this.itemCount = limitedEntries.length;
    for (const entry of limitedEntries) {
      const rendered = this.options.renderElement(entry);
      this.list.appendChild(rendered);
    }
    if (activeEntries.length > limitedEntries.length && this.options.more) {
      this.list.appendChild(this.options.more);
    } else if (entries2 !== void 0 && this.itemCount === 0 && this.options.empty) {
      this.list.appendChild(this.options.empty);
    } else if (this.options.footer) {
      this.list.appendChild(this.options.footer);
    }
    this._onDidChangeEntries.fire();
  }
};
export { GettingStartedIndexList };
