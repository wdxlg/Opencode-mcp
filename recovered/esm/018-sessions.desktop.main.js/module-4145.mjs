// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/externalTerminal/electron-browser/externalTerminal.contribution.ts
import { KeybindingsRegistry } from "./module-0091.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { IHistoryService } from "./module-1493.mjs";
import { IExternalTerminalService2 } from "./module-4144.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IRemoteAuthorityResolverService } from "./module-0896.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ILabelService } from "./module-0641.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Schemas } from "./module-0033.mjs";
import { dirname } from "./module-0026.mjs";
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { Extensions10 } from "./module-0872.mjs";


// src/vs/workbench/contrib/externalTerminal/electron-browser/externalTerminal.contribution.ts
var OPEN_NATIVE_CONSOLE_COMMAND_ID = "workbench.action.terminal.openNativeConsole";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: OPEN_NATIVE_CONSOLE_COMMAND_ID,
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 33 /* KeyC */,
  when: ContextKeyExpr.and(TerminalContextKeys.notFocus, IsSessionsWindowContext.negate()),
  weight: 200 /* WorkbenchContrib */,
  handler: async (accessor) => {
    const historyService = accessor.get(IHistoryService);
    const terminalService = accessor.get(IExternalTerminalService2);
    const configurationService = accessor.get(IConfigurationService);
    const remoteAuthorityResolverService = accessor.get(IRemoteAuthorityResolverService);
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const quickInputService = accessor.get(IQuickInputService);
    const labelService = accessor.get(ILabelService);
    const config = configurationService.getValue("terminal.external");
    const folders = workspaceContextService.getWorkspace().folders;
    let root;
    if (folders.length > 1) {
      const folderPicks = folders.map((folder) => ({
        label: folder.name,
        description: labelService.getUriLabel(folder.uri, { relative: true })
      }));
      const pick = await quickInputService.pick(folderPicks, {
        placeHolder: localize(15655, null)
      });
      if (!pick) {
        return;
      }
      root = folders[folderPicks.indexOf(pick)].uri;
    } else {
      root = historyService.getLastActiveWorkspaceRoot();
    }
    if (root?.scheme === Schemas.file) {
      terminalService.openTerminal(config, root.fsPath);
      return;
    }
    try {
      if (root?.scheme === Schemas.vscodeRemote) {
        const canonicalUri = await remoteAuthorityResolverService.getCanonicalURI(root);
        if (canonicalUri.scheme === Schemas.file) {
          terminalService.openTerminal(config, canonicalUri.fsPath);
          return;
        }
      }
    } catch {
    }
    const activeFile = historyService.getLastActiveFile(Schemas.file);
    if (activeFile?.scheme === Schemas.file) {
      terminalService.openTerminal(config, dirname(activeFile.fsPath));
      return;
    }
    try {
      if (activeFile?.scheme === Schemas.vscodeRemote) {
        const canonicalUri = await remoteAuthorityResolverService.getCanonicalURI(activeFile);
        if (canonicalUri.scheme === Schemas.file) {
          terminalService.openTerminal(config, canonicalUri.fsPath);
          return;
        }
      }
    } catch {
    }
    terminalService.openTerminal(config, void 0);
  }
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: OPEN_NATIVE_CONSOLE_COMMAND_ID,
    title: localize2(15654, "Open New External Terminal")
  }
});

var ExternalTerminalContribution2 = class {
  constructor(_externalTerminalService) {
    this._externalTerminalService = _externalTerminalService;
    this._updateConfiguration();
  }
  async _updateConfiguration() {
    const terminals = await this._externalTerminalService.getDefaultTerminalForPlatforms();
    const configurationRegistry25 = Registry.as(Extensions4.Configuration);
    const terminalKindProperties = {
      type: "string",
      enum: [
        "integrated",
        "external",
        "both"
      ],
      enumDescriptions: [
        localize(15662, null),
        localize(15661, null),
        localize(15660, null)
      ],
      default: "integrated"
    };
    configurationRegistry25.registerConfiguration({
      id: "externalTerminal",
      order: 100,
      title: localize(15663, null),
      type: "object",
      properties: {
        "terminal.explorerKind": {
          ...terminalKindProperties,
          description: localize(15653, null)
        },
        "terminal.sourceControlRepositoriesKind": {
          ...terminalKindProperties,
          description: localize(15656, null)
        },
        "terminal.external.windowsExec": {
          type: "string",
          description: localize(15659, null),
          default: terminals.windows,
          scope: 1 /* APPLICATION */
        },
        "terminal.external.osxExec": {
          type: "string",
          description: localize(15658, null),
          default: terminals.osx,
          scope: 1 /* APPLICATION */
        },
        "terminal.external.linuxExec": {
          type: "string",
          description: localize(15657, null),
          default: terminals.linux,
          scope: 1 /* APPLICATION */
        }
      }
    });
  }
};

ExternalTerminalContribution2 = __decorateClass([
  __decorateParam(0, IExternalTerminalService2)
], ExternalTerminalContribution2);

var workbenchRegistry9 = Registry.as(Extensions10.Workbench);

workbenchRegistry9.registerWorkbenchContribution(ExternalTerminalContribution2, 3 /* Restored */);
export { OPEN_NATIVE_CONSOLE_COMMAND_ID, ExternalTerminalContribution2, workbenchRegistry9 };
