// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/quickInputActions.ts
import { KeybindingsRegistry } from "./module-0091.mjs";
import { endOfQuickInputBoxContext, inQuickInputContext, quickInputTypeContextKeyValue } from "./module-1501.mjs";
import { localize } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { InputFocusedContext } from "./module-0635.mjs";


// src/vs/platform/quickinput/browser/quickInputActions.ts
function registerQuickInputCommandAndKeybindingRule(rule, options3 = {}) {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    weight: 200 /* WorkbenchContrib */,
    when: inQuickInputContext,
    metadata: { description: localize(3201, null) },
    ...rule,
    secondary: getSecondary(rule.primary, rule.secondary ?? [], options3)
  });
}

function registerQuickPickCommandAndKeybindingRule(rule, options3 = {}) {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    weight: 200 /* WorkbenchContrib */,
    when: ContextKeyExpr.and(
      ContextKeyExpr.or(
        // Only things that use Tree widgets
        ContextKeyExpr.equals(quickInputTypeContextKeyValue, "quickPick" /* QuickPick */),
        ContextKeyExpr.equals(quickInputTypeContextKeyValue, "quickTree" /* QuickTree */)
      ),
      inQuickInputContext
    ),
    metadata: { description: localize(3204, null) },
    ...rule,
    secondary: getSecondary(rule.primary, rule.secondary ?? [], options3)
  });
}

var ctrlKeyMod3 = isMacintosh ? 256 /* WinCtrl */ : 2048 /* CtrlCmd */;

function getSecondary(primary, secondary, options3 = {}) {
  if (options3.withAltMod) {
    secondary.push(512 /* Alt */ + primary);
  }
  if (options3.withCtrlMod) {
    secondary.push(ctrlKeyMod3 + primary);
    if (options3.withAltMod) {
      secondary.push(512 /* Alt */ + ctrlKeyMod3 + primary);
    }
  }
  if (options3.withShiftMod) {
    secondary.push(1024 /* Shift */ + primary);
    if (options3.withAltMod) {
      secondary.push(512 /* Alt */ + 1024 /* Shift */ + primary);
    }
    if (options3.withCtrlMod) {
      secondary.push(ctrlKeyMod3 + 1024 /* Shift */ + primary);
      if (options3.withAltMod) {
        secondary.push(512 /* Alt */ + ctrlKeyMod3 + 1024 /* Shift */ + primary);
      }
    }
  }
  if (options3.withCmdMod && isMacintosh) {
    secondary.push(2048 /* CtrlCmd */ + primary);
    if (options3.withCtrlMod) {
      secondary.push(2048 /* CtrlCmd */ + 256 /* WinCtrl */ + primary);
    }
    if (options3.withAltMod) {
      secondary.push(2048 /* CtrlCmd */ + 512 /* Alt */ + primary);
      if (options3.withCtrlMod) {
        secondary.push(2048 /* CtrlCmd */ + 512 /* Alt */ + 256 /* WinCtrl */ + primary);
      }
    }
  }
  return secondary;
}

function focusHandler(focus, focusOnQuickNatigate) {
  return (accessor) => {
    const currentQuickPick = accessor.get(IQuickInputService).currentQuickInput;
    if (!currentQuickPick) {
      return;
    }
    if (focusOnQuickNatigate && currentQuickPick.quickNavigate) {
      return currentQuickPick.focus(focusOnQuickNatigate);
    }
    return currentQuickPick.focus(focus);
  };
}

registerQuickPickCommandAndKeybindingRule(
  { id: "quickInput.pageNext", primary: 12 /* PageDown */, handler: focusHandler(6 /* NextPage */) },
  { withAltMod: true, withCtrlMod: true, withCmdMod: true }
);

registerQuickPickCommandAndKeybindingRule(
  { id: "quickInput.pagePrevious", primary: 11 /* PageUp */, handler: focusHandler(7 /* PreviousPage */) },
  { withAltMod: true, withCtrlMod: true, withCmdMod: true }
);

