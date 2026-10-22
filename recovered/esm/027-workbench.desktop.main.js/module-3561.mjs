// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted.contribution.ts
// Retire the legacy walkthrough UI; retain platform configuration and the current Bridge route.
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { ICommandService } from "./module-0087.mjs";
import { Registry } from "./module-0090.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { isLinux, isMacintosh, isWindows } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionManagementServerService } from "./module-1046.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { workbenchConfigurationNodeBase } from "./module-1112.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { StartupPageRunnerContribution } from "./module-3554.mjs";

var category8 = "OpenCode";

// Keep the command ID for existing links, without exposing the retired welcome page.
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.openWalkthrough",
      title: { value: "OpenCode：Bridge", original: "OpenCode: Bridge" },
      category: Categories.Help,
      f1: true,
      menu: { id: MenuId.MenubarHelpMenu, group: "1_opencode_bridge", order: 1 }
    });
  }
  run(accessor) {
    return accessor.get(ICommandService).executeCommand("aiCustomization.openManagementEditor", "bridge", void 0, { toFront: true });
  }
});

var WorkspacePlatform = new RawContextKey("workspacePlatform", void 0, localize(21944, null));

var WorkspacePlatformContribution = class {
  constructor(extensionManagementServerService, remoteAgentService, contextService) {
    this.extensionManagementServerService = extensionManagementServerService;
    this.remoteAgentService = remoteAgentService;
    this.contextService = contextService;
    this.remoteAgentService.getEnvironment().then((env2) => {
      const remoteOS = env2?.os;
      const remotePlatform = remoteOS === 2 /* Macintosh */ ? "mac" : remoteOS === 1 /* Windows */ ? "windows" : remoteOS === 3 /* Linux */ ? "linux" : void 0;
      if (remotePlatform) {
        WorkspacePlatform.bindTo(this.contextService).set(remotePlatform);
      } else if (this.extensionManagementServerService.localExtensionManagementServer) {
        if (isMacintosh) {
          WorkspacePlatform.bindTo(this.contextService).set("mac");
        } else if (isLinux) {
          WorkspacePlatform.bindTo(this.contextService).set("linux");
        } else if (isWindows) {
          WorkspacePlatform.bindTo(this.contextService).set("windows");
        }
      } else if (this.extensionManagementServerService.webExtensionManagementServer) {
        WorkspacePlatform.bindTo(this.contextService).set("webworker");
      } else {
        console.error("Error: Unable to detect workspace platform");
      }
    });
  }
  static {
    this.ID = "workbench.contrib.workspacePlatform";
  }
};

WorkspacePlatformContribution = __decorateClass([
  __decorateParam(0, IExtensionManagementServerService),
  __decorateParam(1, IRemoteAgentService),
  __decorateParam(2, IContextKeyService)
], WorkspacePlatformContribution);

var configurationRegistry21 = Registry.as(Extensions4.Configuration);
configurationRegistry21.registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    "workbench.startupEditor": {
      scope: 5 /* RESOURCE */,
      type: "string",
      enum: ["none", "readme", "newUntitledFile", "terminal"],
      enumDescriptions: [localize(21936, null), localize(21937, null), localize(21935, null), localize(21938, null)],
      default: "none",
      description: localize(21933, null),
      agentsWindow: { default: "none", readOnly: true }
    }
  }
});

registerWorkbenchContribution2(WorkspacePlatformContribution.ID, WorkspacePlatformContribution, WorkbenchPhase.AfterRestored);
registerWorkbenchContribution2(StartupPageRunnerContribution.ID, StartupPageRunnerContribution, WorkbenchPhase.AfterRestored);
export { category8, WorkspacePlatform, WorkspacePlatformContribution, configurationRegistry21 };
