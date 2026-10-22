// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/externalTerminal/browser/externalTerminal.contribution.ts
import { CommandsRegistry } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITerminalGroupService, ITerminalService } from "./module-1150.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IExternalTerminalService } from "./module-3246.mjs";
import { IExplorerService, getMultiSelectedResources } from "./module-1997.mjs";
import { IListService } from "./module-0636.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { distinct } from "./module-0007.mjs";
import { URI } from "./module-0032.mjs";
import { basename, dirname } from "./module-0026.mjs";
import { Disposable } from "./module-0012.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ResourceContextKey } from "./module-0950.mjs";
import { Schemas } from "./module-0033.mjs";
import { localize } from "./module-0001.mjs";
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { isWindows } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";


// src/vs/workbench/contrib/externalTerminal/browser/externalTerminal.contribution.ts
var OPEN_IN_TERMINAL_COMMAND_ID = "openInTerminal";

var OPEN_IN_INTEGRATED_TERMINAL_COMMAND_ID = "openInIntegratedTerminal";

function registerOpenTerminalCommand(id2, explorerKind) {
  CommandsRegistry.registerCommand({
    id: id2,
    handler: async (accessor, resource) => {
      const configurationService = accessor.get(IConfigurationService);
      const fileService = accessor.get(IFileService);
      const integratedTerminalService = accessor.get(ITerminalService);
      const remoteAgentService = accessor.get(IRemoteAgentService);
      const terminalGroupService = accessor.get(ITerminalGroupService);
      let externalTerminalService = void 0;
      try {
        externalTerminalService = accessor.get(IExternalTerminalService);
      } catch {
      }
      const resources = getMultiSelectedResources(resource, accessor.get(IListService), accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IExplorerService));
      return fileService.resolveAll(resources.map((r2) => ({ resource: r2 }))).then(async (stats) => {
        const config = configurationService.getValue();
        const useIntegratedTerminal = remoteAgentService.getConnection() || explorerKind === "integrated";
        const targets = distinct(stats.filter((data) => data.success));
        if (useIntegratedTerminal) {
          const opened = {};
          const cwds = targets.map(({ stat }) => {
            const resource2 = stat.resource;
            if (stat.isDirectory) {
              return resource2;
            }
            return URI.from({
              scheme: resource2.scheme,
              authority: resource2.authority,
              fragment: resource2.fragment,
              query: resource2.query,
              path: dirname(resource2.path)
            });
          });
          for (const cwd2 of cwds) {
            if (opened[cwd2.path]) {
              return;
            }
            opened[cwd2.path] = true;
            const instance2 = await integratedTerminalService.createTerminal({ config: { cwd: cwd2 } });
            if (instance2 && instance2.target !== 2 /* Editor */ && (resources.length === 1 || !resource || cwd2.path === resource.path || cwd2.path === dirname(resource.path))) {
              integratedTerminalService.setActiveInstance(instance2);
              terminalGroupService.showPanel(true);
            }
          }
        } else if (externalTerminalService) {
          distinct(targets.map(({ stat }) => stat.isDirectory ? stat.resource.fsPath : dirname(stat.resource.fsPath))).forEach((cwd2) => {
            externalTerminalService.openTerminal(config.terminal.external, cwd2);
          });
        }
      });
    }
  });
}

registerOpenTerminalCommand(OPEN_IN_TERMINAL_COMMAND_ID, "external");

registerOpenTerminalCommand(OPEN_IN_INTEGRATED_TERMINAL_COMMAND_ID, "integrated");

var ExternalTerminalContribution = class extends Disposable {
  constructor(_configurationService) {
    super();
    this._configurationService = _configurationService;
    const shouldShowIntegratedOnLocal = ContextKeyExpr.and(
      ResourceContextKey.Scheme.isEqualTo(Schemas.file),
      ContextKeyExpr.or(ContextKeyExpr.equals("config.terminal.explorerKind", "integrated"), ContextKeyExpr.equals("config.terminal.explorerKind", "both"))
    );
    const shouldShowExternalKindOnLocal = ContextKeyExpr.and(
      ResourceContextKey.Scheme.isEqualTo(Schemas.file),
      ContextKeyExpr.or(ContextKeyExpr.equals("config.terminal.explorerKind", "external"), ContextKeyExpr.equals("config.terminal.explorerKind", "both"))
    );
    this._openInIntegratedTerminalMenuItem = {
      group: "navigation",
      order: 30,
      command: {
        id: OPEN_IN_INTEGRATED_TERMINAL_COMMAND_ID,
        title: localize(15651, null)
      },
      when: ContextKeyExpr.or(shouldShowIntegratedOnLocal, ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeRemote))
    };
    this._openInTerminalMenuItem = {
      group: "navigation",
      order: 31,
      command: {
        id: OPEN_IN_TERMINAL_COMMAND_ID,
        title: localize(15650, null)
      },
      when: shouldShowExternalKindOnLocal
    };
    MenuRegistry.appendMenuItem(MenuId.ExplorerContext, this._openInTerminalMenuItem);
    MenuRegistry.appendMenuItem(MenuId.ExplorerContext, this._openInIntegratedTerminalMenuItem);
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("terminal.explorerKind") || e4.affectsConfiguration("terminal.external")) {
        this._refreshOpenInTerminalMenuItemTitle();
      }
    }));
    this._refreshOpenInTerminalMenuItemTitle();
  }
  isWindows() {
    const config = this._configurationService.getValue().terminal;
    if (isWindows && config.external?.windowsExec) {
      const file = basename(config.external.windowsExec);
      if (file === "wt" || file === "wt.exe") {
        return true;
      }
    }
    return false;
  }
  _refreshOpenInTerminalMenuItemTitle() {
    if (this.isWindows()) {
      this._openInTerminalMenuItem.command.title = localize(15652, null);
    }
  }
};

ExternalTerminalContribution = __decorateClass([
  __decorateParam(0, IConfigurationService)
], ExternalTerminalContribution);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(ExternalTerminalContribution, 3 /* Restored */);
export { registerOpenTerminalCommand, OPEN_IN_TERMINAL_COMMAND_ID, OPEN_IN_INTEGRATED_TERMINAL_COMMAND_ID, ExternalTerminalContribution };