registerQuickPickCommandAndKeybindingRule(
  { id: "quickInput.first", primary: ctrlKeyMod3 + 14 /* Home */, handler: focusHandler(1 /* First */) },
  { withAltMod: true, withCmdMod: true }
);

registerQuickPickCommandAndKeybindingRule(
  { id: "quickInput.last", primary: ctrlKeyMod3 + 13 /* End */, handler: focusHandler(3 /* Last */) },
  { withAltMod: true, withCmdMod: true }
);

registerQuickPickCommandAndKeybindingRule(
  { id: "quickInput.next", primary: 18 /* DownArrow */, handler: focusHandler(4 /* Next */) },
  { withCtrlMod: true }
);

registerQuickPickCommandAndKeybindingRule(
  { id: "quickInput.previous", primary: 16 /* UpArrow */, handler: focusHandler(5 /* Previous */) },
  { withCtrlMod: true }
);

var nextSeparatorFallbackDesc = localize(3202, null);

var prevSeparatorFallbackDesc = localize(3203, null);

if (isMacintosh) {
  registerQuickPickCommandAndKeybindingRule(
    {
      id: "quickInput.nextSeparatorWithQuickAccessFallback",
      primary: 2048 /* CtrlCmd */ + 18 /* DownArrow */,
      handler: focusHandler(8 /* NextSeparator */, 4 /* Next */),
      metadata: { description: nextSeparatorFallbackDesc }
    }
  );
  registerQuickPickCommandAndKeybindingRule(
    {
      id: "quickInput.nextSeparator",
      primary: 2048 /* CtrlCmd */ + 512 /* Alt */ + 18 /* DownArrow */,
      // Since macOS has the cmd key as the primary modifier, we need to add this additional
      // keybinding to capture cmd+ctrl+upArrow
      secondary: [2048 /* CtrlCmd */ + 256 /* WinCtrl */ + 18 /* DownArrow */],
      handler: focusHandler(8 /* NextSeparator */)
    },
    { withCtrlMod: true }
  );
  registerQuickPickCommandAndKeybindingRule(
    {
      id: "quickInput.previousSeparatorWithQuickAccessFallback",
      primary: 2048 /* CtrlCmd */ + 16 /* UpArrow */,
      handler: focusHandler(9 /* PreviousSeparator */, 5 /* Previous */),
      metadata: { description: prevSeparatorFallbackDesc }
    }
  );
  registerQuickPickCommandAndKeybindingRule(
    {
      id: "quickInput.previousSeparator",
      primary: 2048 /* CtrlCmd */ + 512 /* Alt */ + 16 /* UpArrow */,
      // Since macOS has the cmd key as the primary modifier, we need to add this additional
      // keybinding to capture cmd+ctrl+upArrow
      secondary: [2048 /* CtrlCmd */ + 256 /* WinCtrl */ + 16 /* UpArrow */],
      handler: focusHandler(9 /* PreviousSeparator */)
    },
    { withCtrlMod: true }
  );
} else {
  registerQuickPickCommandAndKeybindingRule(
    {
      id: "quickInput.nextSeparatorWithQuickAccessFallback",
      primary: 512 /* Alt */ + 18 /* DownArrow */,
      handler: focusHandler(8 /* NextSeparator */, 4 /* Next */),
      metadata: { description: nextSeparatorFallbackDesc }
    }
  );
  registerQuickPickCommandAndKeybindingRule(
    {
      id: "quickInput.nextSeparator",
      primary: 2048 /* CtrlCmd */ + 512 /* Alt */ + 18 /* DownArrow */,
      handler: focusHandler(8 /* NextSeparator */)
    }
  );
  registerQuickPickCommandAndKeybindingRule(
    {
      id: "quickInput.previousSeparatorWithQuickAccessFallback",
      primary: 512 /* Alt */ + 16 /* UpArrow */,
      handler: focusHandler(9 /* PreviousSeparator */, 5 /* Previous */),
      metadata: { description: prevSeparatorFallbackDesc }
    }
  );
  registerQuickPickCommandAndKeybindingRule(
    {
      id: "quickInput.previousSeparator",
      primary: 2048 /* CtrlCmd */ + 512 /* Alt */ + 16 /* UpArrow */,
      handler: focusHandler(9 /* PreviousSeparator */)
    }
  );
}

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "quickInput.accept",
  primary: 3 /* Enter */,
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(
    // All other kinds of Quick things handle Accept, except Widget. In other words, Accepting is a detail on the things
    // that extend IQuickInput
    ContextKeyExpr.notEquals(quickInputTypeContextKeyValue, "quickWidget" /* QuickWidget */),
    inQuickInputContext
  ),
  metadata: { description: localize(3200, null) },
  handler: (accessor) => {
    const currentQuickPick = accessor.get(IQuickInputService).currentQuickInput;
    currentQuickPick?.accept();
  },
  secondary: getSecondary(3 /* Enter */, [], { withAltMod: true, withCtrlMod: true, withCmdMod: true, withShiftMod: true })
});

