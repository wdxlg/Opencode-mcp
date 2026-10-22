// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/accessibility/browser/accessibleViewActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { accessibilityHelpIsShown, accessibleViewContainsCodeBlocks, accessibleViewCurrentProviderId, accessibleViewGoToSymbolSupported, accessibleViewHasAssignedKeybindings, accessibleViewHasUnassignedKeybindings, accessibleViewIsShown, accessibleViewSupportsNavigation, accessibleViewVerbosityEnabled } from "./module-1369.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { IAccessibleViewService } from "./module-0799.mjs";
import { MultiCommand } from "./module-0097.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { InlineCompletionsController } from "./module-0796.mjs";


// src/vs/workbench/contrib/accessibility/browser/accessibleViewActions.ts
var accessibleViewMenu = {
  id: MenuId.AccessibleView,
  group: "navigation",
  when: accessibleViewIsShown
};

var commandPalette = {
  id: MenuId.CommandPalette,
  group: "",
  order: 1
};

var AccessibleViewNextAction = class extends Action2 {
  constructor() {
    super({
      id: "editor.action.accessibleViewNext" /* ShowNext */,
      precondition: ContextKeyExpr.and(accessibleViewIsShown, accessibleViewSupportsNavigation),
      keybinding: {
        primary: 512 /* Alt */ | 94 /* BracketRight */,
        weight: 200 /* WorkbenchContrib */
      },
      menu: [
        commandPalette,
        {
          ...accessibleViewMenu,
          when: ContextKeyExpr.and(accessibleViewIsShown, accessibleViewSupportsNavigation)
        }
      ],
      icon: Codicon.arrowDown,
      title: localize(7795, null)
    });
  }
  run(accessor) {
    accessor.get(IAccessibleViewService).next();
  }
};

registerAction2(AccessibleViewNextAction);

var AccessibleViewNextCodeBlockAction = class extends Action2 {
  constructor() {
    super({
      id: "editor.action.accessibleViewNextCodeBlock" /* NextCodeBlock */,
      precondition: ContextKeyExpr.and(accessibleViewContainsCodeBlocks, ContextKeyExpr.or(ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "panelChat" /* PanelChat */), ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "inlineChat" /* InlineChat */), ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "quickChat" /* QuickChat */))),
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 12 /* PageDown */,
        mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 12 /* PageDown */ },
        weight: 200 /* WorkbenchContrib */
      },
      icon: Codicon.arrowRight,
      menu: {
        ...accessibleViewMenu,
        when: ContextKeyExpr.and(accessibleViewIsShown, accessibleViewContainsCodeBlocks)
      },
      title: localize(7796, null)
    });
  }
  run(accessor) {
    accessor.get(IAccessibleViewService).navigateToCodeBlock("next");
  }
};

registerAction2(AccessibleViewNextCodeBlockAction);

var AccessibleViewPreviousCodeBlockAction = class extends Action2 {
  constructor() {
    super({
      id: "editor.action.accessibleViewPreviousCodeBlock" /* PreviousCodeBlock */,
      precondition: ContextKeyExpr.and(accessibleViewContainsCodeBlocks, ContextKeyExpr.or(ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "panelChat" /* PanelChat */), ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "inlineChat" /* InlineChat */), ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "quickChat" /* QuickChat */))),
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 11 /* PageUp */,
        mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 11 /* PageUp */ },
        weight: 200 /* WorkbenchContrib */
      },
      icon: Codicon.arrowLeft,
      menu: {
        ...accessibleViewMenu,
        when: ContextKeyExpr.and(accessibleViewIsShown, accessibleViewContainsCodeBlocks)
      },
      title: localize(7798, null)
    });
  }
  run(accessor) {
    accessor.get(IAccessibleViewService).navigateToCodeBlock("previous");
  }
};

registerAction2(AccessibleViewPreviousCodeBlockAction);

