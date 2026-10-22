// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/chatResourcePill.ts
import { ChatPillActionViewItemBase } from "./module-2260.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { onUnexpectedError } from "./module-0004.mjs";


// src/vs/workbench/browser/chatResourcePill.ts
var ChatResourcePillActionViewItem = class extends ChatPillActionViewItemBase {
  constructor(action, options3, _entry, _resourceLabels) {
    super(void 0, action, options3);
    this._entry = _entry;
    this._resourceLabels = _resourceLabels;
  }
  get itemModifierClass() {
    return "chat-resource-pill";
  }
  get buttonModifierClass() {
    return "chat-resource-pill-button";
  }
  renderContent(button) {
    const label3 = this._register(this._resourceLabels.create(button.element));
    this._register(autorun((reader) => {
      const entry = this._entry.read(reader);
      if (entry?.resource) {
        label3.setResource({ resource: entry.resource, name: entry.label }, { fileKind: 0 /* FILE */ });
      }
      this.updateTooltip();
      this.updateAriaLabel();
    }));
  }
  getTooltip() {
    const entry = this._entry.get();
    return entry?.tooltip ?? (entry ? localize(6193, null, entry.label) : this._action.label);
  }
  getAriaLabel() {
    return this._entry.get()?.ariaLabel ?? super.getAriaLabel();
  }
  onDidClickButton() {
    try {
      this._entry.get()?.open();
    } catch (error) {
      onUnexpectedError(error);
    }
  }
};
export { ChatResourcePillActionViewItem };