registerQuickPickCommandAndKeybindingRule(
  {
    id: "quickInput.acceptInBackground",
    // If we are in the quick pick but the input box is not focused or our cursor is at the end of the input box
    when: ContextKeyExpr.and(
      inQuickInputContext,
      ContextKeyExpr.equals(quickInputTypeContextKeyValue, "quickPick" /* QuickPick */),
      ContextKeyExpr.or(InputFocusedContext.negate(), endOfQuickInputBoxContext)
    ),
    primary: 17 /* RightArrow */,
    // Need a little extra weight to ensure this keybinding is preferred over the default cmd+alt+right arrow keybinding
    // https://github.com/microsoft/vscode/blob/1451e4fbbbf074a4355cc537c35b547b80ce1c52/src/vs/workbench/browser/parts/editor/editorActions.ts#L1178-L1195
    weight: 200 /* WorkbenchContrib */ + 50,
    handler: (accessor) => {
      const currentQuickPick = accessor.get(IQuickInputService).currentQuickInput;
      currentQuickPick?.accept(true);
    }
  },
  { withAltMod: true, withCtrlMod: true, withCmdMod: true }
);

registerQuickInputCommandAndKeybindingRule(
  {
    id: "quickInput.hide",
    primary: 9 /* Escape */,
    handler: (accessor) => {
      const currentQuickPick = accessor.get(IQuickInputService).currentQuickInput;
      currentQuickPick?.hide();
    }
  },
  { withAltMod: true, withCtrlMod: true, withCmdMod: true }
);

registerQuickPickCommandAndKeybindingRule(
  {
    id: "quickInput.toggleCheckbox",
    when: ContextKeyExpr.and(
      inQuickInputContext,
      ContextKeyExpr.or(
        ContextKeyExpr.equals(quickInputTypeContextKeyValue, "quickPick" /* QuickPick */),
        ContextKeyExpr.equals(quickInputTypeContextKeyValue, "quickTree" /* QuickTree */)
      ),
      InputFocusedContext.negate()
    ),
    primary: 10 /* Space */,
    handler: (accessor) => {
      const quickInputService = accessor.get(IQuickInputService);
      quickInputService.toggle();
    }
  }
);

registerQuickPickCommandAndKeybindingRule(
  {
    id: "quickInput.toggleHover",
    primary: ctrlKeyMod3 | 10 /* Space */,
    handler: (accessor) => {
      const quickInputService = accessor.get(IQuickInputService);
      quickInputService.toggleHover();
    }
  }
);
export { registerQuickInputCommandAndKeybindingRule, registerQuickPickCommandAndKeybindingRule, getSecondary, focusHandler, ctrlKeyMod3, nextSeparatorFallbackDesc, prevSeparatorFallbackDesc };
