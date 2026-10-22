// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/statusbar/statusbarActions.ts
import { Action } from "./module-0082.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { StatusBarFocused } from "./module-0950.mjs";
import { IStatusbarService } from "./module-0895.mjs";
import { IEditorService } from "./module-0935.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { getActiveWindow } from "./module-0075.mjs";


// src/vs/workbench/browser/parts/statusbar/statusbarActions.ts
var ToggleStatusbarEntryVisibilityAction = class extends Action {
  constructor(id2, label3, model) {
    super(id2, label3, void 0, true);
    this.model = model;
    this.checked = !model.isHidden(id2);
  }
  async run() {
    if (this.model.isHidden(this.id)) {
      this.model.show(this.id);
    } else {
      this.model.hide(this.id);
    }
  }
};

var HideStatusbarEntryAction = class extends Action {
  constructor(id2, name, model) {
    super(id2, localize(6913, null, name), void 0, true);
    this.model = model;
  }
  async run() {
    this.model.hide(this.id);
  }
};

var ManageExtensionAction = class extends Action {
  constructor(extensionId, commandService) {
    super("statusbar.manage.extension", localize(6914, null));
    this.extensionId = extensionId;
    this.commandService = commandService;
  }
  run() {
    return this.commandService.executeCommand("_extensions.manage", this.extensionId);
  }
};

ManageExtensionAction = __decorateClass([
  __decorateParam(1, ICommandService)
], ManageExtensionAction);

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.statusBar.focusPrevious",
  weight: 200 /* WorkbenchContrib */,
  primary: 15 /* LeftArrow */,
  secondary: [16 /* UpArrow */],
  when: StatusBarFocused,
  handler: (accessor) => {
    const statusBarService = accessor.get(IStatusbarService);
    statusBarService.focusPreviousEntry();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.statusBar.focusNext",
  weight: 200 /* WorkbenchContrib */,
  primary: 17 /* RightArrow */,
  secondary: [18 /* DownArrow */],
  when: StatusBarFocused,
  handler: (accessor) => {
    const statusBarService = accessor.get(IStatusbarService);
    statusBarService.focusNextEntry();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.statusBar.focusFirst",
  weight: 200 /* WorkbenchContrib */,
  primary: 14 /* Home */,
  when: StatusBarFocused,
  handler: (accessor) => {
    const statusBarService = accessor.get(IStatusbarService);
    statusBarService.focus(false);
    statusBarService.focusNextEntry();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.statusBar.focusLast",
  weight: 200 /* WorkbenchContrib */,
  primary: 13 /* End */,
  when: StatusBarFocused,
  handler: (accessor) => {
    const statusBarService = accessor.get(IStatusbarService);
    statusBarService.focus(false);
    statusBarService.focusPreviousEntry();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.statusBar.clearFocus",
  weight: 200 /* WorkbenchContrib */,
  primary: 9 /* Escape */,
  when: StatusBarFocused,
  handler: (accessor) => {
    const statusBarService = accessor.get(IStatusbarService);
    const editorService = accessor.get(IEditorService);
    if (statusBarService.isEntryFocused()) {
      statusBarService.focus(false);
    } else if (editorService.activeEditorPane) {
      editorService.activeEditorPane.focus();
    }
  }
});

var FocusStatusBarAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.focusStatusBar",
      title: localize2(6912, "Focus Status Bar"),
      category: Categories.View,
      f1: true
    });
  }
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    layoutService.focusPart("workbench.parts.statusbar" /* STATUSBAR_PART */, getActiveWindow());
  }
};

registerAction2(FocusStatusBarAction);
export { ToggleStatusbarEntryVisibilityAction, HideStatusbarEntryAction, ManageExtensionAction, FocusStatusBarAction };
