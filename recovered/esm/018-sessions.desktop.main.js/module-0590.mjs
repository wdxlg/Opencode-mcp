// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/contentHoverStatusBar.ts
import { $, append } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { HoverAction } from "./module-0469.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/editor/contrib/hover/browser/contentHoverStatusBar.ts
var $5 = $;

var EditorHoverStatusBar = class extends Disposable {
  constructor(_keybindingService, _hoverService) {
    super();
    this._keybindingService = _keybindingService;
    this._hoverService = _hoverService;
    this.actions = [];
    this._hasContent = false;
    this.hoverElement = $5("div.hover-row.status-bar");
    this.hoverElement.tabIndex = 0;
    this.actionsElement = append(this.hoverElement, $5("div.actions"));
  }
  get hasContent() {
    return this._hasContent;
  }
  addAction(actionOptions) {
    const keybinding = this._keybindingService.lookupKeybinding(actionOptions.commandId);
    const keybindingLabel2 = keybinding ? keybinding.getLabel() : null;
    this._hasContent = true;
    const action = this._register(HoverAction.render(this.actionsElement, actionOptions, keybindingLabel2));
    this._register(this._hoverService.setupManagedHover(getDefaultHoverDelegate("element"), action.actionContainer, action.actionRenderedLabel));
    this.actions.push(action);
    return action;
  }
  append(element) {
    const result = append(this.actionsElement, element);
    this._hasContent = true;
    return result;
  }
};

EditorHoverStatusBar = __decorateClass([
  __decorateParam(0, IKeybindingService),
  __decorateParam(1, IHoverService)
], EditorHoverStatusBar);
export { $5, EditorHoverStatusBar };
