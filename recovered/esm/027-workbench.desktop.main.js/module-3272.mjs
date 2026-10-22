// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalActions.ts
import { localize, localize2 } from "./module-0001.mjs";
import { terminalStrings } from "./module-3261.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { PICK_WORKSPACE_FOLDER_COMMAND_ID } from "./module-1521.mjs";
import { Action } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { InstanceContext } from "./module-3268.mjs";
import { Iterable } from "./module-0011.mjs";
import { ITerminalConfigurationService, ITerminalEditingService, ITerminalEditorService, ITerminalGroupService, ITerminalInstanceService, ITerminalService } from "./module-1149.mjs";
import { ITerminalProfileResolverService, ITerminalProfileService, TERMINAL_VIEW_ID } from "./module-1173.mjs";
import { hasKey, isObject, isString } from "./module-0010.mjs";
import { ACTIVE_GROUP, AUX_WINDOW_GROUP, SIDE_GROUP } from "./module-0934.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { editorGroupToColumn } from "./module-1078.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { accessibleViewCurrentProviderId, accessibleViewIsShown, accessibleViewOnLastLine } from "./module-1370.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { isWindows } from "./module-0014.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { Schemas } from "./module-0033.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { URI } from "./module-0032.mjs";
import { Codicon } from "./module-0085.mjs";
import { ResourceContextKey } from "./module-0949.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IThemeService } from "./module-0287.mjs";
import { getColorClass, getIconId, getUriClasses } from "./module-1175.mjs";
import { killTerminalIcon, newTerminalIcon } from "./module-2351.mjs";
import { getActiveWindow, isKeyboardEvent, isMouseEvent, isPointerEvent } from "./module-0075.mjs";
import { isAuxiliaryWindow } from "./module-0002.mjs";
import { CLOSE_EDITOR_COMMAND_ID } from "./module-1538.mjs";
import { KeyChord } from "./module-0019.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { SeparatorSelectOption } from "./module-0475.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IListService } from "./module-0636.mjs";
import { TerminalTabList } from "./module-3271.mjs";
import { createProfileSchemaEnums } from "./module-1159.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IConfigurationResolverService } from "./module-1405.mjs";
import { dirname2 } from "./module-0034.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { isAbsolute } from "./module-0026.mjs";
import { ConfigurationResolverExpression } from "./module-1406.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalActions.ts
var switchTerminalShowTabsTitle = localize(19927, null);

var category6 = terminalStrings.actionCategory;

var sharedWhenClause = (() => {
  const terminalAvailable = ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated);
  return {
    terminalAvailable,
    terminalAvailable_and_opened: ContextKeyExpr.and(terminalAvailable, TerminalContextKeys.isOpen),
    terminalAvailable_and_editorActive: ContextKeyExpr.and(terminalAvailable, TerminalContextKeys.terminalEditorActive),
    terminalAvailable_and_singularSelection: ContextKeyExpr.and(terminalAvailable, TerminalContextKeys.tabsSingularSelection),
    focusInAny_and_normalBuffer: ContextKeyExpr.and(TerminalContextKeys.focusInAny, TerminalContextKeys.altBufferActive.negate())
  };
})();

async function getCwdForSplit(instance2, folders, commandService, configService) {
  switch (configService.config.splitCwd) {
    case "workspaceRoot":
      if (folders !== void 0 && commandService !== void 0) {
        if (folders.length === 1) {
          return folders[0].uri;
        } else if (folders.length > 1) {
          const options3 = {
            placeHolder: localize(19952, null)
          };
          const workspace = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID, [options3]);
          if (!workspace) {
            return void 0;
          }
          return Promise.resolve(workspace.uri);
        }
      }
      return "";
    case "initial":
      return instance2.getInitialCwd();
    case "inherited":
      return instance2.getSpeculativeCwd();
  }
}

var TerminalLaunchHelpAction = class extends Action {
  constructor(_openerService) {
    super("workbench.action.terminal.launchHelp", localize(19928, null));
    this._openerService = _openerService;
  }
  async run() {
    this._openerService.open("https://aka.ms/vscode-troubleshoot-terminal-launch");
  }
};

TerminalLaunchHelpAction = __decorateClass([
  __decorateParam(0, IOpenerService)
], TerminalLaunchHelpAction);

function registerTerminalAction(options3) {
  options3.f1 = options3.f1 ?? true;
  options3.category = options3.category ?? category6;
  options3.precondition = options3.precondition ?? TerminalContextKeys.processSupported;
  const runFunc = options3.run;
  const strictOptions = options3;
  delete strictOptions["run"];
  return registerAction2(class extends Action2 {
    constructor() {
      super(strictOptions);
    }
    run(accessor, args2, args22) {
      return runFunc(getTerminalServices(accessor), accessor, args2, args22);
    }
  });
}

function parseActionArgs(args2) {
  if (Array.isArray(args2)) {
    if (args2.every((e) => e instanceof InstanceContext)) {
      return args2;
    }
  } else if (args2 instanceof InstanceContext) {
    return [args2];
  }
  return void 0;
}

function registerContextualInstanceAction(options3) {
  const originalRun = options3.run;
  return registerTerminalAction({
    ...options3,
    run: async (c, accessor, focusedInstanceArgs, allInstanceArgs) => {
      let instances = getSelectedViewInstances2(accessor, allInstanceArgs);
      if (!instances) {
        const activeInstance = (options3.activeInstanceType === "view" ? c.groupService : options3.activeInstanceType === "editor" ? c.editorService : c.service).activeInstance;
        if (!activeInstance) {
          return;
        }
        instances = [activeInstance];
      }
      const results = [];
      for (const instance2 of instances) {
        results.push(originalRun(instance2, c, accessor, focusedInstanceArgs));
      }
      await Promise.all(results);
      if (options3.runAfter) {
        options3.runAfter(instances, c, accessor, focusedInstanceArgs);
      }
    }
  });
}

function registerActiveInstanceAction(options3) {
  const originalRun = options3.run;
  return registerTerminalAction({
    ...options3,
    run: (c, accessor, args2) => {
      const activeInstance = c.service.activeInstance;
      if (activeInstance) {
        return originalRun(activeInstance, c, accessor, args2);
      }
    }
  });
}

function registerActiveXtermAction(options3) {
  const originalRun = options3.run;
  return registerTerminalAction({
    ...options3,
    run: (c, accessor, args2) => {
      const activeDetached = Iterable.find(c.service.detachedInstances, (d) => d.xterm.isFocused);
      if (activeDetached) {
        return originalRun(activeDetached.xterm, accessor, activeDetached, args2);
      }
      const activeInstance = c.service.activeInstance;
      if (activeInstance?.xterm) {
        return originalRun(activeInstance.xterm, accessor, activeInstance, args2);
      }
    }
  });
}

