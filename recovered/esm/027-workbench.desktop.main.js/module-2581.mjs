// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/radio/radio.ts
import { Widget } from "./module-0252.mjs";
import { Emitter } from "./module-0017.mjs";
import { DisposableMap, DisposableStore } from "./module-0012.mjs";
import { createInstantHoverDelegate } from "./module-0448.mjs";
import { $ } from "./module-0075.mjs";
import { Button } from "./module-0546.mjs";


// src/vs/base/browser/ui/radio/radio.ts
var Radio = class extends Widget {
  constructor(opts) {
    super();
    this._onDidSelect = this._register(new Emitter());
    this.onDidSelect = this._onDidSelect.event;
    this.items = [];
    this.buttons = this._register(new DisposableMap());
    this.hoverDelegate = opts.hoverDelegate ?? this._register(createInstantHoverDelegate());
    this.domNode = $(".monaco-custom-radio");
    this.domNode.setAttribute("role", "radio");
    this.setItems(opts.items);
  }
  setItems(items) {
    this.buttons.clearAndDisposeAll();
    this.items = items;
    this.activeItem = this.items.find((item) => item.isActive) ?? this.items[0];
    for (let index2 = 0; index2 < this.items.length; index2++) {
      const item = this.items[index2];
      const disposables = new DisposableStore();
      const button = disposables.add(new Button(this.domNode, {
        hoverDelegate: this.hoverDelegate,
        title: item.tooltip,
        supportIcons: true
      }));
      button.enabled = !item.disabled;
      disposables.add(button.onDidClick(() => {
        if (this.activeItem !== item) {
          this.activeItem = item;
          this.updateButtons();
          this._onDidSelect.fire(index2);
        }
      }));
      this.buttons.set(button, { item, dispose: () => disposables.dispose() });
    }
    this.updateButtons();
  }
  setActiveItem(index2) {
    if (index2 < 0 || index2 >= this.items.length) {
      throw new Error("Invalid Index");
    }
    this.activeItem = this.items[index2];
    this.updateButtons();
  }
  setEnabled(enabled) {
    for (const [button] of this.buttons) {
      button.enabled = enabled;
    }
  }
  updateButtons() {
    let isActive2 = false;
    for (const [button, { item }] of this.buttons) {
      const isPreviousActive = isActive2;
      isActive2 = item === this.activeItem;
      button.element.classList.toggle("active", isActive2);
      button.element.classList.toggle("previous-active", isPreviousActive);
      button.label = item.text;
    }
  }
};
export { Radio };
