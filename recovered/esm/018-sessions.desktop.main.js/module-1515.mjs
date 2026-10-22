// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/actions/quickAccessActions.ts
import { KeybindingsRegistry } from "./module-0091.mjs";
import { defaultQuickAccessContext, getQuickNavigateHandler, inQuickPickContext } from "./module-1510.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { ChatAIDisabledSettingId } from "./module-0951.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/workbench/browser/actions/quickAccessActions.ts
var UNIFIED_AGENTS_BAR_SETTING = "chat.unifiedAgentsBar.enabled";

var globalQuickAccessKeybinding = {
  primary: 2048 /* CtrlCmd */ | 46 /* KeyP */,
  secondary: [2048 /* CtrlCmd */ | 35 /* KeyE */],
  mac: { primary: 2048 /* CtrlCmd */ | 46 /* KeyP */, secondary: void 0 }
};

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.closeQuickOpen",
  weight: 200 /* WorkbenchContrib */,
  when: inQuickPickContext,
  primary: 9 /* Escape */,
  secondary: [1024 /* Shift */ | 9 /* Escape */],
  handler: (accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    return quickInputService.cancel(2 /* Gesture */);
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.acceptSelectedQuickOpenItem",
  weight: 200 /* WorkbenchContrib */,
  when: inQuickPickContext,
  primary: 0,
  handler: (accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    return quickInputService.accept();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.alternativeAcceptSelectedQuickOpenItem",
  weight: 200 /* WorkbenchContrib */,
  when: inQuickPickContext,
  primary: 0,
  handler: (accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    return quickInputService.accept({ ctrlCmd: true, alt: false, shift: false });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.focusQuickOpen",
  weight: 200 /* WorkbenchContrib */,
  when: inQuickPickContext,
  primary: 0,
  handler: (accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.focus();
  }
});

var quickAccessNavigateNextInFilePickerId = "workbench.action.quickOpenNavigateNextInFilePicker";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: quickAccessNavigateNextInFilePickerId,
  weight: 200 /* WorkbenchContrib */ + 50,
  handler: getQuickNavigateHandler(quickAccessNavigateNextInFilePickerId, true),
  when: defaultQuickAccessContext,
  primary: globalQuickAccessKeybinding.primary,
  secondary: globalQuickAccessKeybinding.secondary,
  mac: globalQuickAccessKeybinding.mac
});

var quickAccessNavigatePreviousInFilePickerId = "workbench.action.quickOpenNavigatePreviousInFilePicker";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: quickAccessNavigatePreviousInFilePickerId,
  weight: 200 /* WorkbenchContrib */ + 50,
  handler: getQuickNavigateHandler(quickAccessNavigatePreviousInFilePickerId, false),
  when: defaultQuickAccessContext,
  primary: globalQuickAccessKeybinding.primary | 1024 /* Shift */,
  secondary: [globalQuickAccessKeybinding.secondary[0] | 1024 /* Shift */],
  mac: {
    primary: globalQuickAccessKeybinding.mac.primary | 1024 /* Shift */,
    secondary: void 0
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.quickPickManyToggle",
  weight: 200 /* WorkbenchContrib */,
  when: inQuickPickContext,
  primary: 0,
  handler: (accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.toggle();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.quickInputBack",
  weight: 200 /* WorkbenchContrib */ + 50,
  when: inQuickPickContext,
  primary: 0,
  win: { primary: 512 /* Alt */ | 15 /* LeftArrow */ },
  mac: { primary: 256 /* WinCtrl */ | 88 /* Minus */ },
  linux: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 88 /* Minus */ },
  handler: (accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.back();
  }
});

registerAction2(class QuickAccessAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.quickOpen",
      title: localize2(6123, "Go to File..."),
      metadata: {
        description: `Quick access`,
        args: [{
          name: "prefix",
          schema: {
            "type": "string"
          }
        }]
      },
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: globalQuickAccessKeybinding.primary,
        secondary: globalQuickAccessKeybinding.secondary,
        mac: globalQuickAccessKeybinding.mac
      },
      f1: true
    });
  }
  run(accessor, prefix) {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.quickAccess.show(typeof prefix === "string" ? prefix : void 0, {
      preserveValue: typeof prefix === "string"
      /* preserve as is if provided */
    });
  }
});

