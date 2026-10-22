// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/quickaccess/browser/quickAccess.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions18 } from "./module-1560.mjs";
import { HelpQuickAccessProvider } from "./module-3083.mjs";
import { localize } from "./module-0001.mjs";
import { OpenViewPickerAction, QuickAccessViewPickerAction, ViewQuickAccessProvider } from "./module-3084.mjs";
import { ClearCommandHistoryAction, CommandsQuickAccessProvider, ShowAllCommandsAction } from "./module-3087.mjs";
import { MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { getQuickNavigateHandler, inQuickPickContext } from "./module-1518.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";


// src/vs/workbench/contrib/quickaccess/browser/quickAccess.contribution.ts
var quickAccessRegistry2 = Registry.as(Extensions18.Quickaccess);

quickAccessRegistry2.registerQuickAccessProvider({
  ctor: HelpQuickAccessProvider,
  prefix: HelpQuickAccessProvider.PREFIX,
  placeholder: localize(18435, null, HelpQuickAccessProvider.PREFIX),
  helpEntries: [{
    description: localize(18434, null),
    commandCenterOrder: 70,
    commandCenterLabel: localize(18440, null)
  }]
});

quickAccessRegistry2.registerQuickAccessProvider({
  ctor: ViewQuickAccessProvider,
  prefix: ViewQuickAccessProvider.PREFIX,
  contextKey: "inViewsPicker",
  placeholder: localize(18442, null),
  helpEntries: [{ description: localize(18441, null), commandId: OpenViewPickerAction.ID }]
});

quickAccessRegistry2.registerQuickAccessProvider({
  ctor: CommandsQuickAccessProvider,
  prefix: CommandsQuickAccessProvider.PREFIX,
  contextKey: "inCommandsPicker",
  placeholder: localize(18433, null),
  helpEntries: [{ description: localize(18432, null), commandId: ShowAllCommandsAction.ID, commandCenterOrder: 20 }]
});

MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
  group: "1_open",
  command: {
    id: ShowAllCommandsAction.ID,
    title: localize(18436, null)
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
  group: "1_welcome",
  command: {
    id: ShowAllCommandsAction.ID,
    title: localize(18439, null)
  },
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
  group: "1_open",
  command: {
    id: OpenViewPickerAction.ID,
    title: localize(18438, null)
  },
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarGoMenu, {
  group: "5_infile_nav",
  command: {
    id: "workbench.action.gotoLine",
    title: localize(18437, null)
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
  group: "1_command",
  command: {
    id: ShowAllCommandsAction.ID,
    title: localize(18431, null)
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.EditorContext, {
  group: "z_commands",
  when: EditorContextKeys.editorSimpleInput.toNegated(),
  command: {
    id: ShowAllCommandsAction.ID,
    title: localize(18431, null)
  },
  order: 1
});

registerAction2(ClearCommandHistoryAction);

registerAction2(ShowAllCommandsAction);

registerAction2(OpenViewPickerAction);

registerAction2(QuickAccessViewPickerAction);

var inViewsPickerContextKey = "inViewsPicker";

var inViewsPickerContext = ContextKeyExpr.and(inQuickPickContext, ContextKeyExpr.has(inViewsPickerContextKey));

var viewPickerKeybinding = QuickAccessViewPickerAction.KEYBINDING;

var quickAccessNavigateNextInViewPickerId = "workbench.action.quickOpenNavigateNextInViewPicker";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: quickAccessNavigateNextInViewPickerId,
  weight: 200 /* WorkbenchContrib */ + 50,
  handler: getQuickNavigateHandler(quickAccessNavigateNextInViewPickerId, true),
  when: inViewsPickerContext,
  primary: viewPickerKeybinding.primary,
  linux: viewPickerKeybinding.linux,
  mac: viewPickerKeybinding.mac
});

var quickAccessNavigatePreviousInViewPickerId = "workbench.action.quickOpenNavigatePreviousInViewPicker";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: quickAccessNavigatePreviousInViewPickerId,
  weight: 200 /* WorkbenchContrib */ + 50,
  handler: getQuickNavigateHandler(quickAccessNavigatePreviousInViewPickerId, false),
  when: inViewsPickerContext,
  primary: viewPickerKeybinding.primary | 1024 /* Shift */,
  linux: viewPickerKeybinding.linux,
  mac: {
    primary: viewPickerKeybinding.mac.primary | 1024 /* Shift */
  }
});
export { quickAccessRegistry2, inViewsPickerContextKey, inViewsPickerContext, viewPickerKeybinding, quickAccessNavigateNextInViewPickerId, quickAccessNavigatePreviousInViewPickerId };
