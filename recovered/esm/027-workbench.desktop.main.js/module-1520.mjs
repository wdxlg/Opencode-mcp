// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/actions/windowActions.ts
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IWorkspacesService, isRecentFolder, isRecentWorkspace } from "./module-1379.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IWorkspaceContextService, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from "./module-0509.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IHostService } from "./module-1117.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { isFolderBackupInfo, isWorkspaceBackupInfo } from "./module-1519.mjs";
import { getActiveElement, getActiveWindow, isHTMLElement } from "./module-0075.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { isMacintosh, isWeb, isWindows } from "./module-0014.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { splitRecentLabel } from "./module-0711.mjs";
import { Categories } from "./module-0847.mjs";
import { IsDevelopmentContext, IsIOSContext, IsMacNativeContext, IsWebContext } from "./module-0635.mjs";
import { IsMainWindowFullscreenContext } from "./module-0949.mjs";
import { KeyChord } from "./module-0019.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { getQuickNavigateHandler, inQuickPickContext } from "./module-1518.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/browser/actions/windowActions.ts
var inRecentFilesPickerContextKey = "inRecentFilesPicker";

var BaseOpenRecentAction = class extends Action2 {
  constructor() {
    super(...arguments);
    this.removeFromRecentlyOpened = {
      iconClass: ThemeIcon.asClassName(Codicon.removeClose),
      tooltip: localize(6163, null)
    };
    this.dirtyRecentlyOpenedFolder = {
      iconClass: "dirty-workspace " + ThemeIcon.asClassName(Codicon.closeDirty),
      tooltip: localize(6140, null),
      alwaysVisible: true
    };
    this.dirtyRecentlyOpenedWorkspace = {
      ...this.dirtyRecentlyOpenedFolder,
      tooltip: localize(6141, null)
    };
    this.windowOpenedRecentlyOpenedFolder = {
      iconClass: "opened-workspace " + ThemeIcon.asClassName(Codicon.window),
      tooltip: localize(6154, null),
      alwaysVisible: true
    };
    this.windowOpenedRecentlyOpenedWorkspace = {
      ...this.windowOpenedRecentlyOpenedFolder,
      tooltip: localize(6155, null)
    };
    this.activeWindowOpenedRecentlyOpenedFolder = {
      iconClass: "opened-workspace " + ThemeIcon.asClassName(Codicon.windowActive),
      tooltip: localize(6134, null),
      alwaysVisible: true
    };
    this.activeWindowOpenedRecentlyOpenedWorkspace = {
      ...this.activeWindowOpenedRecentlyOpenedFolder,
      tooltip: localize(6135, null)
    };
  }
  async run(accessor) {
    const workspacesService = accessor.get(IWorkspacesService);
    const quickInputService = accessor.get(IQuickInputService);
    const contextService = accessor.get(IWorkspaceContextService);
    const labelService = accessor.get(ILabelService);
    const keybindingService = accessor.get(IKeybindingService);
    const modelService = accessor.get(IModelService);
    const languageService = accessor.get(ILanguageService);
    const hostService = accessor.get(IHostService);
    const dialogService = accessor.get(IDialogService);
    const environmentService = accessor.get(IWorkbenchEnvironmentService);
    const [mainWindows, recentlyOpened, dirtyWorkspacesAndFolders] = await Promise.all([
      hostService.getWindows({ includeAuxiliaryWindows: false }),
      workspacesService.getRecentlyOpened(),
      workspacesService.getDirtyWorkspaces()
    ]);
    let hasWorkspaces = false;
    const dirtyFolders = new ResourceMap();
    const dirtyWorkspaces = new ResourceMap();
    for (const dirtyWorkspace of dirtyWorkspacesAndFolders) {
      if (isFolderBackupInfo(dirtyWorkspace)) {
        dirtyFolders.set(dirtyWorkspace.folderUri, true);
      } else {
        dirtyWorkspaces.set(dirtyWorkspace.workspace.configPath, dirtyWorkspace.workspace);
        hasWorkspaces = true;
      }
    }
    const activeWindowId = getActiveWindow().vscodeWindowId;
    const openedInWindows = new ResourceMap();
    for (const window2 of mainWindows) {
      const isActive2 = window2.id === activeWindowId;
      if (isSingleFolderWorkspaceIdentifier(window2.workspace)) {
        openedInWindows.set(window2.workspace.uri, { isActive: isActive2 });
      } else if (isWorkspaceIdentifier(window2.workspace)) {
        openedInWindows.set(window2.workspace.configPath, { isActive: isActive2 });
      }
    }
    const recentFolders = new ResourceMap();
    const recentWorkspaces = new ResourceMap();
    for (const recent of recentlyOpened.workspaces) {
      if (isRecentFolder(recent)) {
        recentFolders.set(recent.folderUri, true);
      } else {
        recentWorkspaces.set(recent.workspace.configPath, recent.workspace);
        hasWorkspaces = true;
      }
    }
    const workspacePicks = [];
    for (const recent of recentlyOpened.workspaces) {
      const isDirty = isRecentFolder(recent) ? dirtyFolders.has(recent.folderUri) : dirtyWorkspaces.has(recent.workspace.configPath);
      const windowState = isRecentFolder(recent) ? openedInWindows.get(recent.folderUri) : openedInWindows.get(recent.workspace.configPath);
      workspacePicks.push(this.toQuickPick(modelService, languageService, labelService, environmentService, recent, { isDirty, windowState }));
    }
    for (const dirtyWorkspaceOrFolder of dirtyWorkspacesAndFolders) {
      if (isFolderBackupInfo(dirtyWorkspaceOrFolder) && !recentFolders.has(dirtyWorkspaceOrFolder.folderUri)) {
        workspacePicks.push(this.toQuickPick(modelService, languageService, labelService, environmentService, dirtyWorkspaceOrFolder, { isDirty: true, windowState: void 0 }));
      } else if (isWorkspaceBackupInfo(dirtyWorkspaceOrFolder) && !recentWorkspaces.has(dirtyWorkspaceOrFolder.workspace.configPath)) {
        workspacePicks.push(this.toQuickPick(modelService, languageService, labelService, environmentService, dirtyWorkspaceOrFolder, { isDirty: true, windowState: void 0 }));
      }
    }
    const filePicks = recentlyOpened.files.map((p) => this.toQuickPick(modelService, languageService, labelService, environmentService, p, { isDirty: false, windowState: void 0 }));
    const firstEntry = recentlyOpened.workspaces[0];
    const autoFocusSecondEntry = firstEntry && (contextService.isCurrentWorkspace(isRecentWorkspace(firstEntry) ? firstEntry.workspace : firstEntry.folderUri) || isRecentWorkspace(firstEntry) && isEqual2(firstEntry.workspace.configPath, environmentService.agentSessionsWorkspace));
    let keyMods;
    const workspaceSeparator = { type: "separator", label: hasWorkspaces ? localize(6165, null) : localize(6146, null) };
    const fileSeparator = { type: "separator", label: localize(6145, null) };
    const picks = [workspaceSeparator, ...workspacePicks, fileSeparator, ...filePicks];
    const pick = await quickInputService.pick(picks, {
      contextKey: inRecentFilesPickerContextKey,
      activeItem: [...workspacePicks, ...filePicks][autoFocusSecondEntry ? 1 : 0],
      placeHolder: isMacintosh ? localize(6158, null) : localize(6157, null),
      matchOnDescription: true,
      sortByLabel: false,
      onKeyMods: (mods) => keyMods = mods,
      quickNavigate: this.isQuickNavigate() ? { keybindings: keybindingService.lookupKeybindings(this.desc.id) } : void 0,
      hideInput: this.isQuickNavigate(),
      onDidTriggerItemButton: async (context2) => {
        if (context2.button === this.removeFromRecentlyOpened || context2.button === this.windowOpenedRecentlyOpenedFolder || context2.button === this.windowOpenedRecentlyOpenedWorkspace) {
          await workspacesService.removeRecentlyOpened([context2.item.resource]);
          context2.removeItem();
        } else if (context2.button === this.dirtyRecentlyOpenedFolder || context2.button === this.dirtyRecentlyOpenedWorkspace) {
          const isDirtyWorkspace = context2.button === this.dirtyRecentlyOpenedWorkspace;
          const { confirmed } = await dialogService.confirm({
            title: isDirtyWorkspace ? localize(6142, null) : localize(6137, null),
            message: isDirtyWorkspace ? localize(6143, null) : localize(6138, null),
            detail: isDirtyWorkspace ? localize(6144, null) : localize(6139, null)
          });
          if (confirmed) {
            hostService.openWindow(
              [context2.item.openable],
              {
                remoteAuthority: context2.item.remoteAuthority || null
                // local window if remoteAuthority is not set or can not be deducted from the openable
              }
            );
            quickInputService.cancel();
          }
        }
      }
    });
    if (pick) {
      return hostService.openWindow([pick.openable], {
        forceNewWindow: keyMods?.ctrlCmd,
        forceReuseWindow: keyMods?.alt,
        remoteAuthority: pick.remoteAuthority || null
        // local window if remoteAuthority is not set or can not be deducted from the openable
      });
    }
  }
  toQuickPick(modelService, languageService, labelService, environmentService, recent, kind) {
    let openable;
    let iconClasses;
    let fullLabel;
    let resource;
    let isWorkspace2 = false;
    if (isRecentFolder(recent)) {
      resource = recent.folderUri;
      iconClasses = getIconClasses(modelService, languageService, resource, 1 /* FOLDER */);
      openable = { folderUri: resource };
      fullLabel = recent.label || labelService.getWorkspaceLabel(resource, { verbose: 2 /* LONG */ });
    } else if (isRecentWorkspace(recent)) {
      resource = recent.workspace.configPath;
      iconClasses = getIconClasses(modelService, languageService, resource, 2 /* ROOT_FOLDER */);
      openable = { workspaceUri: resource };
      fullLabel = recent.label || labelService.getWorkspaceLabel(recent.workspace, { verbose: 2 /* LONG */ });
      isWorkspace2 = true;
    } else {
      resource = recent.fileUri;
      iconClasses = getIconClasses(modelService, languageService, resource, 0 /* FILE */);
      openable = { fileUri: resource };
      fullLabel = recent.label || labelService.getUriLabel(resource, { appendWorkspaceSuffix: true });
    }
    const { name, parentPath } = isRecentWorkspace(recent) && isEqual2(recent.workspace.configPath, environmentService.agentSessionsWorkspace) ? { name: fullLabel, parentPath: void 0 } : splitRecentLabel(fullLabel);
    const buttons = [];
    if (kind.isDirty) {
      buttons.push(isWorkspace2 ? this.dirtyRecentlyOpenedWorkspace : this.dirtyRecentlyOpenedFolder);
    } else if (kind.windowState) {
      if (kind.windowState.isActive) {
        buttons.push(isWorkspace2 ? this.activeWindowOpenedRecentlyOpenedWorkspace : this.activeWindowOpenedRecentlyOpenedFolder);
      } else {
        buttons.push(isWorkspace2 ? this.windowOpenedRecentlyOpenedWorkspace : this.windowOpenedRecentlyOpenedFolder);
      }
    } else {
      buttons.push(this.removeFromRecentlyOpened);
    }
    return {
      iconClasses,
      label: name,
      ariaLabel: kind.isDirty ? isWorkspace2 ? localize(6161, null, name) : localize(6160, null, name) : name,
      description: parentPath,
      buttons,
      openable,
      resource,
      remoteAuthority: recent.remoteAuthority
    };
  }
};

