// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/electron-browser/actions/vscodeActions.ts
import { Action2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IsAuxiliaryWindowContext } from "./module-0950.mjs";
import { IsPhoneLayoutContext, SessionsWelcomeVisibleContext } from "./module-1770.mjs";
import { Menus } from "./module-3437.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { logSessionsInteraction } from "./module-1781.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IRemoteAgentHostService } from "./module-1736.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { resolveRemoteFolderUri } from "./module-4225.mjs";
import { OPEN_VSCODE_WINDOW_COMMAND_ID, RETURN_TO_VSCODE_EDITOR_COMMAND_ID, SHOULD_SHOW_RETURN_TO_VSCODE_EDITOR_COMMAND_ID } from "./module-1800.mjs";
import { getWindowId } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { Disposable } from "./module-0012.mjs";
import { OpenInVSCodeTitleBarWidget } from "./module-4224.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/sessions/electron-browser/actions/vscodeActions.ts
var OpenSessionInVSCodeAction = class _OpenSessionInVSCodeAction extends Action2 {
  static {
    this.ID = "agents.openSessionInVSCode";
  }
  constructor() {
    super({
      id: _OpenSessionInVSCodeAction.ID,
      title: localize2(5625, "Open in Editor"),
      icon: Codicon.vscodeInsiders,
      precondition: ContextKeyExpr.and(IsAuxiliaryWindowContext.toNegated(), SessionsWelcomeVisibleContext.toNegated()),
      menu: [{
        id: Menus.TitleBarCenterRight,
        group: "navigation",
        order: 7,
        when: ContextKeyExpr.and(IsAuxiliaryWindowContext.toNegated(), SessionsWelcomeVisibleContext.toNegated(), IsPhoneLayoutContext.negate())
      }]
    });
  }
  async run(accessor) {
    const telemetryService = accessor.get(ITelemetryService);
    logSessionsInteraction(telemetryService, "openInVSCode");
    const sessionsService = accessor.get(ISessionsService);
    const sessionsProvidersService = accessor.get(ISessionsProvidersService);
    const remoteAgentHostService = accessor.get(IRemoteAgentHostService);
    const nativeHostService = accessor.get(INativeHostService);
    const folderUri = this.getFolderUriToOpen(sessionsService, sessionsProvidersService, remoteAgentHostService);
    if (!folderUri) {
      return nativeHostService.openWindow();
    }
    const chatSessionToOpen = getChatSessionToOpenInEditor(sessionsService.activeSession.get());
    return nativeHostService.openWindow([{ folderUri }], { forceNewWindow: true, chatSessionToOpen });
  }
  getFolderUriToOpen(sessionsService, sessionsProvidersService, remoteAgentHostService) {
    const activeSession = sessionsService.activeSession.get();
    if (!activeSession) {
      return void 0;
    }
    const workspace = activeSession.workspace.get();
    const rawFolderUri = workspace?.folders[0]?.workingDirectory;
    if (!rawFolderUri) {
      return void 0;
    }
    return resolveRemoteFolderUri(rawFolderUri, activeSession.providerId, sessionsProvidersService, remoteAgentHostService);
  }
};

function getChatSessionToOpenInEditor(session) {
  return session?.isCreated.get() ? session.resource : void 0;
}

var OpenVSCodeWindowAction = class _OpenVSCodeWindowAction extends Action2 {
  static {
    this.ID = OPEN_VSCODE_WINDOW_COMMAND_ID;
  }
  constructor() {
    super({
      id: _OpenVSCodeWindowAction.ID,
      title: localize2(5626, "Open VS Code Window"),
      f1: true,
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 31 /* KeyA */,
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const windows = await nativeHostService.getWindows({ includeAuxiliaryWindows: false });
    const currentWindowId = getWindowId(mainWindow);
    const vscodeWindow = windows.find((w) => w.id !== currentWindowId);
    if (vscodeWindow) {
      await nativeHostService.focusWindow({ targetWindowId: vscodeWindow.id });
    } else {
      await nativeHostService.openWindow();
    }
  }
};

var ReturnToVSCodeEditorAction = class extends Action2 {
  constructor() {
    super({
      id: RETURN_TO_VSCODE_EDITOR_COMMAND_ID,
      title: localize2(5627, "Return to VS Code Editor")
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    await returnToVSCodeEditor(nativeHostService, getWindowId(mainWindow));
  }
};

var ShouldShowReturnToVSCodeEditorAction = class extends Action2 {
  constructor() {
    super({
      id: SHOULD_SHOW_RETURN_TO_VSCODE_EDITOR_COMMAND_ID,
      title: localize2(5628, "Check Whether to Show Return to VS Code Editor")
    });
  }
  async run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const windows = await nativeHostService.getWindows({ includeAuxiliaryWindows: false });
    return shouldShowReturnToVSCodeEditor(windows, getWindowId(mainWindow));
  }
};

function shouldShowReturnToVSCodeEditor(windows, currentWindowId) {
  return !windows.some((window2) => window2.id !== currentWindowId);
}

async function returnToVSCodeEditor(nativeHostService, currentWindowId) {
  await nativeHostService.openWindow();
  await nativeHostService.closeWindow({ targetWindowId: currentWindowId });
}

var OpenInVSCodeWidgetContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.openInVSCode.widget";
  }
  constructor(actionViewItemService, instantiationService) {
    super();
    this._register(actionViewItemService.register(Menus.TitleBarCenterRight, OpenSessionInVSCodeAction.ID, (action, options3) => {
      return instantiationService.createInstance(OpenInVSCodeTitleBarWidget, action, options3, OpenVSCodeWindowAction.ID);
    }, void 0));
  }
};

OpenInVSCodeWidgetContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IInstantiationService)
], OpenInVSCodeWidgetContribution);
export { getChatSessionToOpenInEditor, shouldShowReturnToVSCodeEditor, returnToVSCodeEditor, OpenSessionInVSCodeAction, OpenVSCodeWindowAction, ReturnToVSCodeEditorAction, ShouldShowReturnToVSCodeEditorAction, OpenInVSCodeWidgetContribution };