registerAction2(class QuickAccessAction2 extends Action2 {
  constructor() {
    super({
      id: "workbench.action.quickOpenWithModes",
      title: localize(6124, null),
      icon: Codicon.search,
      menu: {
        id: MenuId.CommandCenterCenter,
        order: 100
      }
    });
  }
  async run(accessor) {
    const openClassicQuickAccess = () => {
      const quickInputService = accessor.get(IQuickInputService);
      const providerOptions = {
        includeHelp: true,
        from: "commandCenter"
      };
      quickInputService.quickAccess.show(void 0, {
        preserveValue: true,
        providerOptions
      });
    };
    const configurationService = accessor.get(IConfigurationService);
    const commandService = accessor.get(ICommandService);
    const aiFeaturesDisabled = configurationService.getValue(ChatAIDisabledSettingId) === true;
    const useUnifiedQuickAccess = !aiFeaturesDisabled && configurationService.getValue(UNIFIED_AGENTS_BAR_SETTING) === true;
    if (useUnifiedQuickAccess) {
      try {
        await commandService.executeCommand("workbench.action.unifiedQuickAccess");
      } catch {
        openClassicQuickAccess();
      }
      return;
    }
    openClassicQuickAccess();
  }
});

CommandsRegistry.registerCommand("workbench.action.quickOpenPreviousEditor", async (accessor) => {
  const quickInputService = accessor.get(IQuickInputService);
  quickInputService.quickAccess.show("", { itemActivation: 2 /* SECOND */ });
});

var BaseQuickAccessNavigateAction = class extends Action2 {
  constructor(id2, title, next, quickNavigate, keybinding) {
    super({ id: id2, title, f1: true, keybinding });
    this.id = id2;
    this.next = next;
    this.quickNavigate = quickNavigate;
  }
  async run(accessor) {
    const keybindingService = accessor.get(IKeybindingService);
    const quickInputService = accessor.get(IQuickInputService);
    const keys = keybindingService.lookupKeybindings(this.id);
    const quickNavigate = this.quickNavigate ? { keybindings: keys } : void 0;
    quickInputService.navigate(this.next, quickNavigate);
  }
};

var QuickAccessNavigateNextAction = class extends BaseQuickAccessNavigateAction {
  constructor() {
    super("workbench.action.quickOpenNavigateNext", localize2(6121, "Navigate Next in Quick Open"), true, true);
  }
};

var QuickAccessNavigatePreviousAction = class extends BaseQuickAccessNavigateAction {
  constructor() {
    super("workbench.action.quickOpenNavigatePrevious", localize2(6122, "Navigate Previous in Quick Open"), false, true);
  }
};

var QuickAccessSelectNextAction = class extends BaseQuickAccessNavigateAction {
  constructor() {
    super(
      "workbench.action.quickOpenSelectNext",
      localize2(6125, "Select Next in Quick Open"),
      true,
      false,
      {
        weight: 200 /* WorkbenchContrib */ + 50,
        when: inQuickPickContext,
        primary: 0,
        mac: { primary: 256 /* WinCtrl */ | 44 /* KeyN */ }
      }
    );
  }
};

var QuickAccessSelectPreviousAction = class extends BaseQuickAccessNavigateAction {
  constructor() {
    super(
      "workbench.action.quickOpenSelectPrevious",
      localize2(6126, "Select Previous in Quick Open"),
      false,
      false,
      {
        weight: 200 /* WorkbenchContrib */ + 50,
        when: inQuickPickContext,
        primary: 0,
        mac: { primary: 256 /* WinCtrl */ | 46 /* KeyP */ }
      }
    );
  }
};

registerAction2(QuickAccessSelectNextAction);

registerAction2(QuickAccessSelectPreviousAction);

registerAction2(QuickAccessNavigateNextAction);

registerAction2(QuickAccessNavigatePreviousAction);
export { UNIFIED_AGENTS_BAR_SETTING, globalQuickAccessKeybinding, quickAccessNavigateNextInFilePickerId, quickAccessNavigatePreviousInFilePickerId, BaseQuickAccessNavigateAction, QuickAccessNavigateNextAction, QuickAccessNavigatePreviousAction, QuickAccessSelectNextAction, QuickAccessSelectPreviousAction };