var OpenRecentAction = class _OpenRecentAction extends BaseOpenRecentAction {
  static {
    this.ID = "workbench.action.openRecent";
  }
  constructor() {
    super({
      id: _OpenRecentAction.ID,
      title: {
        ...localize2(6156, "Open Recent..."),
        mnemonicTitle: localize(6149, null)
      },
      category: Categories.File,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 48 /* KeyR */,
        mac: { primary: 256 /* WinCtrl */ | 48 /* KeyR */ }
      },
      menu: {
        id: MenuId.MenubarRecentMenu,
        group: "y_more",
        order: 1
      }
    });
  }
  isQuickNavigate() {
    return false;
  }
};

var QuickPickRecentAction = class extends BaseOpenRecentAction {
  constructor() {
    super({
      id: "workbench.action.quickOpenRecent",
      title: localize2(6159, "Quick Open Recent..."),
      category: Categories.File,
      f1: false
      // hide quick pickers from command palette to not confuse with the other entry that shows a input field
    });
  }
  isQuickNavigate() {
    return true;
  }
};

var ToggleFullScreenAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleFullScreen",
      title: {
        ...localize2(6164, "Toggle Full Screen"),
        mnemonicTitle: localize(6152, null)
      },
      category: Categories.View,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 69 /* F11 */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 36 /* KeyF */
        }
      },
      precondition: IsIOSContext.toNegated(),
      toggled: IsMainWindowFullscreenContext,
      menu: [{
        id: MenuId.MenubarAppearanceMenu,
        group: "1_toggle_view",
        order: 1
      }]
    });
  }
  run(accessor) {
    const hostService = accessor.get(IHostService);
    return hostService.toggleFullScreen(getActiveWindow());
  }
};