function getTerminalServices(accessor) {
  return {
    service: accessor.get(ITerminalService),
    configService: accessor.get(ITerminalConfigurationService),
    groupService: accessor.get(ITerminalGroupService),
    instanceService: accessor.get(ITerminalInstanceService),
    editorService: accessor.get(ITerminalEditorService),
    editingService: accessor.get(ITerminalEditingService),
    profileService: accessor.get(ITerminalProfileService),
    profileResolverService: accessor.get(ITerminalProfileResolverService)
  };
}

function registerTerminalActions() {
  registerTerminalAction({
    id: "workbench.action.terminal.newInActiveWorkspace" /* NewInActiveWorkspace */,
    title: localize2(19948, "Create New Terminal (In Active Workspace)"),
    run: async (c) => {
      if (c.service.isProcessSupportRegistered) {
        const instance2 = await c.service.createTerminal({ location: c.configService.defaultLocation });
        if (!instance2) {
          return;
        }
        c.service.setActiveInstance(instance2);
        await focusActiveTerminal(instance2, c);
      }
    }
  });
  refreshTerminalActions([]);
  registerTerminalAction({
    id: "workbench.action.createTerminalEditor" /* CreateTerminalEditor */,
    title: localize2(19932, "Create New Terminal in Editor Area"),
    run: async (c, _, args2) => {
      function isCreateTerminalOptions(obj) {
        return isObject(obj) && "location" in obj;
      }
      const options3 = isCreateTerminalOptions(args2) ? args2 : { location: { viewColumn: ACTIVE_GROUP } };
      const instance2 = await c.service.createTerminal(options3);
      await instance2.focusWhenReady();
    }
  });
  registerTerminalAction({
    id: "workbench.action.createTerminalEditorSameGroup" /* CreateTerminalEditorSameGroup */,
    title: localize2(19932, "Create New Terminal in Editor Area"),
    f1: false,
    run: async (c, accessor, args2) => {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      const instance2 = await c.service.createTerminal({
        location: {
          viewColumn: editorGroupToColumn(editorGroupsService, editorGroupsService.activeGroup)
        }
      });
      await instance2.focusWhenReady();
    }
  });
  registerTerminalAction({
    id: "workbench.action.createTerminalEditorSide" /* CreateTerminalEditorSide */,
    title: localize2(19933, "Create New Terminal in Editor Area to the Side"),
    run: async (c) => {
      const instance2 = await c.service.createTerminal({
        location: { viewColumn: SIDE_GROUP }
      });
      await instance2.focusWhenReady();
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.newInNewWindow" /* NewInNewWindow */,
    title: terminalStrings.newInNewWindow,
    precondition: sharedWhenClause.terminalAvailable,
    keybinding: {
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 91 /* Backquote */,
      mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 512 /* Alt */ | 91 /* Backquote */ },
      weight: 200 /* WorkbenchContrib */
    },
    run: async (c) => {
      const instance2 = await c.service.createTerminal({
        location: {
          viewColumn: AUX_WINDOW_GROUP,
          auxiliary: { compact: true }
        }
      });
      await instance2.focusWhenReady();
    }
  });
  registerContextualInstanceAction({
    id: "workbench.action.terminal.moveToEditor" /* MoveToEditor */,
    title: terminalStrings.moveToEditor,
    precondition: sharedWhenClause.terminalAvailable_and_opened,
    activeInstanceType: "view",
    run: (instance2, c) => c.service.moveToEditor(instance2),
    runAfter: (instances) => instances.at(-1)?.focus()
  });
  registerContextualInstanceAction({
    id: "workbench.action.terminal.moveIntoNewWindow" /* MoveIntoNewWindow */,
    title: terminalStrings.moveIntoNewWindow,
    precondition: sharedWhenClause.terminalAvailable_and_opened,
    run: (instance2, c) => c.service.moveIntoNewEditor(instance2),
    runAfter: (instances) => instances.at(-1)?.focus()
  });
  registerTerminalAction({
    id: "workbench.action.terminal.moveToTerminalPanel" /* MoveToTerminalPanel */,
    title: terminalStrings.moveToTerminalPanel,
    precondition: sharedWhenClause.terminalAvailable_and_editorActive,
    run: (c, _, args2) => {
      const source = toOptionalUri(args2) ?? c.editorService.activeInstance;
      if (source) {
        c.service.moveToTerminalView(source);
      }
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.focusPreviousPane" /* FocusPreviousPane */,
    title: localize2(19939, "Focus Previous Terminal in Terminal Group"),
    keybinding: {
      primary: 512 /* Alt */ | 15 /* LeftArrow */,
      secondary: [512 /* Alt */ | 16 /* UpArrow */],
      mac: {
        primary: 512 /* Alt */ | 2048 /* CtrlCmd */ | 15 /* LeftArrow */,
        secondary: [512 /* Alt */ | 2048 /* CtrlCmd */ | 16 /* UpArrow */]
      },
      when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.splitTerminalActive),
      // Should win over send sequence commands https://github.com/microsoft/vscode/issues/259326
      weight: 200 /* WorkbenchContrib */ + 1
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: async (c) => {
      c.groupService.activeGroup?.focusPreviousPane();
      await c.groupService.showPanel(true);
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.focusNextPane" /* FocusNextPane */,
    title: localize2(19937, "Focus Next Terminal in Terminal Group"),
    keybinding: {
      primary: 512 /* Alt */ | 17 /* RightArrow */,
      secondary: [512 /* Alt */ | 18 /* DownArrow */],
      mac: {
        primary: 512 /* Alt */ | 2048 /* CtrlCmd */ | 17 /* RightArrow */,
        secondary: [512 /* Alt */ | 2048 /* CtrlCmd */ | 18 /* DownArrow */]
      },
      when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.splitTerminalActive),
      // Should win over send sequence commands https://github.com/microsoft/vscode/issues/259326
      weight: 200 /* WorkbenchContrib */ + 1
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: async (c) => {
      c.groupService.activeGroup?.focusNextPane();
      await c.groupService.showPanel(true);
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.resizePaneLeft" /* ResizePaneLeft */,
    title: localize2(19960, "Resize Terminal Left"),
    keybinding: {
      linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 15 /* LeftArrow */ },
      mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 15 /* LeftArrow */ },
      when: TerminalContextKeys.focus,
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: (c) => c.groupService.activeGroup?.resizePane(0 /* Left */)
  });
  registerTerminalAction({
    id: "workbench.action.terminal.resizePaneRight" /* ResizePaneRight */,
    title: localize2(19961, "Resize Terminal Right"),
    keybinding: {
      linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 17 /* RightArrow */ },
      mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 17 /* RightArrow */ },
      when: TerminalContextKeys.focus,
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: (c) => c.groupService.activeGroup?.resizePane(1 /* Right */)
  });
  registerTerminalAction({
    id: "workbench.action.terminal.resizePaneUp" /* ResizePaneUp */,
    title: localize2(19962, "Resize Terminal Up"),
    keybinding: {
      mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 16 /* UpArrow */ },
      when: TerminalContextKeys.focus,
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: (c) => c.groupService.activeGroup?.resizePane(2 /* Up */)
  });
  registerTerminalAction({
    id: "workbench.action.terminal.resizePaneDown" /* ResizePaneDown */,
    title: localize2(19959, "Resize Terminal Down"),
    keybinding: {
      mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 18 /* DownArrow */ },
      when: TerminalContextKeys.focus,
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: (c) => c.groupService.activeGroup?.resizePane(3 /* Down */)
  });
  registerTerminalAction({
    id: "workbench.action.terminal.focus" /* Focus */,
    title: terminalStrings.focus,
    keybinding: {
      when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, accessibleViewOnLastLine, accessibleViewCurrentProviderId.isEqualTo("terminal" /* Terminal */)),
      primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: async (c) => {
      const instance2 = c.service.activeInstance || await c.service.createTerminal({ location: 1 /* Panel */ });
      if (!instance2) {
        return;
      }
      c.service.setActiveInstance(instance2);
      await focusActiveTerminal(instance2, c);
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.focusTabs" /* FocusTabs */,
    title: localize2(19935, "Focus Terminal Tabs View"),
    keybinding: {
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 93 /* Backslash */,
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.or(TerminalContextKeys.tabsFocus, TerminalContextKeys.focus)
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: (c) => c.groupService.focusTabs()
  });
  registerTerminalAction({
    id: "workbench.action.terminal.focusNext" /* FocusNext */,
    title: localize2(19936, "Focus Next Terminal Group"),
    precondition: sharedWhenClause.terminalAvailable,
    keybinding: {
      primary: 2048 /* CtrlCmd */ | 12 /* PageDown */,
      mac: {
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 94 /* BracketRight */
      },
      when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.editorFocus.negate()),
      weight: 200 /* WorkbenchContrib */
    },
    run: async (c) => {
      c.groupService.setActiveGroupToNext();
      await c.groupService.showPanel(true);
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.focusPrevious" /* FocusPrevious */,
    title: localize2(19938, "Focus Previous Terminal Group"),
    precondition: sharedWhenClause.terminalAvailable,
    keybinding: {
      primary: 2048 /* CtrlCmd */ | 11 /* PageUp */,
      mac: {
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 92 /* BracketLeft */
      },
      when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.editorFocus.negate()),
      weight: 200 /* WorkbenchContrib */
    },
    run: async (c) => {
      c.groupService.setActiveGroupToPrevious();
      await c.groupService.showPanel(true);
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.runSelectedText" /* RunSelectedText */,
    title: localize2(19965, "Run Selected Text In Active Terminal"),
    run: async (c, accessor) => {
      const codeEditorService = accessor.get(ICodeEditorService);
      const editor = codeEditorService.getActiveCodeEditor();
      if (!editor || !editor.hasModel()) {
        return;
      }
      const instance2 = await c.service.getActiveOrCreateInstance({ acceptsInput: true });
      const selection = editor.getSelection();
      let text2;
      if (selection.isEmpty()) {
        text2 = editor.getModel().getLineContent(selection.selectionStartLineNumber).trim();
      } else {
        const endOfLinePreference = isWindows ? 1 /* LF */ : 2 /* CRLF */;
        text2 = editor.getModel().getValueInRange(selection, endOfLinePreference);
      }
      instance2.sendText(text2, true, true);
      await c.service.revealActiveTerminal(true);
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.runActiveFile" /* RunActiveFile */,
    title: localize2(19963, "Run Active File In Active Terminal"),
    precondition: sharedWhenClause.terminalAvailable,
    run: async (c, accessor) => {
      const codeEditorService = accessor.get(ICodeEditorService);
      const notificationService = accessor.get(INotificationService);
      const workbenchEnvironmentService = accessor.get(IWorkbenchEnvironmentService);
      const editor = codeEditorService.getActiveCodeEditor();
      if (!editor || !editor.hasModel()) {
        return;
      }
      const instance2 = await c.service.getActiveOrCreateInstance({ acceptsInput: true });
      const isRemote = instance2 ? instance2.hasRemoteAuthority : workbenchEnvironmentService.remoteAuthority ? true : false;
      const uri5 = editor.getModel().uri;
      if (!isRemote && uri5.scheme !== Schemas.file && uri5.scheme !== Schemas.vscodeUserData || isRemote && uri5.scheme !== Schemas.vscodeRemote) {
        notificationService.warn(localize(19964, null));
        return;
      }
      await instance2.sendPath(uri5, true);
      return c.groupService.showPanel();
    }
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.scrollDown" /* ScrollDownLine */,
    title: localize2(19966, "Scroll Down (Line)"),
    keybinding: {
      primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 12 /* PageDown */,
      linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 18 /* DownArrow */ },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: (xterm) => xterm.scrollDownLine()
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.scrollDownPage" /* ScrollDownPage */,
    title: localize2(19967, "Scroll Down (Page)"),
    keybinding: {
      primary: 1024 /* Shift */ | 12 /* PageDown */,
      mac: { primary: 12 /* PageDown */ },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: (xterm) => xterm.scrollDownPage()
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.scrollToBottom" /* ScrollToBottom */,
    title: localize2(19968, "Scroll to Bottom"),
    keybinding: {
      primary: 2048 /* CtrlCmd */ | 13 /* End */,
      linux: { primary: 1024 /* Shift */ | 13 /* End */ },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: (xterm) => xterm.scrollToBottom()
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.scrollUp" /* ScrollUpLine */,
    title: localize2(19970, "Scroll Up (Line)"),
    keybinding: {
      primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 11 /* PageUp */,
      linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 16 /* UpArrow */ },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: (xterm) => xterm.scrollUpLine()
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.scrollUpPage" /* ScrollUpPage */,
    title: localize2(19971, "Scroll Up (Page)"),
    f1: true,
    keybinding: {
      primary: 1024 /* Shift */ | 11 /* PageUp */,
      mac: { primary: 11 /* PageUp */ },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: (xterm) => xterm.scrollUpPage()
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.scrollToTop" /* ScrollToTop */,
    title: localize2(19969, "Scroll to Top"),
    keybinding: {
      primary: 2048 /* CtrlCmd */ | 14 /* Home */,
      linux: { primary: 1024 /* Shift */ | 14 /* Home */ },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: (xterm) => xterm.scrollToTop()
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.clearSelection" /* ClearSelection */,
    title: localize2(19931, "Clear Selection"),
    keybinding: {
      primary: 9 /* Escape */,
      when: ContextKeyExpr.and(TerminalContextKeys.focusInAny, TerminalContextKeys.textSelected, TerminalContextKeys.notFindVisible),
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: (xterm) => {
      if (xterm.hasSelection()) {
        xterm.clearSelection();
      }
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.changeIcon" /* ChangeIcon */,
    title: terminalStrings.changeIcon,
    precondition: sharedWhenClause.terminalAvailable,
    run: (c, _, args2) => getResourceOrActiveInstance(c, args2)?.changeIcon()
  });
  registerTerminalAction({
    id: "workbench.action.terminal.changeIconActiveTab" /* ChangeIconActiveTab */,
    title: terminalStrings.changeIcon,
    f1: false,
    precondition: sharedWhenClause.terminalAvailable_and_singularSelection,
    run: async (c, accessor, args2) => {
      let icon2;
      if (c.groupService.lastAccessedMenu === "inline-tab") {
        getResourceOrActiveInstance(c, args2)?.changeIcon();
        return;
      }
      for (const terminal2 of getSelectedViewInstances(accessor) ?? []) {
        icon2 = await terminal2.changeIcon(icon2);
      }
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.changeColor" /* ChangeColor */,
    title: terminalStrings.changeColor,
    precondition: sharedWhenClause.terminalAvailable,
    run: (c, _, args2) => getResourceOrActiveInstance(c, args2)?.changeColor()
  });
  registerTerminalAction({
    id: "workbench.action.terminal.changeColorActiveTab" /* ChangeColorActiveTab */,
    title: terminalStrings.changeColor,
    f1: false,
    precondition: sharedWhenClause.terminalAvailable_and_singularSelection,
    run: async (c, accessor, args2) => {
      let color2;
      let i2 = 0;
      if (c.groupService.lastAccessedMenu === "inline-tab") {
        getResourceOrActiveInstance(c, args2)?.changeColor();
        return;
      }
      for (const terminal2 of getSelectedViewInstances(accessor) ?? []) {
        const skipQuickPick = i2 !== 0;
        color2 = await terminal2.changeColor(color2, skipQuickPick);
        i2++;
      }
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.rename" /* Rename */,
    title: terminalStrings.rename,
    precondition: sharedWhenClause.terminalAvailable,
    run: (c, accessor, args2) => renameWithQuickPick(c, accessor, args2)
  });
  registerTerminalAction({
    id: "workbench.action.terminal.renameActiveTab" /* RenameActiveTab */,
    title: terminalStrings.rename,
    f1: false,
    keybinding: {
      primary: 60 /* F2 */,
      mac: {
        primary: 3 /* Enter */
      },
      when: ContextKeyExpr.and(TerminalContextKeys.tabsFocus),
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable_and_singularSelection,
    run: async (c, accessor) => {
      const terminalGroupService = accessor.get(ITerminalGroupService);
      const notificationService = accessor.get(INotificationService);
      const instances = getSelectedViewInstances(accessor);
      const firstInstance = instances?.[0];
      if (!firstInstance) {
        return;
      }
      if (terminalGroupService.lastAccessedMenu === "inline-tab") {
        return renameWithQuickPick(c, accessor, firstInstance);
      }
      c.editingService.setEditingTerminal(firstInstance);
      c.editingService.setEditable(firstInstance, {
        validationMessage: (value2) => validateTerminalName(value2),
        onFinish: async (value2, success) => {
          c.editingService.setEditable(firstInstance, null);
          c.editingService.setEditingTerminal(void 0);
          if (success) {
            const promises = [];
            for (const instance2 of instances) {
              promises.push((async () => {
                await instance2.rename(value2);
              })());
            }
            try {
              await Promise.all(promises);
            } catch (e) {
              notificationService.error(e);
            }
          }
        }
      });
    }
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.detachSession" /* DetachSession */,
    title: localize2(19934, "Detach Session"),
    run: (activeInstance) => activeInstance.detachProcessAndDispose(3 /* User */)
  });
  registerTerminalAction({
    id: "workbench.action.terminal.attachToSession" /* AttachToSession */,
    title: localize2(19929, "Attach to Session"),
    run: async (c, accessor) => {
      const quickInputService = accessor.get(IQuickInputService);
      const labelService = accessor.get(ILabelService);
      const remoteAgentService = accessor.get(IRemoteAgentService);
      const notificationService = accessor.get(INotificationService);
      const remoteAuthority = remoteAgentService.getConnection()?.remoteAuthority ?? void 0;
      const backend = await accessor.get(ITerminalInstanceService).getBackend(remoteAuthority);
      if (!backend) {
        throw new Error(`No backend registered for remote authority '${remoteAuthority}'`);
      }
      const terms = await backend.listProcesses();
      backend.reduceConnectionGraceTime();
      const unattachedTerms = terms.filter((term) => !c.service.isAttachedToTerminal(term));
      const items = unattachedTerms.map((term) => {
        const cwdLabel = labelService.getUriLabel(URI.file(term.cwd));
        return {
          label: term.title,
          detail: term.workspaceName ? `${term.workspaceName} \u2E31 ${cwdLabel}` : cwdLabel,
          description: term.pid ? String(term.pid) : "",
          term
        };
      });
      if (items.length === 0) {
        notificationService.info(localize(19926, null));
        return;
      }
      const selected = await quickInputService.pick(items, { canPickMany: false });
      if (selected) {
        const instance2 = await c.service.createTerminal({
          config: { attachPersistentProcess: selected.term }
        });
        c.service.setActiveInstance(instance2);
        await focusActiveTerminal(instance2, c);
      }
    }
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.scrollToPreviousCommand" /* ScrollToPreviousCommand */,
    title: terminalStrings.scrollToPreviousCommand,
    keybinding: {
      primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */,
      when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    icon: Codicon.arrowUp,
    menu: [
      {
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 4,
        when: ContextKeyExpr.equals("view", TERMINAL_VIEW_ID),
        isHiddenByDefault: true
      },
      ...[MenuId.EditorTitle, MenuId.CompactWindowEditorTitle].map((id2) => ({
        id: id2,
        group: "1_shellIntegration",
        order: 4,
        when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
        isHiddenByDefault: true
      }))
    ],
    run: (activeInstance) => activeInstance.xterm?.markTracker.scrollToPreviousMark(void 0, void 0, activeInstance.capabilities.has(2 /* CommandDetection */))
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.scrollToNextCommand" /* ScrollToNextCommand */,
    title: terminalStrings.scrollToNextCommand,
    keybinding: {
      primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
      when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    icon: Codicon.arrowDown,
    menu: [
      {
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 5,
        when: ContextKeyExpr.equals("view", TERMINAL_VIEW_ID),
        isHiddenByDefault: true
      },
      ...[MenuId.EditorTitle, MenuId.CompactWindowEditorTitle].map((id2) => ({
        id: id2,
        group: "1_shellIntegration",
        order: 5,
        when: ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeTerminal),
        isHiddenByDefault: true
      }))
    ],
    run: (activeInstance) => {
      activeInstance.xterm?.markTracker.scrollToNextMark();
      activeInstance.focus();
    }
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.selectToPreviousCommand" /* SelectToPreviousCommand */,
    title: localize2(19976, "Select to Previous Command"),
    keybinding: {
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 16 /* UpArrow */,
      when: TerminalContextKeys.focus,
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: (activeInstance) => {
      activeInstance.xterm?.markTracker.selectToPreviousMark();
      activeInstance.focus();
    }
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.selectToNextCommand" /* SelectToNextCommand */,
    title: localize2(19974, "Select to Next Command"),
    keybinding: {
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 18 /* DownArrow */,
      when: TerminalContextKeys.focus,
      weight: 200 /* WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: (activeInstance) => {
      activeInstance.xterm?.markTracker.selectToNextMark();
      activeInstance.focus();
    }
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.selectToPreviousLine" /* SelectToPreviousLine */,
    title: localize2(19977, "Select to Previous Line"),
    precondition: sharedWhenClause.terminalAvailable,
    run: async (xterm, _, instance2) => {
      xterm.markTracker.selectToPreviousLine();
      (instance2 || xterm).focus();
    }
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.selectToNextLine" /* SelectToNextLine */,
    title: localize2(19975, "Select to Next Line"),
    precondition: sharedWhenClause.terminalAvailable,
    run: async (xterm, _, instance2) => {
      xterm.markTracker.selectToNextLine();
      (instance2 || xterm).focus();
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.newWithCwd" /* NewWithCwd */,
    title: terminalStrings.newWithCwd,
    metadata: {
      description: terminalStrings.newWithCwd.value,
      args: [{
        name: "args",
        schema: {
          type: "object",
          required: ["cwd"],
          properties: {
            cwd: {
              description: localize(19949, null),
              type: "string"
            }
          }
        }
      }]
    },
    run: async (c, _, args2) => {
      const cwd2 = args2 ? toOptionalString(args2.cwd) : void 0;
      const instance2 = await c.service.createTerminal({ cwd: cwd2 });
      if (!instance2) {
        return;
      }
      c.service.setActiveInstance(instance2);
      await focusActiveTerminal(instance2, c);
    }
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.renameWithArg" /* RenameWithArgs */,
    title: terminalStrings.renameWithArgs,
    metadata: {
      description: terminalStrings.renameWithArgs.value,
      args: [{
        name: "args",
        schema: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              description: localize(19957, null),
              type: "string",
              minLength: 1
            }
          }
        }
      }]
    },
    precondition: sharedWhenClause.terminalAvailable,
    f1: false,
    run: async (activeInstance, c, accessor, args2) => {
      const notificationService = accessor.get(INotificationService);
      const name = args2 ? toOptionalString(args2.name) : void 0;
      if (!name) {
        notificationService.warn(localize(19958, null));
        return;
      }
      activeInstance.rename(name);
    }
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.relaunch" /* Relaunch */,
    title: localize2(19955, "Relaunch Active Terminal"),
    run: (activeInstance) => activeInstance.relaunch()
  });
  registerTerminalAction({
    id: "workbench.action.terminal.split" /* Split */,
    title: terminalStrings.split,
    precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.webExtensionContributedProfile),
    keybinding: {
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 26 /* Digit5 */,
      weight: 200 /* WorkbenchContrib */,
      mac: {
        primary: 2048 /* CtrlCmd */ | 93 /* Backslash */,
        secondary: [256 /* WinCtrl */ | 1024 /* Shift */ | 26 /* Digit5 */]
      },
      when: TerminalContextKeys.focus
    },
    icon: Codicon.splitHorizontal,
    run: async (c, accessor, args2) => {
      const optionsOrProfile = isObject(args2) ? args2 : void 0;
      const commandService = accessor.get(ICommandService);
      const workspaceContextService = accessor.get(IWorkspaceContextService);
      const options3 = convertOptionsOrProfileToOptions(optionsOrProfile);
      const activeInstance = (await c.service.getInstanceHost(options3?.location)).activeInstance;
      if (!activeInstance) {
        return;
      }
      const cwd2 = await getCwdForSplit(activeInstance, workspaceContextService.getWorkspace().folders, commandService, c.configService);
      if (cwd2 === void 0) {
        return;
      }
      const instance2 = await c.service.createTerminal({ location: { parentTerminal: activeInstance }, config: options3?.config, cwd: cwd2 });
      await focusActiveTerminal(instance2, c);
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.splitActiveTab" /* SplitActiveTab */,
    title: terminalStrings.split,
    f1: false,
    keybinding: {
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 26 /* Digit5 */,
      mac: {
        primary: 2048 /* CtrlCmd */ | 93 /* Backslash */,
        secondary: [256 /* WinCtrl */ | 1024 /* Shift */ | 26 /* Digit5 */]
      },
      weight: 200 /* WorkbenchContrib */,
      when: TerminalContextKeys.tabsFocus
    },
    run: async (c, accessor) => {
      const instances = getSelectedViewInstances(accessor);
      if (instances) {
        const promises = [];
        for (const t2 of instances) {
          promises.push((async () => {
            await c.service.createTerminal({ location: { parentTerminal: t2 } });
            await c.groupService.showPanel(true);
          })());
        }
        await Promise.all(promises);
      }
    }
  });
  registerContextualInstanceAction({
    id: "workbench.action.terminal.unsplit" /* Unsplit */,
    title: terminalStrings.unsplit,
    precondition: sharedWhenClause.terminalAvailable,
    run: async (instance2, c) => {
      const group2 = c.groupService.getGroupForInstance(instance2);
      if (group2 && group2?.terminalInstances.length > 1) {
        c.groupService.unsplitInstance(instance2);
      }
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.joinActiveTab" /* JoinActiveTab */,
    title: localize2(19943, "Join Terminals"),
    precondition: ContextKeyExpr.and(sharedWhenClause.terminalAvailable, TerminalContextKeys.tabsSingularSelection.toNegated()),
    run: async (c, accessor) => {
      const instances = getSelectedViewInstances(accessor);
      if (instances && instances.length > 1) {
        c.groupService.joinInstances(instances);
      }
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.join" /* Join */,
    title: localize2(19940, "Join Terminals..."),
    precondition: sharedWhenClause.terminalAvailable,
    run: async (c, accessor) => {
      const themeService = accessor.get(IThemeService);
      const notificationService = accessor.get(INotificationService);
      const quickInputService = accessor.get(IQuickInputService);
      const picks = [];
      if (c.groupService.instances.length <= 1) {
        notificationService.warn(localize(19941, null));
        return;
      }
      const otherInstances = c.groupService.instances.filter((i2) => i2.instanceId !== c.groupService.activeInstance?.instanceId);
      for (const terminal2 of otherInstances) {
        const group2 = c.groupService.getGroupForInstance(terminal2);
        if (group2?.terminalInstances.length === 1) {
          const iconId = getIconId(accessor, terminal2);
          const label3 = `$(${iconId}): ${terminal2.title}`;
          const iconClasses = [];
          const colorClass = getColorClass(terminal2);
          if (colorClass) {
            iconClasses.push(colorClass);
          }
          const uriClasses = getUriClasses(terminal2, themeService.getColorTheme().type);
          if (uriClasses) {
            iconClasses.push(...uriClasses);
          }
          picks.push({
            terminal: terminal2,
            label: label3,
            iconClasses
          });
        }
      }
      if (picks.length === 0) {
        notificationService.warn(localize(19942, null));
        return;
      }
      const result = await quickInputService.pick(picks, {});
      if (result) {
        c.groupService.joinInstances([result.terminal, c.groupService.activeInstance]);
      }
    }
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.splitInActiveWorkspace" /* SplitInActiveWorkspace */,
    title: localize2(19979, "Split Terminal (In Active Workspace)"),
    run: async (instance2, c) => {
      const newInstance = await c.service.createTerminal({ location: { parentTerminal: instance2 } });
      if (newInstance?.target !== 2 /* Editor */) {
        await c.groupService.showPanel(true);
      }
    }
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.selectAll" /* SelectAll */,
    title: localize2(19972, "Select All"),
    precondition: sharedWhenClause.terminalAvailable,
    keybinding: [{
      // Don't use ctrl+a by default as that would override the common go to start
      // of prompt shell binding
      primary: 0,
      // Technically this doesn't need to be here as it will fall back to this
      // behavior anyway when handed to xterm.js, having this handled by VS Code
      // makes it easier for users to see how it works though.
      mac: { primary: 2048 /* CtrlCmd */ | 31 /* KeyA */ },
      weight: 200 /* WorkbenchContrib */,
      when: TerminalContextKeys.focusInAny
    }],
    run: (xterm) => xterm.selectAll()
  });
  registerTerminalAction({
    id: "workbench.action.terminal.new" /* New */,
    title: localize2(19947, "Create New Terminal"),
    precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.webExtensionContributedProfile),
    icon: newTerminalIcon,
    keybinding: {
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 91 /* Backquote */,
      mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 91 /* Backquote */ },
      weight: 200 /* WorkbenchContrib */
    },
    run: async (c, accessor, args2) => {
      let eventOrOptions = isObject(args2) ? args2 : void 0;
      const workspaceContextService = accessor.get(IWorkspaceContextService);
      const commandService = accessor.get(ICommandService);
      const editorGroupsService = accessor.get(IEditorGroupsService);
      const folders = workspaceContextService.getWorkspace().folders;
      if (eventOrOptions && isMouseEvent(eventOrOptions) && (eventOrOptions.altKey || eventOrOptions.ctrlKey)) {
        await c.service.createTerminal({ location: { splitActiveTerminal: true } });
        return;
      }
      if (c.service.isProcessSupportRegistered) {
        eventOrOptions = !eventOrOptions || isMouseEvent(eventOrOptions) ? {} : eventOrOptions;
        if (isAuxiliaryWindow(getActiveWindow()) && !eventOrOptions.location) {
          eventOrOptions.location = { viewColumn: editorGroupToColumn(editorGroupsService, editorGroupsService.activeGroup) };
        }
        let instance2;
        if (folders.length <= 1) {
          instance2 = await c.service.createTerminal(eventOrOptions);
        } else {
          const cwd2 = (await pickTerminalCwd(accessor))?.cwd;
          if (!cwd2) {
            return;
          }
          eventOrOptions.cwd = cwd2;
          instance2 = await c.service.createTerminal(eventOrOptions);
        }
        c.service.setActiveInstance(instance2);
        await focusActiveTerminal(instance2, c);
      } else {
        if (c.profileService.contributedProfiles.length > 0) {
          commandService.executeCommand("workbench.action.terminal.newWithProfile" /* NewWithProfile */);
        } else {
          commandService.executeCommand("workbench.action.terminal.toggleTerminal" /* Toggle */);
        }
      }
    }
  });
  async function killInstance(c, instance2) {
    if (!instance2) {
      return;
    }
    await c.service.safeDisposeTerminal(instance2);
    if (c.groupService.instances.length > 0) {
      await c.groupService.showPanel(true);
    }
  }
  registerTerminalAction({
    id: "workbench.action.terminal.kill" /* Kill */,
    title: localize2(19944, "Kill the Active Terminal Instance"),
    precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
    icon: killTerminalIcon,
    run: async (c) => killInstance(c, c.groupService.activeInstance)
  });
  registerTerminalAction({
    id: "workbench.action.terminal.killViewOrEditor" /* KillViewOrEditor */,
    title: terminalStrings.kill,
    f1: false,
    // This is an internal command used for context menus
    precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
    run: async (c) => killInstance(c, c.service.activeInstance)
  });
  registerTerminalAction({
    id: "workbench.action.terminal.killAll" /* KillAll */,
    title: localize2(19945, "Kill All Terminals"),
    precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
    icon: Codicon.trash,
    run: async (c) => {
      const disposePromises = [];
      for (const instance2 of c.service.instances) {
        disposePromises.push(c.service.safeDisposeTerminal(instance2));
      }
      await Promise.all(disposePromises);
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.killEditor" /* KillEditor */,
    title: localize2(19946, "Kill the Active Terminal in Editor Area"),
    precondition: sharedWhenClause.terminalAvailable,
    keybinding: {
      primary: 2048 /* CtrlCmd */ | 53 /* KeyW */,
      win: { primary: 2048 /* CtrlCmd */ | 62 /* F4 */, secondary: [2048 /* CtrlCmd */ | 53 /* KeyW */] },
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.editorFocus)
    },
    run: (c, accessor) => accessor.get(ICommandService).executeCommand(CLOSE_EDITOR_COMMAND_ID)
  });
  registerTerminalAction({
    id: "workbench.action.terminal.killActiveTab" /* KillActiveTab */,
    title: terminalStrings.kill,
    f1: false,
    precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
    keybinding: {
      primary: 20 /* Delete */,
      mac: {
        primary: 2048 /* CtrlCmd */ | 1 /* Backspace */,
        secondary: [20 /* Delete */]
      },
      weight: 200 /* WorkbenchContrib */,
      when: TerminalContextKeys.tabsFocus
    },
    run: async (c, accessor) => {
      const disposePromises = [];
      for (const terminal2 of getSelectedViewInstances(accessor, true) ?? []) {
        disposePromises.push(c.service.safeDisposeTerminal(terminal2));
      }
      await Promise.all(disposePromises);
      c.groupService.focusTabs();
    }
  });
  registerTerminalAction({
    id: "workbench.action.terminal.focusHover" /* FocusHover */,
    title: terminalStrings.focusHover,
    precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
    keybinding: {
      primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 39 /* KeyI */),
      weight: 200 /* WorkbenchContrib */,
      when: ContextKeyExpr.or(TerminalContextKeys.tabsFocus, TerminalContextKeys.focus)
    },
    run: (c) => c.groupService.focusHover()
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.clear" /* Clear */,
    title: localize2(19930, "Clear"),
    precondition: sharedWhenClause.terminalAvailable,
    keybinding: [{
      primary: 0,
      mac: { primary: 2048 /* CtrlCmd */ | 41 /* KeyK */ },
      // Weight is higher than work workbench contributions so the keybinding remains
      // highest priority when chords are registered afterwards
      weight: 200 /* WorkbenchContrib */ + 1,
      // Disable the keybinding when accessibility mode is enabled as chords include
      // important screen reader keybindings such as cmd+k, cmd+i to show the hover
      when: ContextKeyExpr.or(ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()), ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, accessibleViewIsShown, accessibleViewCurrentProviderId.isEqualTo("terminal" /* Terminal */)))
    }],
    run: (activeInstance) => activeInstance.clearBuffer()
  });
  registerTerminalAction({
    id: "workbench.action.terminal.selectDefaultShell" /* SelectDefaultProfile */,
    title: localize2(19973, "Select Default Profile"),
    run: (c) => c.service.showProfileQuickPick("setDefault")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.openSettings" /* ConfigureTerminalSettings */,
    title: localize2(19953, "Configure Terminal Settings"),
    precondition: sharedWhenClause.terminalAvailable,
    run: (c, accessor) => accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: "@feature:terminal" })
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.setDimensions" /* SetDimensions */,
    title: localize2(19978, "Set Fixed Dimensions"),
    precondition: sharedWhenClause.terminalAvailable_and_opened,
    run: (activeInstance) => activeInstance.setFixedDimensions()
  });
  registerContextualInstanceAction({
    id: "workbench.action.terminal.sizeToContentWidth" /* SizeToContentWidth */,
    title: terminalStrings.toggleSizeToContentWidth,
    precondition: sharedWhenClause.terminalAvailable_and_opened,
    keybinding: {
      primary: 512 /* Alt */ | 56 /* KeyZ */,
      weight: 200 /* WorkbenchContrib */,
      when: TerminalContextKeys.focus
    },
    run: (instance2) => instance2.toggleSizeToContentWidth()
  });
  registerTerminalAction({
    id: "workbench.action.terminal.switchTerminal" /* SwitchTerminal */,
    title: localize2(19980, "Switch Terminal"),
    precondition: sharedWhenClause.terminalAvailable,
    run: async (c, accessor, args2) => {
      const item = toOptionalString(args2);
      if (!item) {
        return;
      }
      if (item === SeparatorSelectOption.text) {
        c.service.refreshActiveGroup();
        return;
      }
      if (item === switchTerminalShowTabsTitle) {
        accessor.get(IConfigurationService).updateValue("terminal.integrated.tabs.enabled" /* TabsEnabled */, true);
        return;
      }
      const terminalIndexRe = /^([0-9]+): /;
      const indexMatches = terminalIndexRe.exec(item);
      if (indexMatches) {
        c.groupService.setActiveGroupByIndex(Number(indexMatches[1]) - 1);
        return c.groupService.showPanel(true);
      }
      const quickSelectProfiles = c.profileService.availableProfiles;
      const profileSelection = item.substring(4);
      if (quickSelectProfiles) {
        const profile = quickSelectProfiles.find((profile2) => profile2.profileName === profileSelection);
        if (profile) {
          const instance2 = await c.service.createTerminal({
            config: profile
          });
          c.service.setActiveInstance(instance2);
        } else {
          console.warn(`No profile with name "${profileSelection}"`);
        }
      } else {
        console.warn(`Unmatched terminal item: "${item}"`);
      }
    }
  });
}

function getSelectedViewInstances2(accessor, args2) {
  const terminalService = accessor.get(ITerminalService);
  const result = [];
  const context2 = parseActionArgs(args2);
  if (context2 && context2.length > 0) {
    for (const instanceContext of context2) {
      const instance2 = terminalService.getInstanceFromId(instanceContext.instanceId);
      if (instance2) {
        result.push(instance2);
      }
    }
    if (result.length > 0) {
      return result;
    }
  }
  return void 0;
}

function getSelectedViewInstances(accessor, args2, args22) {
  const listService = accessor.get(IListService);
  const terminalGroupService = accessor.get(ITerminalGroupService);
  const result = [];
  const list2 = listService.lastFocusedList instanceof TerminalTabList ? listService.lastFocusedList : void 0;
  const selections = list2?.getSelection();
  if (terminalGroupService.lastAccessedMenu === "inline-tab" && !selections?.length) {
    const instance2 = terminalGroupService.activeInstance;
    return instance2 ? [terminalGroupService.activeInstance] : void 0;
  }
  if (!list2 || !selections) {
    return void 0;
  }
  const focused = list2.getFocus();
  const viewInstances = terminalGroupService.instances;
  if (focused.length === 1 && !selections.includes(focused[0])) {
    result.push(viewInstances[focused[0]]);
    return result;
  }
  for (const selection of selections) {
    result.push(viewInstances[selection]);
  }
  return result.filter((r2) => !!r2);
}

function validateTerminalName(name) {
  if (!name || name.trim().length === 0) {
    return {
      content: localize(19922, null),
      severity: Severity2.Info
    };
  }
  return null;
}

function isTerminalProfile(obj) {
  return isObject(obj) && "profileName" in obj;
}

function convertOptionsOrProfileToOptions(optionsOrProfile) {
  if (isTerminalProfile(optionsOrProfile)) {
    return { config: optionsOrProfile, location: optionsOrProfile.location };
  }
  return optionsOrProfile;
}

var newWithProfileAction;

function refreshTerminalActions(detectedProfiles) {
  const profileEnum = createProfileSchemaEnums(detectedProfiles);
  newWithProfileAction?.dispose();
  newWithProfileAction = registerAction2(class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.terminal.newWithProfile" /* NewWithProfile */,
        title: localize2(19950, "Create New Terminal (With Profile)"),
        f1: true,
        precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.webExtensionContributedProfile),
        metadata: {
          description: "workbench.action.terminal.newWithProfile" /* NewWithProfile */,
          args: [{
            name: "args",
            schema: {
              type: "object",
              required: ["profileName"],
              properties: {
                profileName: {
                  description: localize(19951, null),
                  type: "string",
                  enum: profileEnum.values,
                  markdownEnumDescriptions: profileEnum.markdownDescriptions
                },
                location: {
                  description: localize(19923, null),
                  type: "string",
                  enum: ["view", "editor"],
                  enumDescriptions: [
                    localize(19925, null),
                    localize(19924, null)
                  ]
                }
              }
            }
          }]
        }
      });
    }
    async run(accessor, eventOrOptionsOrProfile, profile) {
      const c = getTerminalServices(accessor);
      const workspaceContextService = accessor.get(IWorkspaceContextService);
      const commandService = accessor.get(ICommandService);
      let event;
      let options3;
      let instance2;
      let cwd2;
      if (isObject(eventOrOptionsOrProfile) && eventOrOptionsOrProfile && hasKey(eventOrOptionsOrProfile, { profileName: true })) {
        let isSimpleArgs = function(obj) {
          return isObject(obj) && "location" in obj;
        };
        const config = c.profileService.availableProfiles.find((profile2) => profile2.profileName === eventOrOptionsOrProfile.profileName);
        if (!config) {
          throw new Error(`Could not find terminal profile "${eventOrOptionsOrProfile.profileName}"`);
        }
        options3 = { config };
        if (isSimpleArgs(eventOrOptionsOrProfile)) {
          switch (eventOrOptionsOrProfile.location) {
            case "editor":
              options3.location = 2 /* Editor */;
              break;
            case "view":
              options3.location = 1 /* Panel */;
              break;
          }
        }
      } else if (isMouseEvent(eventOrOptionsOrProfile) || isPointerEvent(eventOrOptionsOrProfile) || isKeyboardEvent(eventOrOptionsOrProfile)) {
        event = eventOrOptionsOrProfile;
        options3 = profile ? { config: profile } : void 0;
      } else {
        options3 = convertOptionsOrProfileToOptions(eventOrOptionsOrProfile);
      }
      if (event && (event.altKey || event.ctrlKey)) {
        const parentTerminal = c.service.activeInstance;
        if (parentTerminal) {
          await c.service.createTerminal({ location: { parentTerminal }, config: options3?.config });
          return;
        }
      }
      const folders = workspaceContextService.getWorkspace().folders;
      if (folders.length > 1) {
        const options4 = {
          placeHolder: localize(19952, null)
        };
        const workspace = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID, [options4]);
        if (!workspace) {
          return;
        }
        cwd2 = workspace.uri;
      }
      if (options3) {
        options3.cwd = cwd2;
        instance2 = await c.service.createTerminal(options3);
      } else {
        instance2 = await c.service.showProfileQuickPick("createInstance", cwd2);
      }
      if (instance2) {
        c.service.setActiveInstance(instance2);
        await focusActiveTerminal(instance2, c);
      }
    }
  });
  return newWithProfileAction;
}

function getResourceOrActiveInstance(c, resource) {
  return c.service.getInstanceFromResource(toOptionalUri(resource)) || c.service.activeInstance;
}

async function pickTerminalCwd(accessor, cancel) {
  const quickInputService = accessor.get(IQuickInputService);
  const labelService = accessor.get(ILabelService);
  const contextService = accessor.get(IWorkspaceContextService);
  const modelService = accessor.get(IModelService);
  const languageService = accessor.get(ILanguageService);
  const configurationService = accessor.get(IConfigurationService);
  const configurationResolverService = accessor.get(IConfigurationResolverService);
  const folders = contextService.getWorkspace().folders;
  if (!folders.length) {
    return;
  }
  const folderCwdPairs = await Promise.all(folders.map((e) => resolveWorkspaceFolderCwd(e, configurationService, configurationResolverService)));
  const shrinkedPairs = shrinkWorkspaceFolderCwdPairs(folderCwdPairs);
  if (shrinkedPairs.length === 1) {
    return shrinkedPairs[0];
  }
  const folderPicks = shrinkedPairs.map((pair) => {
    const label3 = pair.folder.name;
    const description = pair.isOverridden ? localize(19954, null, labelService.getUriLabel(pair.cwd, { relative: !pair.isAbsolute })) : labelService.getUriLabel(dirname2(pair.cwd), { relative: true });
    return {
      label: label3,
      description: description !== label3 ? description : void 0,
      pair,
      iconClasses: getIconClasses(modelService, languageService, pair.cwd, 2 /* ROOT_FOLDER */)
    };
  });
  const options3 = {
    placeHolder: localize(19952, null),
    matchOnDescription: true,
    canPickMany: false
  };
  const token = cancel || CancellationToken.None;
  const pick = await quickInputService.pick(folderPicks, options3, token);
  return pick?.pair;
}

async function resolveWorkspaceFolderCwd(folder, configurationService, configurationResolverService) {
  const cwdConfig = configurationService.getValue("terminal.integrated.cwd" /* Cwd */, { resource: folder.uri });
  if (!isString(cwdConfig) || cwdConfig.length === 0) {
    return { folder, cwd: folder.uri, isAbsolute: false, isOverridden: false };
  }
  const resolvedCwdConfig = await configurationResolverService.resolveAsync(folder, cwdConfig);
  return isAbsolute(resolvedCwdConfig) || resolvedCwdConfig.startsWith(ConfigurationResolverExpression.VARIABLE_LHS) ? { folder, isAbsolute: true, isOverridden: true, cwd: URI.from({ ...folder.uri, path: resolvedCwdConfig }) } : { folder, isAbsolute: false, isOverridden: true, cwd: URI.joinPath(folder.uri, resolvedCwdConfig) };
}

function shrinkWorkspaceFolderCwdPairs(pairs2) {
  const map = /* @__PURE__ */ new Map();
  for (const pair of pairs2) {
    const key3 = pair.cwd.toString();
    const value2 = map.get(key3);
    if (!value2 || key3 === pair.folder.uri.toString()) {
      map.set(key3, pair);
    }
  }
  const selectedPairs = new Set(map.values());
  const selectedPairsInOrder = pairs2.filter((x) => selectedPairs.has(x));
  return selectedPairsInOrder;
}

async function focusActiveTerminal(instance2, c) {
  const target = instance2 ?? c.service.activeInstance ?? c.editorService.activeInstance ?? c.groupService.activeInstance;
  if (!target) {
    if (c.groupService.instances.length > 0) {
      await c.groupService.showPanel(true);
    }
    return;
  }
  await c.service.focusInstance(target);
}

async function renameWithQuickPick(c, accessor, resource) {
  let instance2 = resource;
  if (!instance2 || !instance2?.rename) {
    instance2 = getResourceOrActiveInstance(c, resource);
  }
  if (instance2) {
    const title = await accessor.get(IQuickInputService).input({
      value: instance2.title,
      prompt: localize(19956, null)
    });
    if (title) {
      instance2.rename(title);
    }
  }
}

function toOptionalUri(obj) {
  return URI.isUri(obj) ? obj : void 0;
}

function toOptionalString(obj) {
  return isString(obj) ? obj : void 0;
}
export { getCwdForSplit, registerTerminalAction, parseActionArgs, registerContextualInstanceAction, registerActiveInstanceAction, registerActiveXtermAction, getTerminalServices, registerTerminalActions, getSelectedViewInstances2, getSelectedViewInstances, validateTerminalName, isTerminalProfile, convertOptionsOrProfileToOptions, refreshTerminalActions, getResourceOrActiveInstance, pickTerminalCwd, resolveWorkspaceFolderCwd, shrinkWorkspaceFolderCwdPairs, focusActiveTerminal, renameWithQuickPick, toOptionalUri, toOptionalString, switchTerminalShowTabsTitle, category6, sharedWhenClause, TerminalLaunchHelpAction, newWithProfileAction };
