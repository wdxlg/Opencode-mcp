// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataProfile/browser/iconSelectBox.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { IconSelectBox } from "./module-3287.mjs";
import { trackFocus } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";


// src/vs/workbench/services/userDataProfile/browser/iconSelectBox.ts
var WorkbenchIconSelectBoxFocusContextKey = new RawContextKey("iconSelectBoxFocus", true);

var WorkbenchIconSelectBoxInputFocusContextKey = new RawContextKey("iconSelectBoxInputFocus", true);

var WorkbenchIconSelectBoxInputEmptyContextKey = new RawContextKey("iconSelectBoxInputEmpty", true);

var WorkbenchIconSelectBox = class extends IconSelectBox {
  static getFocusedWidget() {
    return WorkbenchIconSelectBox.focusedWidget;
  }
  constructor(options3, contextKeyService) {
    super(options3);
    this.contextKeyService = this._register(contextKeyService.createScoped(this.domNode));
    WorkbenchIconSelectBoxFocusContextKey.bindTo(this.contextKeyService);
    this.inputFocusContextKey = WorkbenchIconSelectBoxInputFocusContextKey.bindTo(this.contextKeyService);
    this.inputEmptyContextKey = WorkbenchIconSelectBoxInputEmptyContextKey.bindTo(this.contextKeyService);
    if (this.inputBox) {
      const focusTracker = this._register(trackFocus(this.inputBox.inputElement));
      this._register(focusTracker.onDidFocus(() => this.inputFocusContextKey.set(true)));
      this._register(focusTracker.onDidBlur(() => this.inputFocusContextKey.set(false)));
      this._register(this.inputBox.onDidChange(() => this.inputEmptyContextKey.set(this.inputBox?.value.length === 0)));
    }
  }
  focus() {
    super.focus();
    WorkbenchIconSelectBox.focusedWidget = this;
  }
};

WorkbenchIconSelectBox = __decorateClass([
  __decorateParam(1, IContextKeyService)
], WorkbenchIconSelectBox);

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "iconSelectBox.focusUp",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchIconSelectBoxFocusContextKey,
  primary: 16 /* UpArrow */,
  handler: () => {
    const selectBox = WorkbenchIconSelectBox.getFocusedWidget();
    if (selectBox) {
      selectBox.focusPreviousRow();
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "iconSelectBox.focusDown",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchIconSelectBoxFocusContextKey,
  primary: 18 /* DownArrow */,
  handler: () => {
    const selectBox = WorkbenchIconSelectBox.getFocusedWidget();
    if (selectBox) {
      selectBox.focusNextRow();
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "iconSelectBox.focusNext",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(WorkbenchIconSelectBoxFocusContextKey, ContextKeyExpr.or(WorkbenchIconSelectBoxInputEmptyContextKey, WorkbenchIconSelectBoxInputFocusContextKey.toNegated())),
  primary: 17 /* RightArrow */,
  handler: () => {
    const selectBox = WorkbenchIconSelectBox.getFocusedWidget();
    if (selectBox) {
      selectBox.focusNext();
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "iconSelectBox.focusPrevious",
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(WorkbenchIconSelectBoxFocusContextKey, ContextKeyExpr.or(WorkbenchIconSelectBoxInputEmptyContextKey, WorkbenchIconSelectBoxInputFocusContextKey.toNegated())),
  primary: 15 /* LeftArrow */,
  handler: () => {
    const selectBox = WorkbenchIconSelectBox.getFocusedWidget();
    if (selectBox) {
      selectBox.focusPrevious();
    }
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "iconSelectBox.selectFocused",
  weight: 200 /* WorkbenchContrib */,
  when: WorkbenchIconSelectBoxFocusContextKey,
  primary: 3 /* Enter */,
  handler: () => {
    const selectBox = WorkbenchIconSelectBox.getFocusedWidget();
    if (selectBox) {
      selectBox.setSelection(selectBox.getFocus()[0]);
    }
  }
});
export { WorkbenchIconSelectBoxFocusContextKey, WorkbenchIconSelectBoxInputFocusContextKey, WorkbenchIconSelectBoxInputEmptyContextKey, WorkbenchIconSelectBox };