var ReloadWindowAction = class _ReloadWindowAction extends Action2 {
  static {
    this.ID = "workbench.action.reloadWindow";
  }
  constructor() {
    super({
      id: _ReloadWindowAction.ID,
      title: localize2(6162, "Reload Window"),
      category: Categories.Developer,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */ + 50,
        when: IsDevelopmentContext,
        primary: 2048 /* CtrlCmd */ | 48 /* KeyR */
      }
    });
  }
  async run(accessor) {
    const hostService = accessor.get(IHostService);
    return hostService.reload();
  }
};

var ShowAboutDialogAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.showAboutDialog",
      title: {
        ...localize2(6133, "About"),
        mnemonicTitle: localize(6147, null)
      },
      category: Categories.Help,
      f1: true,
      menu: {
        id: MenuId.MenubarHelpMenu,
        group: "z_about",
        order: 1,
        when: IsMacNativeContext.toNegated()
      }
    });
  }
  run(accessor) {
    const dialogService = accessor.get(IDialogService);
    return dialogService.about();
  }
};

var NewWindowAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.newWindow",
      title: {
        ...localize2(6153, "New Window"),
        mnemonicTitle: localize(6150, null)
      },
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: isWeb ? isWindows ? KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 1024 /* Shift */ | 44 /* KeyN */) : 2048 /* CtrlCmd */ | 512 /* Alt */ | 1024 /* Shift */ | 44 /* KeyN */ : 2048 /* CtrlCmd */ | 1024 /* Shift */ | 44 /* KeyN */,
        secondary: isWeb ? [2048 /* CtrlCmd */ | 1024 /* Shift */ | 44 /* KeyN */] : void 0
      },
      menu: {
        id: MenuId.MenubarFileMenu,
        group: "1_new",
        order: 3
      }
    });
  }
  run(accessor) {
    const hostService = accessor.get(IHostService);
    return hostService.openWindow({ remoteAuthority: null });
  }
};

var BlurAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.blur",
      title: localize2(6136, "Remove keyboard focus from focused element")
    });
  }
  run() {
    const activeElement = getActiveElement();
    if (isHTMLElement(activeElement)) {
      activeElement.blur();
    }
  }
};

registerAction2(NewWindowAction);

registerAction2(ToggleFullScreenAction);

registerAction2(QuickPickRecentAction);

registerAction2(OpenRecentAction);

registerAction2(ReloadWindowAction);

registerAction2(ShowAboutDialogAction);

registerAction2(BlurAction);

var recentFilesPickerContext = ContextKeyExpr.and(inQuickPickContext, ContextKeyExpr.has(inRecentFilesPickerContextKey));

var quickPickNavigateNextInRecentFilesPickerId = "workbench.action.quickOpenNavigateNextInRecentFilesPicker";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: quickPickNavigateNextInRecentFilesPickerId,
  weight: 200 /* WorkbenchContrib */ + 50,
  handler: getQuickNavigateHandler(quickPickNavigateNextInRecentFilesPickerId, true),
  when: recentFilesPickerContext,
  primary: 2048 /* CtrlCmd */ | 48 /* KeyR */,
  mac: { primary: 256 /* WinCtrl */ | 48 /* KeyR */ }
});

var quickPickNavigatePreviousInRecentFilesPicker = "workbench.action.quickOpenNavigatePreviousInRecentFilesPicker";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: quickPickNavigatePreviousInRecentFilesPicker,
  weight: 200 /* WorkbenchContrib */ + 50,
  handler: getQuickNavigateHandler(quickPickNavigatePreviousInRecentFilesPicker, false),
  when: recentFilesPickerContext,
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 48 /* KeyR */,
  mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 48 /* KeyR */ }
});

CommandsRegistry.registerCommand("workbench.action.toggleConfirmBeforeClose", (accessor) => {
  const configurationService = accessor.get(IConfigurationService);
  const setting = configurationService.inspect("window.confirmBeforeClose").userValue;
  return configurationService.updateValue("window.confirmBeforeClose", setting === "never" ? "keyboardOnly" : "never");
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "z_ConfirmClose",
  command: {
    id: "workbench.action.toggleConfirmBeforeClose",
    title: localize(6148, null),
    toggled: ContextKeyExpr.notEquals("config.window.confirmBeforeClose", "never")
  },
  order: 1,
  when: IsWebContext
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  title: localize(6151, null),
  submenu: MenuId.MenubarRecentMenu,
  group: "2_open",
  order: 4
});
export { inRecentFilesPickerContextKey, BaseOpenRecentAction, OpenRecentAction, QuickPickRecentAction, ToggleFullScreenAction, ReloadWindowAction, ShowAboutDialogAction, NewWindowAction, BlurAction, recentFilesPickerContext, quickPickNavigateNextInRecentFilesPickerId, quickPickNavigatePreviousInRecentFilesPicker };