var AccessibleViewPreviousAction = class extends Action2 {
  constructor() {
    super({
      id: "editor.action.accessibleViewPrevious" /* ShowPrevious */,
      precondition: ContextKeyExpr.and(accessibleViewIsShown, accessibleViewSupportsNavigation),
      keybinding: {
        primary: 512 /* Alt */ | 92 /* BracketLeft */,
        weight: 200 /* WorkbenchContrib */
      },
      icon: Codicon.arrowUp,
      menu: [
        commandPalette,
        {
          ...accessibleViewMenu,
          when: ContextKeyExpr.and(accessibleViewIsShown, accessibleViewSupportsNavigation)
        }
      ],
      title: localize(7797, null)
    });
  }
  run(accessor) {
    accessor.get(IAccessibleViewService).previous();
  }
};

registerAction2(AccessibleViewPreviousAction);

var AccessibleViewGoToSymbolAction = class extends Action2 {
  constructor() {
    super({
      id: "editor.action.accessibleViewGoToSymbol" /* GoToSymbol */,
      precondition: ContextKeyExpr.and(ContextKeyExpr.or(accessibleViewIsShown, accessibilityHelpIsShown), accessibleViewGoToSymbolSupported),
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 45 /* KeyO */,
        secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 89 /* Period */],
        weight: 200 /* WorkbenchContrib */ + 10
      },
      icon: Codicon.symbolMisc,
      menu: [
        commandPalette,
        {
          ...accessibleViewMenu,
          when: ContextKeyExpr.and(ContextKeyExpr.or(accessibleViewIsShown, accessibilityHelpIsShown), accessibleViewGoToSymbolSupported)
        }
      ],
      title: localize(7794, null)
    });
  }
  run(accessor) {
    accessor.get(IAccessibleViewService).goToSymbol();
  }
};

registerAction2(AccessibleViewGoToSymbolAction);

function registerCommand4(command4) {
  command4.register();
  return command4;
}

var AccessibilityHelpAction = registerCommand4(new MultiCommand({
  id: "editor.action.accessibilityHelp" /* OpenAccessibilityHelp */,
  precondition: void 0,
  kbOpts: {
    primary: 512 /* Alt */ | 59 /* F1 */,
    weight: 200 /* WorkbenchContrib */,
    linux: {
      primary: 512 /* Alt */ | 1024 /* Shift */ | 59 /* F1 */,
      secondary: [512 /* Alt */ | 59 /* F1 */]
    },
    kbExpr: accessibilityHelpIsShown.toNegated()
  },
  menuOpts: [{
    menuId: MenuId.CommandPalette,
    group: "",
    title: localize(7787, null),
    order: 1
  }]
}));

var AccessibleViewAction = registerCommand4(new MultiCommand({
  id: "editor.action.accessibleView" /* OpenAccessibleView */,
  precondition: void 0,
  kbOpts: {
    primary: 512 /* Alt */ | 60 /* F2 */,
    weight: 200 /* WorkbenchContrib */,
    linux: {
      primary: 512 /* Alt */ | 1024 /* Shift */ | 60 /* F2 */,
      secondary: [512 /* Alt */ | 60 /* F2 */]
    }
  },
  menuOpts: [{
    menuId: MenuId.CommandPalette,
    group: "",
    title: localize(7791, null),
    order: 1
  }]
}));

var AccessibleViewDisableHintAction = class extends Action2 {
  constructor() {
    super({
      id: "editor.action.accessibleViewDisableHint" /* DisableVerbosityHint */,
      precondition: ContextKeyExpr.and(ContextKeyExpr.or(accessibleViewIsShown, accessibilityHelpIsShown), accessibleViewVerbosityEnabled),
      keybinding: {
        primary: 512 /* Alt */ | 64 /* F6 */,
        weight: 200 /* WorkbenchContrib */
      },
      icon: Codicon.bellSlash,
      menu: [
        commandPalette,
        {
          id: MenuId.AccessibleView,
          group: "navigation",
          when: ContextKeyExpr.and(ContextKeyExpr.or(accessibleViewIsShown, accessibilityHelpIsShown), accessibleViewVerbosityEnabled)
        }
      ],
      title: localize(7793, null)
    });
  }
  run(accessor) {
    accessor.get(IAccessibleViewService).disableHint();
  }
};

registerAction2(AccessibleViewDisableHintAction);

