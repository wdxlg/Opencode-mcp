// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/chatChangesPill.ts
import { ChatPillActionViewItemBase } from "./module-2235.mjs";
import { $, reset } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { AnimatedCounterWidget } from "./module-2236.mjs";
import { derived } from "./module-0054.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/browser/chatChangesPill.ts
var ChatChangesPillActionViewItem = class extends ChatPillActionViewItemBase {
  constructor(action, options3, _statsObs, _instantiationService) {
    super(void 0, action, options3);
    this._statsObs = _statsObs;
    this._instantiationService = _instantiationService;
  }
  get itemModifierClass() {
    return "chat-changes-pill";
  }
  get buttonModifierClass() {
    return "chat-changes-pill-button";
  }
  renderContent(button) {
    this._filesLabel = $("span.chat-pill-label");
    reset(
      button.element,
      $(`span.chat-pill-icon${ThemeIcon.asCSSSelector(Codicon.diffMultiple)}`, { "aria-hidden": "true" }),
      this._filesLabel
    );
    this._register(this._instantiationService.createInstance(AnimatedCounterWidget, button.element, {
      prefix: "+",
      direction: "topToBottom",
      cssClassName: "chat-pill-added",
      count: derived(this, (reader) => this._statsObs.read(reader).insertions)
    }));
    this._register(this._instantiationService.createInstance(AnimatedCounterWidget, button.element, {
      prefix: "-",
      direction: "bottomToTop",
      cssClassName: "chat-pill-removed",
      count: derived(this, (reader) => this._statsObs.read(reader).deletions)
    }));
    this._register(autorun((reader) => {
      this._updateLabel(this._statsObs.read(reader));
    }));
  }
  _updateLabel(stats) {
    if (!this.button || !this._filesLabel) {
      return;
    }
    const { files, insertions, deletions } = stats;
    const filesLabel = files === 1 ? localize(6190, null, files) : localize(6191, null, files);
    this._filesLabel.textContent = filesLabel;
    this.button.setTitle(this._action.tooltip || this._action.label);
    this.button.element.setAttribute("aria-label", localize(6189, null, this._action.label, filesLabel, insertions, deletions));
  }
};
export { ChatChangesPillActionViewItem };