var AccessibilityHelpConfigureKeybindingsAction = class extends Action2 {
  constructor() {
    super({
      id: "editor.action.accessibilityHelpConfigureKeybindings" /* AccessibilityHelpConfigureKeybindings */,
      precondition: ContextKeyExpr.and(accessibilityHelpIsShown, accessibleViewHasUnassignedKeybindings),
      icon: Codicon.recordKeys,
      keybinding: {
        primary: 512 /* Alt */ | 41 /* KeyK */,
        weight: 200 /* WorkbenchContrib */
      },
      menu: [
        {
          id: MenuId.AccessibleView,
          group: "navigation",
          order: 3,
          when: accessibleViewHasUnassignedKeybindings
        }
      ],
      title: localize(7789, null)
    });
  }
  async run(accessor) {
    await accessor.get(IAccessibleViewService).configureKeybindings(true);
  }
};

registerAction2(AccessibilityHelpConfigureKeybindingsAction);

var AccessibilityHelpConfigureAssignedKeybindingsAction = class extends Action2 {
  constructor() {
    super({
      id: "editor.action.accessibilityHelpConfigureAssignedKeybindings" /* AccessibilityHelpConfigureAssignedKeybindings */,
      precondition: ContextKeyExpr.and(accessibilityHelpIsShown, accessibleViewHasAssignedKeybindings),
      icon: Codicon.recordKeys,
      keybinding: {
        primary: 512 /* Alt */ | 31 /* KeyA */,
        weight: 200 /* WorkbenchContrib */
      },
      menu: [
        {
          id: MenuId.AccessibleView,
          group: "navigation",
          order: 4,
          when: accessibleViewHasAssignedKeybindings
        }
      ],
      title: localize(7788, null)
    });
  }
  async run(accessor) {
    await accessor.get(IAccessibleViewService).configureKeybindings(false);
  }
};

registerAction2(AccessibilityHelpConfigureAssignedKeybindingsAction);

var AccessibilityHelpOpenHelpLinkAction = class extends Action2 {
  constructor() {
    super({
      id: "editor.action.accessibilityHelpOpenHelpLink" /* AccessibilityHelpOpenHelpLink */,
      precondition: ContextKeyExpr.and(accessibilityHelpIsShown),
      keybinding: {
        primary: 512 /* Alt */ | 38 /* KeyH */,
        weight: 200 /* WorkbenchContrib */
      },
      title: localize(7790, null)
    });
  }
  run(accessor) {
    accessor.get(IAccessibleViewService).openHelpLink();
  }
};

registerAction2(AccessibilityHelpOpenHelpLinkAction);

var AccessibleViewAcceptInlineCompletionAction = class extends Action2 {
  constructor() {
    super({
      id: "editor.action.accessibleViewAcceptInlineCompletion" /* AccessibleViewAcceptInlineCompletion */,
      precondition: ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "inlineCompletions" /* InlineCompletions */)),
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 90 /* Slash */,
        mac: { primary: 256 /* WinCtrl */ | 90 /* Slash */ },
        weight: 200 /* WorkbenchContrib */
      },
      icon: Codicon.check,
      menu: [
        commandPalette,
        {
          id: MenuId.AccessibleView,
          group: "navigation",
          order: 0,
          when: ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "inlineCompletions" /* InlineCompletions */))
        }
      ],
      title: localize(7792, null)
    });
  }
  async run(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const editor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
    if (!editor) {
      return;
    }
    const model = InlineCompletionsController.get(editor)?.model.get();
    const state = model?.state.get();
    if (!model || !state) {
      return;
    }
    await model.accept(editor);
    model.stop();
    editor.focus();
  }
};

registerAction2(AccessibleViewAcceptInlineCompletionAction);
export { registerCommand4, accessibleViewMenu, commandPalette, AccessibleViewNextAction, AccessibleViewNextCodeBlockAction, AccessibleViewPreviousCodeBlockAction, AccessibleViewPreviousAction, AccessibleViewGoToSymbolAction, AccessibilityHelpAction, AccessibleViewAction, AccessibleViewDisableHintAction, AccessibilityHelpConfigureKeybindingsAction, AccessibilityHelpConfigureAssignedKeybindingsAction, AccessibilityHelpOpenHelpLinkAction, AccessibleViewAcceptInlineCompletionAction };
